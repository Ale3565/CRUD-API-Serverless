export interface DynamoDBUser {
  id: string;
  name: string;
  email: string;
  age?: number;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  lastEvaluatedKey?: any;
  hasMore: boolean;
}

export interface UpdateExpressionBuilder {
  updateExpression: string;
  expressionAttributeNames: Record<string, string>;
  expressionAttributeValues: Record<string, any>;
}
