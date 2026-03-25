import { z } from "zod";

export const createReviewSchema = z.object({
	body: z.object({
		code: z.string().min(10).max(5000),
		language: z.enum(["javascript", "typescript", "python", "go", "java", "cpp", "other"]),
	}),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];



export const ReviewSchema = z.object({
	id: z.string(),
	userId: z.string(),
	code: z.string(),
	language: z.string(),
	status: z.string(),
	result: z.any().nullable().optional(),
	createdAt: z.union([z.date(), z.string()]).optional(),
});

export const ReviewStatusSchema = z.object({
	id: z.string(),
	status: z.string(),
});
