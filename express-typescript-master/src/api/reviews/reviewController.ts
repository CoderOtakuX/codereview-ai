import type { Request, RequestHandler, Response } from "express";
import { reviewService } from "./reviewService";

class ReviewController {
	public createReview: RequestHandler = async (req: Request, res: Response) => {
		const userId = res.locals.userId;
		const serviceResponse = await reviewService.createReview(userId, req.body);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getReview: RequestHandler = async (req: Request, res: Response) => {
		const userId = res.locals.userId;
		const reviewId = req.params.id as string;
		const serviceResponse = await reviewService.getReview(reviewId, userId);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getStatus: RequestHandler = async (req: Request, res: Response) => {
		const userId = res.locals.userId;
		const reviewId = req.params.id as string;
		const serviceResponse = await reviewService.getReview(reviewId, userId);
		
		if (serviceResponse.success && serviceResponse.responseObject) {
			const data = serviceResponse.responseObject;
			res.status(serviceResponse.statusCode).send({
				success: true,
				message: "Status retrieved",
				responseObject: { id: data.id, status: data.status },
				statusCode: serviceResponse.statusCode,
			});
			return;
		}
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const reviewController = new ReviewController();
