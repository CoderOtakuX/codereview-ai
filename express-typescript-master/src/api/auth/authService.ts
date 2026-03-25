import { StatusCodes } from "http-status-codes";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { signToken } from "@/common/utils/jwt";
import type { z } from "zod";
import type { RegisterSchema, LoginSchema } from "./authSchemas";

export class AuthService {
	async register(body: z.infer<typeof RegisterSchema>["body"]): Promise<ServiceResponse<{ token: string } | null>> {
		try {
			const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
			if (existingUser.length > 0) {
				return ServiceResponse.failure("Email already in use", null, StatusCodes.CONFLICT);
			}

			const saltRounds = 10;
			const passwordHash = await bcrypt.hash(body.password, saltRounds);

			const newUser = await db.insert(usersTable).values({
				email: body.email,
				passwordHash,
			}).returning();

			const token = signToken(newUser[0].id);
			return ServiceResponse.success<{ token: string }>("User registered successfully", { token }, StatusCodes.CREATED);
		} catch (ex) {
			logger.error(`Error registering user: ${(ex as Error).message}`);
			return ServiceResponse.failure("An error occurred while registering user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async login(body: z.infer<typeof LoginSchema>["body"]): Promise<ServiceResponse<{ token: string } | null>> {
		try {
			const users = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
			if (users.length === 0) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			const user = users[0];
			const isMatch = await bcrypt.compare(body.password, user.passwordHash);
			if (!isMatch) {
				return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);
			}

			const token = signToken(user.id);
			return ServiceResponse.success<{ token: string }>("Login successful", { token }, StatusCodes.OK);
		} catch (ex) {
			logger.error(`Error during login: ${(ex as Error).message}`);
			return ServiceResponse.failure("An error occurred during login.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const authService = new AuthService();
