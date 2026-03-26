import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const unexpectedRequest: RequestHandler = (_req, res) => {
	res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Endpoint not found",
        responseObject: null,
        statusCode: StatusCodes.NOT_FOUND
    });
};

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || "An unexpected error occurred";
    
    // Log the error for internal tracking
	res.locals.err = err;
    
    res.status(statusCode).json({
        success: false,
        message,
        responseObject: null,
        statusCode
    });
};

export default (): [RequestHandler, ErrorRequestHandler] => [unexpectedRequest, globalErrorHandler];
