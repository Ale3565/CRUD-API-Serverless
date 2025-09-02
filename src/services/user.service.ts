import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  DynamoDBUser,
  PaginatedResponse,
} from "../types/index.js";

import {
  generateUserId,
  isValidUUID,
  buildUpdateExpression,
  sanitizeUserData,
  logger,
} from "../utils/index.js";

export class UserService {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.TABLE_NAME || "users-table";
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      if (!isValidUUID(id)) {
        throw new Error("Invalid user ID format");
      }

      logger.debug(`Getting user by ID: ${id}`);

      const command = new GetCommand({
        TableName: this.tableName,
        Key: { id },
      });

      const result = await this.docClient.send(command);

      if (!result.Item) {
        logger.info(`User not found: ${id}`);
        return null;
      }

      logger.debug(`User retrieved successfully: ${id}`);
      return this.mapDynamoDBToUser(result.Item as DynamoDBUser);
    } catch (error) {
      logger.error("Error getting user by ID:", error);
      throw error;
    }
  }

  async getAllUsers(limit?: number): Promise<PaginatedResponse<User>> {
    try {
      logger.debug(`Getting all users with limit: ${limit || "unlimited"}`);

      const command = new ScanCommand({
        TableName: this.tableName,
        ...(limit && { Limit: limit }),
      });

      const result = await this.docClient.send(command);
      const users = (result.Items || []).map((item) =>
        this.mapDynamoDBToUser(item as DynamoDBUser)
      );

      logger.info(`Retrieved ${users.length} users`);

      return {
        items: users,
        count: result.Count || 0,
        lastEvaluatedKey: result.LastEvaluatedKey,
        hasMore: !!result.LastEvaluatedKey,
      };
    } catch (error) {
      logger.error("Error getting all users:", error);
      throw error;
    }
  }

  async createUser(
    userData: CreateUserRequest,
    createdBy?: string
  ): Promise<User> {
    try {
      logger.debug("Creating new user:", { email: userData.email });

      const sanitizedData = sanitizeUserData(userData);
      const now = new Date().toISOString();

      const user: DynamoDBUser = {
        id: generateUserId(),
        name: sanitizedData.name,
        email: sanitizedData.email,
        age: sanitizedData.age || null,
        phone: sanitizedData.phone || null,
        address: sanitizedData.address || null,
        createdAt: now,
        updatedAt: now,
        ...(createdBy && { createdBy }),
        version: 1,
      };

      const existingUser = await this.getUserByEmail(user.email);
      if (existingUser) {
        throw new Error("Email already in use");
      }

      const command = new PutCommand({
        TableName: this.tableName,
        Item: user,
        ConditionExpression: "attribute_not_exists(id)",
      });

      await this.docClient.send(command);

      logger.info(`User created successfully: ${user.id}`);
      return this.mapDynamoDBToUser(user);
    } catch (error) {
      logger.error("Error creating user:", error);

      if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
        throw new Error("User ID already exists");
      }

      throw error;
    }
  }

  async updateUser(
    id: string,
    userData: UpdateUserRequest,
    updatedBy?: string
  ): Promise<User> {
    try {
      if (!isValidUUID(id)) {
        throw new Error("Invalid user ID format");
      }

      logger.debug(`Updating user: ${id}`, userData);

      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      if (userData.email && userData.email !== existingUser.email) {
        const emailInUse = await this.getUserByEmail(userData.email);
        if (emailInUse && emailInUse.id !== id) {
          throw new Error("Email already in use by another user");
        }
      }

      const sanitizedData = sanitizeUserData(userData);
      const updateData = {
        ...sanitizedData,
        ...(updatedBy && { updatedBy }),
        version: (existingUser as any).version
          ? (existingUser as any).version + 1
          : 2,
      };

      const {
        updateExpression,
        expressionAttributeNames,
        expressionAttributeValues,
      } = buildUpdateExpression(updateData, ["id", "createdAt"]);

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "ALL_NEW",
      });

      const result = await this.docClient.send(command);

      logger.info(`User updated successfully: ${id}`);
      return this.mapDynamoDBToUser(result.Attributes as DynamoDBUser);
    } catch (error) {
      logger.error("Error updating user:", error);

      if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
        throw new Error("User not found");
      }

      throw error;
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      if (!isValidUUID(id)) {
        throw new Error("Invalid user ID format");
      }

      logger.debug(`Deleting user: ${id}`);

      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "ALL_OLD",
      });

      const result = await this.docClient.send(command);

      if (!result.Attributes) {
        throw new Error("User not found");
      }

      logger.info(`User deleted successfully: ${id}`);
      return this.mapDynamoDBToUser(result.Attributes as DynamoDBUser);
    } catch (error) {
      logger.error("Error deleting user:", error);

      if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
        throw new Error("User not found");
      }

      throw error;
    }
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    try {
      logger.debug(`Searching user by email: ${email}`);

      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email.toLowerCase().trim(),
        },
      });

      const result = await this.docClient.send(command);

      if (!result.Items || result.Items.length === 0) {
        return null;
      }

      return this.mapDynamoDBToUser(result.Items[0] as DynamoDBUser);
    } catch (error) {
      logger.error("Error searching user by email:", error);
      throw error;
    }
  }

  private mapDynamoDBToUser(item: DynamoDBUser): User {
    return {
      id: item.id,
      name: item.name,
      email: item.email,
      age: item.age || null,
      phone: item.phone || null,
      address: item.address || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    tableName: string;
    timestamp: string;
  }> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        Limit: 1,
      });

      await this.docClient.send(command);

      return {
        healthy: true,
        tableName: this.tableName,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Health check failed:", error);
      throw new Error("Service unhealthy");
    }
  }
}
