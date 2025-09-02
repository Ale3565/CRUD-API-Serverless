import { APIGatewayProxyEventV2 } from "aws-lambda";

export interface ApiGatewayEvent extends APIGatewayProxyEventV2 {
  requestContext: {
    http: {
      method: string;
      path: string;
    };
    authorizer?: {
      jwt?: {
        claims: {
          sub: string;
          email: string;
          [key: string]: any;
        };
      };
    };
  };
  pathParameters?: {
    id?: string;
    [key: string]: string | undefined;
  } | null;
  body?: string | null;
}

export interface ApiResponse {
  statusCode: number;
  headers: {
    [key: string]: string;
  };
  body: string;
}

export interface CognitoUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  [key: string]: any;
}
