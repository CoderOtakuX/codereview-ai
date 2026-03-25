import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { RegisterSchema, LoginSchema } from "./authSchemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

const TokenResponseSchema = z.object({
	token: z.string(),
});

authRegistry.registerPath({
	method: "post",
	path: "/auth/register",
	tags: ["Auth"],
	request: {
		body: {
			content: { "application/json": { schema: RegisterSchema.shape.body } },
		},
	},
	responses: createApiResponse(TokenResponseSchema, "Success"),
});

authRouter.post("/register", validateRequest(RegisterSchema), authController.register);

authRegistry.registerPath({
	method: "post",
	path: "/auth/login",
	tags: ["Auth"],
	request: {
		body: {
			content: { "application/json": { schema: LoginSchema.shape.body } },
		},
	},
	responses: createApiResponse(TokenResponseSchema, "Success"),
});

authRouter.post("/login", validateRequest(LoginSchema), authController.login);
