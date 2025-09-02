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

export interface QueryOptions {
  limit?: number;
  lastEvaluatedKey?: any;
  filterExpression?: string;
  expressionAttributeValues?: { [key: string]: any };
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  lastEvaluatedKey?: any;
  hasMore: boolean;
}
