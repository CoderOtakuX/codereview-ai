import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import IORedis from "ioredis";
import { env } from "@/common/utils/envConfig";
import { reviewCode } from "@/lib/groq";
import { db } from "@/db";
import { reviewsTable } from "@/db/schema";
import { logger } from "@/server";

logger.info("Initializing review worker...");

const workerConnection = new IORedis(env.REDIS_URL, {
	maxRetriesPerRequest: null,
});

export const reviewWorker = new Worker(
	"review-queue",
	async (job) => {
		const { reviewId, code, language } = job.data;
		
		try {
			// Add a delay for rate limiting (4 seconds for better pacing)
			await new Promise(resolve => setTimeout(resolve, 4000));

			// Update status to processing
			await db.update(reviewsTable)
				.set({ status: "processing" })
				.where(eq(reviewsTable.id, reviewId));

			// Call Groq API
			const result = await reviewCode(code, language);

			// Update status to completed and save result
			await db.update(reviewsTable)
				.set({ 
					status: "completed", 
					result: result as any,
					errorMessage: null 
				})
				.where(eq(reviewsTable.id, reviewId));

			logger.info(`Job ${job.id} completed for review ${reviewId}`);
		} catch (error) {
			const errMsg = (error as Error).message;
			logger.error(`Job ${job.id} failed for review ${reviewId}: ${errMsg}`);
			
			// Update status to failed and save ERROR MESSAGE
			await db.update(reviewsTable)
				.set({ 
					status: "failed",
					errorMessage: errMsg 
				})
				.where(eq(reviewsTable.id, reviewId));
				
			throw error;
		}
	},
	{ 
		connection: workerConnection as any,
		limiter: {
			max: 10, // 10 jobs per minute
			duration: 60000
		}
	}
);

reviewWorker.on("failed", (job, err) => {
	logger.error(`Job \${job?.id} has failed with \${err.message}`);
});

reviewWorker.on("ready", () => {
	logger.info("Worker is ready and listening for jobs");
});

reviewWorker.on("active", (job) => {
	logger.info(`Worker started processing job \${job.id}`);
});

