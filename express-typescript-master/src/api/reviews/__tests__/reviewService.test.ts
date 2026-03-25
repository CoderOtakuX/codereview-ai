import { StatusCodes } from "http-status-codes";
import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockQueryBuilder } = vi.hoisted(() => {
    const mqb: any = { _results: [] };
    mqb.from = vi.fn(() => mqb);
    mqb.where = vi.fn(() => mqb);
    mqb.orderBy = vi.fn(() => mqb);
    mqb.limit = vi.fn(() => mqb);
    mqb.offset = vi.fn(() => mqb);
    mqb.values = vi.fn(() => mqb);
    mqb.returning = vi.fn(() => mqb);
    mqb.then = function(resolve: any) { 
        const res = this._results.shift();
        resolve(res !== undefined ? res : []); 
    };
    return { mockQueryBuilder: mqb };
});

vi.mock("@/db", () => ({
    db: {
        select: vi.fn(() => mockQueryBuilder),
        insert: vi.fn(() => mockQueryBuilder),
    }
}));

vi.mock("@/lib/queue", () => ({
    reviewQueue: {
        add: vi.fn(),
    }
}));

import { reviewService } from "../reviewService";
import { reviewQueue } from "@/lib/queue";

describe("reviewService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQueryBuilder._results = [];
    });

    describe("createReview", () => {
        it("inserts row and calls reviewQueue.add with correct jobData", async () => {
            const mockReview = { id: "rev-1", code: "console.log(1)", language: "javascript", userId: "user-1", status: "pending" };
            mockQueryBuilder._results = [[mockReview]];

            const result = await reviewService.createReview("user-1", { code: "console.log(1)", language: "javascript" });

            expect(result.statusCode).toBe(StatusCodes.CREATED);
            expect(result.responseObject).toEqual(mockReview);
            
            // Verify background worker queue addition mapping
            expect(reviewQueue.add).toHaveBeenCalledWith("review-code", {
                reviewId: "rev-1",
                code: "console.log(1)",
                language: "javascript",
            });
        });
    });

    describe("getReview", () => {
        it("returns review for correct userId", async () => {
            const mockReview = { id: "rev-1", userId: "user-1", code: "secure-code" };
            mockQueryBuilder._results = [[mockReview]];

            const result = await reviewService.getReview("rev-1", "user-1");

            expect(result.statusCode).toBe(StatusCodes.OK);
            expect(result.responseObject).toEqual(mockReview);
        });

        it("throws 403 when userId doesn't match review.userId", async () => {
            const mockReview = { id: "rev-1", userId: "malicious-actor", code: "secret-code" };
            mockQueryBuilder._results = [[mockReview]];

            const result = await reviewService.getReview("rev-1", "user-1");

            expect(result.statusCode).toBe(StatusCodes.FORBIDDEN);
            expect(result.responseObject).toBeNull();
        });
    });

});
