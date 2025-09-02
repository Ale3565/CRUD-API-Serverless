import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { UserService } from "../services/index.js";
import { AuthService } from "../services/index.js";
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  logger,
} from "../utils/index.js";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../utils/index.js";
import {
  ApiGatewayEvent,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/index.js";

const userService = new UserService();
const authService = new AuthService();

export const handler: APIGatewayProxyHandlerV2 = async (event: ApiGatewayEvent) => {
  logger.info("Event received:", {
    httpMethod: event.requestContext.http.method,
    path: event.requestContext.http.path,
    pathParameters: event.pathParameters,
  });

  try {
    const { requestContext, pathParameters, body } = event;
    const httpMethod = requestContext.http.method;
    const path = requestContext.http.path;

    
    if (httpMethod === "OPTIONS") {
      return createSuccessResponse({ message: "OK" });
    }

    
    if (path === "/health") {
      try {
        const healthStatus = await userService.healthCheck();
        return createSuccessResponse(healthStatus);
      } catch (error) {
        logger.error("Health check failed:", error);
        return createErrorResponse("Service unhealthy", 503);
      }
    }

    
    const cognitoUser = authService.extractUserFromJWT(event);
    const currentUserId = cognitoUser?.sub;

    
    switch (httpMethod) {
      case "GET":
        return await handleGetRequest(pathParameters);

      case "POST":
        return await handlePostRequest(body || null, currentUserId);

      case "PUT":
        return await handlePutRequest(pathParameters, body || null, currentUserId);

      case "DELETE":
        return await handleDeleteRequest(pathParameters);

      default:
        return createErrorResponse(`Method ${httpMethod} not allowed`, 405);
    }
  } catch (error) {
    logger.error("Handler error:", error);
    return createErrorResponse(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

async function handleGetRequest(pathParameters: any) {
  try {
    if (pathParameters?.id) {
      
      const user = await userService.getUserById(pathParameters.id);
      
      if (!user) {
        return createErrorResponse("User not found", 404);
      }

      return createSuccessResponse({
        message: "User retrieved successfully",
        user,
      });
    }

    
    const result = await userService.getAllUsers();
    return createSuccessResponse({
      message: "Users retrieved successfully",
      users: result.items,
      count: result.count,
      hasMore: result.hasMore,
    });
  } catch (error) {
    logger.error("Error in GET request:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Error retrieving users",
      500
    );
  }
}

async function handlePostRequest(body: string | null, currentUserId?: string) {
  try {
    if (!body) {
      return createErrorResponse("Request body is required", 400);
    }

    let userData: CreateUserRequest;
    try {
      userData = JSON.parse(body);
    } catch (parseError) {
      return createErrorResponse("Invalid JSON in request body", 400);
    }

    
    const validationErrors = validateCreateUser(userData);
    if (validationErrors.length > 0) {
      return createValidationErrorResponse(validationErrors);
    }

    
    const user = await userService.createUser(userData, currentUserId);

    return createSuccessResponse(
      {
        message: "User created successfully",
        user,
      },
      201
    );
  } catch (error) {
    logger.error("Error in POST request:", error);
    
    if (error instanceof Error) {
      if (error.message === "Email already in use") {
        return createErrorResponse(error.message, 409);
      }
      if (error.message === "Invalid user ID format") {
        return createErrorResponse(error.message, 400);
      }
    }

    return createErrorResponse(
      error instanceof Error ? error.message : "Error creating user",
      500
    );
  }
}

async function handlePutRequest(
  pathParameters: any,
  body: string | null,
  currentUserId?: string
) {
  try {
    if (!pathParameters?.id) {
      return createErrorResponse("User ID is required in path", 400);
    }

    if (!body) {
      return createErrorResponse("Request body is required", 400);
    }

    let updateData: UpdateUserRequest;
    try {
      updateData = JSON.parse(body);
    } catch (parseError) {
      return createErrorResponse("Invalid JSON in request body", 400);
    }

    
    const validationErrors = validateUpdateUser(updateData);
    if (validationErrors.length > 0) {
      return createValidationErrorResponse(validationErrors);
    }

    
    const hasFieldsToUpdate = Object.keys(updateData).some(
      (key) => updateData[key as keyof UpdateUserRequest] !== undefined
    );

    if (!hasFieldsToUpdate) {
      return createErrorResponse("No fields to update", 400);
    }

    
    const user = await userService.updateUser(
      pathParameters.id,
      updateData,
      currentUserId
    );

    return createSuccessResponse({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    logger.error("Error in PUT request:", error);
    
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return createErrorResponse(error.message, 404);
      }
      if (error.message === "Email already in use by another user") {
        return createErrorResponse(error.message, 409);
      }
      if (error.message === "Invalid user ID format") {
        return createErrorResponse(error.message, 400);
      }
    }

    return createErrorResponse(
      error instanceof Error ? error.message : "Error updating user",
      500
    );
  }
}

async function handleDeleteRequest(pathParameters: any) {
  try {
    if (!pathParameters?.id) {
      return createErrorResponse("User ID is required in path", 400);
    }

    const deletedUser = await userService.deleteUser(pathParameters.id);

    return createSuccessResponse({
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    logger.error("Error in DELETE request:", error);
    
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return createErrorResponse(error.message, 404);
      }
      if (error.message === "Invalid user ID format") {
        return createErrorResponse(error.message, 400);
      }
    }

    return createErrorResponse(
      error instanceof Error ? error.message : "Error deleting user",
      500
    );
  }
}
