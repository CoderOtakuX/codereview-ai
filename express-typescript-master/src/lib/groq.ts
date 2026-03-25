import { env } from "@/common/utils/envConfig";
import { z } from "zod";

export const ReviewResultSchema = z.object({
	summary: z.string(),
	score: z.number().min(1).max(10),
	codeOverview: z.object({
		purpose: z.string(),
		techStack: z.array(z.string()),
		complexity: z.enum(["beginner", "intermediate", "advanced"]),
	}).optional(),
	issues: z.array(
		z.object({
			severity: z.enum(["high", "medium", "low"]),
			type: z.enum(["bug", "security", "performance", "style"]),
			line: z.number().nullable(),
			message: z.string(),
			suggestion: z.string(),
			explanation: z.string(),
			affectedCode: z.string(),
			fixedCode: z.string(),
			docUrl: z.string().optional(),
			codeExample: z.string().optional(),
			pattern: z.string().optional(),
		})
	),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

export async function reviewCode(code: string, language: string): Promise<ReviewResult> {
	const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.GROQ_API_KEY}`,
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			response_format: { type: "json_object" },
			messages: [
				{
					role: "system",
					content: `You are an expert AI code mentor for junior developers. Your job is not just to find problems — you must TEACH why something is wrong and how to fix it properly.

You must return ONLY valid, raw JSON matching this exact format:
{
  "summary": "A rich 3-4 sentence summary. Start with what this code does (e.g. 'This is a REST API authentication handler that...'). Then describe the overall quality, key strengths, and main concerns.",
  "score": number (1-10),
  "codeOverview": {
    "purpose": "One line describing what this code is trying to accomplish",
    "techStack": ["detected libraries/frameworks, e.g. Express", "React", "NumPy"],
    "complexity": "beginner" | "intermediate" | "advanced"
  },
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "type": "bug" | "security" | "performance" | "style",
      "line": number | null,
      "message": "What is wrong (one sentence)",
      "suggestion": "How to fix it (one sentence)",
      "explanation": "WHY this is a problem written for a junior developer to understand. Explain the concept behind it — what could go wrong, what best practice is being violated, and why it matters in production. 2-3 sentences.",
      "affectedCode": "The exact problematic code snippet (1-5 lines max)",
      "fixedCode": "The corrected code snippet (1-5 lines max)",
      "docUrl": "URL to official documentation (MDN, Python docs, Go docs, React docs, etc.) relevant to this issue. Use real URLs only.",
      "codeExample": "A short corrected code snippet (2-5 lines max) showing the proper way to write this",
      "pattern": "Name of the design pattern or best practice being violated (e.g. 'Guard Clause', 'Single Responsibility', 'Input Validation', 'Error Boundary')"
    }
  ]
}

RULES:
- The summary MUST describe what the code does, not just say "this code has issues"
- Every issue MUST include explanation field — this is the teaching part
- docUrl should be real, relevant documentation URLs (e.g. https://developer.mozilla.org/..., https://docs.python.org/3/..., https://react.dev/...)
- For each issue, extract the EXACT code snippet that needs fixing into "affectedCode"
- Provide the corrected version in "fixedCode"
- Keep code snippets concise (1-5 lines)
- codeExample should be short, corrected code — not the entire file
- pattern should be a named concept the developer can Google
- If the code is good, still give at least 1-2 style/improvement suggestions
- Be encouraging but honest — this is a learning tool`,
				},
				{
					role: "user",
					content: `Please review this ${language} code:\n\n${code}`,
				},
			],
			temperature: 0.1,
		}),
	});

	if (!response.ok) {
		throw new Error(`Groq API error: ${response.statusText}`);
	}

	const data = (await response.json()) as any;
	const content = data.choices[0].message.content;

	try {
		const parsed = JSON.parse(content);
		return ReviewResultSchema.parse(parsed);
	} catch (err) {
		throw new Error(`Failed to parse Groq response: ${(err as Error).message}`);
	}
}

export async function chatWithReview(
	code: string,
	reviewResult: ReviewResult,
	userMessage: string,
	language: string
): Promise<string> {
	const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.GROQ_API_KEY}`,
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [
				{
					role: "system",
					content: `You are an AI code mentor. The user has submitted ${language} code for review and received feedback. Now they want to ask follow-up questions. You have full context of their code and the review.

Be helpful, encouraging, and teach concepts clearly. If they ask about system design, explain architecture patterns relevant to their code. If they ask about a specific function, show them how to improve it with examples. Keep responses concise but educational (under 300 words). Use markdown formatting for code blocks.

ORIGINAL CODE:
\`\`\`${language}
${code}
\`\`\`

REVIEW SUMMARY: ${reviewResult.summary}
SCORE: ${reviewResult.score}/10
ISSUES FOUND: ${reviewResult.issues.length}`,
				},
				{
					role: "user",
					content: userMessage,
				},
			],
			temperature: 0.3,
		}),
	});

	if (!response.ok) {
		throw new Error(`Groq API error: ${response.statusText}`);
	}

	const data = (await response.json()) as any;
	return data.choices[0].message.content;
}
