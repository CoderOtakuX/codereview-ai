import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { connection } from "@/lib/queue";
import { reviewCode } from "@/lib/groq";
import { db } from "@/db";
import { reviewsTable } from "@/db/schema";
import { logger } from "@/server";

logger.info("Initializing review worker...");

export const reviewWorker = new Worker(
	"review-queue",
	async (job) => {
		const { reviewId, code, language } = job.data;
		
		try {
			// Update status to processing
			await db.update(reviewsTable)
				.set({ status: "processing" })
				.where(eq(reviewsTable.id, reviewId));

			// Call Groq API
			const result = await reviewCode(code, language);

			// Update status to completed and save result
			await db.update(reviewsTable)
				.set({ status: "completed", result })
				.where(eq(reviewsTable.id, reviewId));

			logger.info(`Job ${job.id} completed for review ${reviewId}`);
		} catch (error) {
			logger.error(`Job ${job.id} failed for review ${reviewId}: ${(error as Error).message}`);
			
			// Update status to failed
			await db.update(reviewsTable)
				.set({ status: "failed" })
				.where(eq(reviewsTable.id, reviewId));
				
			throw error;
		}
	},
	{ connection: connection as any }
);

reviewWorker.on("failed", (job, err) => {
	logger.error(`Job \${job?.id} has failed with \${err.message}`);
});
