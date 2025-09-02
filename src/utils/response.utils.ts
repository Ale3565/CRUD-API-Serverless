import { ApiResponse } from "../types/index.js";

export const createApiResponse = (
  statusCode: number,
  body: any,
  additionalHeaders: Record<string, string> = {}
): ApiResponse => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    ...additionalHeaders,
  },
  body: JSON.stringify(body),
});

export const createSuccessResponse = (
  data: any,
  statusCode: number = 200
): ApiResponse => {
  return createApiResponse(statusCode, data);
};

export const createErrorResponse = (
  message: string,
  statusCode: number = 500,
  error?: string | string[]
): ApiResponse => {
  const errorBody = {
    message,
    statusCode,
    ...(error && { error }),
  };

  return createApiResponse(statusCode, errorBody);
};

export const createValidationErrorResponse = (
  errors: string[]
): ApiResponse => {
  return createApiResponse(400, {
    message: "Validation failed",
    errors,
    statusCode: 400,
  });
};
