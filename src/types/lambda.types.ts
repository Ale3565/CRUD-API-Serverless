export interface LambdaContext {
  callbackWaitsForEmptyEventLoop: boolean;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  remainingTimeInMillis: () => number;
  done: (error?: Error, result?: any) => void;
  fail: (error: Error | string) => void;
  succeed: (messageOrObject: any) => void;
}

export interface Environment {
  TABLE_NAME: string;
  COGNITO_USER_POOL_ID?: string;
  COGNITO_CLIENT_ID?: string;
  LOG_LEVEL?: "DEBUG" | "INFO" | "WARN" | "ERROR";
  NODE_ENV?: "development" | "staging" | "production";
}
