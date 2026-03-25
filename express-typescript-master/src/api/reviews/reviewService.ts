import { StatusCodes } from "http-status-codes";
import { eq, desc } from "drizzle-orm";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { db } from "@/db";
import { reviewsTable } from "@/db/schema";
import { reviewQueue } from "@/lib/queue";
import type { CreateReviewInput } from "./reviewSchemas";
import type { Review } from "@/db/schema";

export class ReviewService {
	async createReview(userId: string, input: CreateReviewInput): Promise<ServiceResponse<Review | null>> {
		try {
			const newReviews = await db.insert(reviewsTable).values({
				userId,
				code: input.code,
				language: input.language,
				status: "pending",
			}).returning();

			const review = newReviews[0];

			await reviewQueue.add("review-code", {
				reviewId: review.id,
				code: review.code,
				language: review.language,
			});

			return ServiceResponse.success<Review>("Review created and queued", review, StatusCodes.CREATED);
		} catch (ex) {
			logger.error(`Error creating review: ${(ex as Error).message}`);
			return ServiceResponse.failure("An error occurred while creating review.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getReview(reviewId: string, userId: string): Promise<ServiceResponse<Review | null>> {
		try {
			const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.id, reviewId));
			if (reviews.length === 0) {
				return ServiceResponse.failure("Review not found", null, StatusCodes.NOT_FOUND);
			}

			const review = reviews[0];
			if (review.userId !== userId) {
				return ServiceResponse.failure("Forbidden", null, StatusCodes.FORBIDDEN);
			}

			return ServiceResponse.success<Review>("Review found", review, StatusCodes.OK);
		} catch (ex) {
			logger.error(`Error finding review: ${(ex as Error).message}`);
			return ServiceResponse.failure("An error occurred while finding review.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}


}

export const reviewService = new ReviewService();
