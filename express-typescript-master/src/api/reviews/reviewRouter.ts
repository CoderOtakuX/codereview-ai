import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router, type Request, type Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate } from "@/common/middleware/authenticate";
import { validateRequest } from "@/common/utils/httpHandlers";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { createReviewSchema, ReviewSchema, ReviewStatusSchema } from "./reviewSchemas";
import { reviewController } from "./reviewController";
import { upload } from "@/common/middleware/upload";
import { ServiceResponse } from "@/common/models/serviceResponse";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { reviewService } from "./reviewService";
import { env } from "@/common/utils/envConfig";
import { parsePRUrl, fetchPRFiles, extractCodeFromPatch, detectLanguage, parseRepoUrl, fetchRepoFiles, fetchRepoFileTree, fetchFileContent } from "@/lib/github";
import { chatWithReview, ReviewResultSchema } from "@/lib/groq";
import { generateGitPatch, generateMultiIssuePatch } from "@/common/utils/patchGenerator";

export const reviewRegistry = new OpenAPIRegistry();
export const reviewRouter: Router = express.Router();

reviewRegistry.register("Review", ReviewSchema);
reviewRegistry.register("ReviewStatus", ReviewStatusSchema);

reviewRegistry.registerPath({
	method: "post",
	path: "/reviews",
	tags: ["Review"],
	request: {
		body: {
			content: { "application/json": { schema: createReviewSchema.shape.body } },
		},
	},
	responses: createApiResponse(ReviewSchema, "Success"),
});
reviewRouter.post("/", authenticate, validateRequest(createReviewSchema), reviewController.createReview);

reviewRouter.post("/upload", authenticate, (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure(err.message, null, StatusCodes.BAD_REQUEST));
        }
        next();
    });
}, async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("No file uploaded", null, StatusCodes.BAD_REQUEST));
        }

        const content = req.file.buffer.toString("utf-8");
        const ext = path.extname(req.file.originalname).toLowerCase();

        const extMap: Record<string, string> = {
            ".js": "javascript",
            ".ts": "typescript",
            ".py": "python",
            ".go": "go",
            ".java": "java",
            ".cpp": "cpp",
        };
        const language = extMap[ext] || "javascript";

        const userId = res.locals.userId;
        const result = await reviewService.createReview(userId, { code: content, language: language as any });
        
        return res.status(result.statusCode).json(result);
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure((err as Error).message, null, StatusCodes.INTERNAL_SERVER_ERROR));
    }
});

reviewRouter.post("/github", authenticate, async (req: Request, res: Response) => {
    try {
        const { prUrl } = req.body;
        if (!prUrl) return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("prUrl is required", null, StatusCodes.BAD_REQUEST));
        
        const parsed = parsePRUrl(prUrl);
        if (!parsed) return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("Invalid GitHub PR URL", null, StatusCodes.BAD_REQUEST));
        
        let files;
        try {
            files = await fetchPRFiles(parsed.owner, parsed.repo, parsed.prNumber, env.GITHUB_TOKEN);
        } catch (apiErr: any) {
            return res.status(StatusCodes.BAD_GATEWAY).json(ServiceResponse.failure(apiErr.message, null, StatusCodes.BAD_GATEWAY));
        }

        const validFiles = files
            .filter(f => f.patch != null && f.status !== "removed" && detectLanguage(f.filename) !== "other")
            .slice(0, 20);

        if (validFiles.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("No valid code files found in PR", null, StatusCodes.BAD_REQUEST));
        }

        const userId = res.locals.userId;
        const reviews = [];

        for (const file of validFiles) {
            const code = extractCodeFromPatch(file.patch || "");
            const language = detectLanguage(file.filename);
            
            const result = await reviewService.createReview(userId, { code, language: language as any });
            if (result.success && result.responseObject) {
                reviews.push({ filename: file.filename, reviewId: result.responseObject.id, status: 'pending' });
            }
        }

        return res.status(StatusCodes.OK).json(ServiceResponse.success("PR queued for review", reviews, StatusCodes.OK));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure((err as Error).message, null, StatusCodes.INTERNAL_SERVER_ERROR));
    }
});

reviewRouter.get("/github-repo/files", authenticate, async (req: Request, res: Response) => {
    try {
        const repoUrl = req.query.url as string;
        if (!repoUrl) return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("url query param is required", null, StatusCodes.BAD_REQUEST));

        const parsed = parseRepoUrl(repoUrl);
        if (!parsed) return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("Invalid GitHub repo URL", null, StatusCodes.BAD_REQUEST));

        let files;
        try {
            files = await fetchRepoFileTree(parsed.owner, parsed.repo, env.GITHUB_TOKEN);
        } catch (apiErr: any) {
            return res.status(StatusCodes.BAD_GATEWAY).json(ServiceResponse.failure(apiErr.message, null, StatusCodes.BAD_GATEWAY));
        }

        return res.status(StatusCodes.OK).json(ServiceResponse.success("File tree fetched", files, StatusCodes.OK));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure((err as Error).message, null, StatusCodes.INTERNAL_SERVER_ERROR));
    }
});

reviewRouter.post("/github-repo", authenticate, async (req: Request, res: Response) => {
    try {
        const { selectedFiles } = req.body;
        if (!selectedFiles || !Array.isArray(selectedFiles) || selectedFiles.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("selectedFiles array is required", null, StatusCodes.BAD_REQUEST));
        }

        const userId = res.locals.userId;
        const reviews = [];

        for (const file of selectedFiles.slice(0, 20)) {
            try {
                const content = await fetchFileContent(file.url, env.GITHUB_TOKEN);
                const language = detectLanguage(file.path);
                const result = await reviewService.createReview(userId, { code: content, language: language as any });
                if (result.success && result.responseObject) {
                    reviews.push({ filename: file.path, reviewId: result.responseObject.id, status: 'pending' });
                }
            } catch {
                continue;
            }
        }

        if (reviews.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("Could not process any of the selected files", null, StatusCodes.BAD_REQUEST));
        }

        return res.status(StatusCodes.OK).json(ServiceResponse.success("Selected files queued for review", reviews, StatusCodes.OK));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure((err as Error).message, null, StatusCodes.INTERNAL_SERVER_ERROR));
    }
});



reviewRouter.post("/:id/chat", authenticate, async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("message is required", null, StatusCodes.BAD_REQUEST));
        }

        const userId = res.locals.userId;
        const reviewResult = await reviewService.getReview(req.params.id as string, userId);
        if (!reviewResult.success || !reviewResult.responseObject) {
            return res.status(reviewResult.statusCode).json(reviewResult);
        }

        const review = reviewResult.responseObject;
        if (review.status !== "completed" || !review.result) {
            return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("Review is not completed yet", null, StatusCodes.BAD_REQUEST));
        }

        const parsedResult = ReviewResultSchema.parse(review.result);
        const reply = await chatWithReview(review.code, parsedResult, message, review.language);

        return res.status(StatusCodes.OK).json(ServiceResponse.success("Chat reply", { reply }, StatusCodes.OK));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure((err as Error).message, null, StatusCodes.INTERNAL_SERVER_ERROR));
    }
});

reviewRegistry.registerPath({
	method: "get",
	path: "/reviews/{id}",
	tags: ["Review"],
	request: {
		params: z.object({ id: z.string() }),
	},
	responses: createApiResponse(ReviewSchema, "Success"),
});
reviewRouter.get("/:id", authenticate, reviewController.getReview);

reviewRegistry.registerPath({
	method: "get",
	path: "/reviews/{id}/status",
	tags: ["Review"],
	request: {
		params: z.object({ id: z.string() }),
	},
	responses: createApiResponse(ReviewStatusSchema, "Success"),
});
reviewRouter.get("/:id/status", authenticate, reviewController.getStatus);

// New endpoint: GET /reviews/:id/patch/:issueIndex
reviewRouter.get(
  "/:id/patch/:issueIndex",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const reviewId = req.params.id as string;
      const issueIndex = parseInt(req.params.issueIndex as string);
      const userId = res.locals.userId;

      const reviewResult = await reviewService.getReview(reviewId, userId);
      if (!reviewResult.success || !reviewResult.responseObject) {
         return res.status(StatusCodes.NOT_FOUND).json(ServiceResponse.failure("Review not found", null, StatusCodes.NOT_FOUND));
      }
      
      const review = reviewResult.responseObject;
      if (review.status !== "completed" || !review.result) {
          return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("Review is not completed or has no result", null, StatusCodes.BAD_REQUEST));
      }

      let parsedResult;
      try {
        parsedResult = typeof review.result === 'string' ? JSON.parse(review.result) : review.result;
      } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure("Failed to parse review result", null, StatusCodes.INTERNAL_SERVER_ERROR));
      }

      const issue = parsedResult.issues?.[issueIndex];
      if (!issue) {
        return res.status(StatusCodes.NOT_FOUND).json(ServiceResponse.failure("Issue not found", null, StatusCodes.NOT_FOUND));
      }

      if (!issue.affectedCode || !issue.fixedCode || issue.affectedCode.trim() === "" || issue.fixedCode.trim() === "") {
        return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("This issue does not contain valid code changes to generate a patch.", null, StatusCodes.BAD_REQUEST));
      }

      // Generate patch
      const filename = (review as any).filename || 'code.txt';
      const patch = generateGitPatch({
        filename,
        line: issue.line || 1,
        affectedCode: issue.affectedCode,
        fixedCode: issue.fixedCode
      });
      
      // Send as downloadable file
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="fix-line-${issue.line || 'all'}.patch"`);
      res.send(patch);
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure((err as Error).message, null, StatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
);

// New endpoint: GET /reviews/:id/patch (download all fixes as one patch)
reviewRouter.get(
  "/:id/patch",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const reviewId = req.params.id as string;
      const userId = res.locals.userId;

      const reviewResult = await reviewService.getReview(reviewId, userId);
      if (!reviewResult.success || !reviewResult.responseObject) {
         return res.status(StatusCodes.NOT_FOUND).json(ServiceResponse.failure("Review not found", null, StatusCodes.NOT_FOUND));
      }
      
      const review = reviewResult.responseObject;
      if (review.status !== "completed" || !review.result) {
          return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("Review is not completed or has no result", null, StatusCodes.BAD_REQUEST));
      }

      let parsedResult;
      try {
        parsedResult = typeof review.result === 'string' ? JSON.parse(review.result) : review.result;
      } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure("Failed to parse review result", null, StatusCodes.INTERNAL_SERVER_ERROR));
      }

      // Filter only issues that have affectedCode and fixedCode
      const validIssues = (parsedResult.issues || []).filter((issue: any) => 
        issue.affectedCode && issue.fixedCode && 
        issue.affectedCode.trim() !== "" && issue.fixedCode.trim() !== ""
      );

      if (validIssues.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(ServiceResponse.failure("No valid fixes found to generate a patch.", null, StatusCodes.BAD_REQUEST));
      }

      const filename = (review as any).filename || 'code.txt';
      
      const patch = generateMultiIssuePatch(
        filename,
        validIssues.map((issue: any) => ({
          line: issue.line || 1,
          affectedCode: issue.affectedCode,
          fixedCode: issue.fixedCode
        }))
      );
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}-fixes.patch"`);
      res.send(patch);
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ServiceResponse.failure((err as Error).message, null, StatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
);
