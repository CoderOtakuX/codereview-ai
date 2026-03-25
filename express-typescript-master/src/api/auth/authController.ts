import type { Request, RequestHandler, Response } from "express";
import { authService } from "./authService";

class AuthController {
	public register: RequestHandler = async (req: Request, res: Response) => {
		const serviceResponse = await authService.register(req.body);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public login: RequestHandler = async (req: Request, res: Response) => {
		const serviceResponse = await authService.login(req.body);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const authController = new AuthController();
