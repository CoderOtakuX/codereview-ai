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

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    }
}));

vi.mock("@/common/utils/jwt", () => ({
    signToken: vi.fn(),
}));

import { authService } from "../authService";
import bcrypt from "bcryptjs";
import { signToken } from "@/common/utils/jwt";

describe("authService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQueryBuilder._results = [];
    });

    describe("register", () => {
        it("happy path returns token", async () => {
            mockQueryBuilder._results = [
                [], // select returns empty (not found)
                [{ id: "test-user-id" }] // returning mock
            ];
            vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
            vi.mocked(signToken).mockReturnValue("fake-jwt-token");

            const result = await authService.register({ email: "test@test.com", password: "password123" });

            expect(result.statusCode).toBe(StatusCodes.CREATED);
            expect(result.success).toBe(true);
            expect(result.responseObject?.token).toBe("fake-jwt-token");
        });

        it("duplicate email throws 409 error", async () => {
            mockQueryBuilder._results = [
                [{ id: "existing-user" }]
            ];

            const result = await authService.register({ email: "test@test.com", password: "password123" });

            expect(result.statusCode).toBe(StatusCodes.CONFLICT);
            expect(result.success).toBe(false);
            expect(result.responseObject).toBeNull();
            expect(result.message).toBe("Email already in use");
        });
    });

    describe("login", () => {
        it("valid credentials return token", async () => {
            mockQueryBuilder._results = [
                [{ id: "user-1", passwordHash: "hashed_password" }]
            ];
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
            vi.mocked(signToken).mockReturnValue("fake-jwt-token");

            const result = await authService.login({ email: "test@test.com", password: "password123" });

            expect(result.statusCode).toBe(StatusCodes.OK);
            expect(result.success).toBe(true);
            expect(result.responseObject?.token).toBe("fake-jwt-token");
        });

        it("wrong password throws 401", async () => {
            mockQueryBuilder._results = [
                [{ id: "user-1", passwordHash: "hashed_password" }]
            ];
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

            const result = await authService.login({ email: "test@test.com", password: "wrong" });

            expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
            expect(result.success).toBe(false);
            expect(result.message).toBe("Invalid email or password");
        });

        it("user not found throws 404", async () => {
            mockQueryBuilder._results = [
                []
            ];

            const result = await authService.login({ email: "test@test.com", password: "password123" });

            expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
            expect(result.success).toBe(false);
            expect(result.message).toBe("User not found");
        });
    });
});
