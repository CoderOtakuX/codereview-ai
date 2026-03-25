import type { Request, Response, NextFunction } from "express";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "@/common/utils/jwt";
import { logger } from "@/server";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		const serviceResponse = ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED);
		res.status(serviceResponse.statusCode).send(serviceResponse);
		return;
	}

	const token = authHeader.split(" ")[1];
	try {
		const decoded = verifyToken(token);
		res.locals.userId = decoded.userId;
		next();
	} catch (error) {
		logger.error("Authentication error: " + (error as Error).message);
		const serviceResponse = ServiceResponse.failure("Invalid or expired token", null, StatusCodes.UNAUTHORIZED);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	}
};
