import { Queue } from "bullmq";
import { env } from "@/common/utils/envConfig";
import IORedis from "ioredis";

export const connection = new IORedis(env.REDIS_URL, {
	maxRetriesPerRequest: null,
});

export const reviewQueue = new Queue("review-queue", { connection: connection as any });
