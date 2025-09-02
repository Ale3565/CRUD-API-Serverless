import { APIGatewayProxyEventV2 } from "aws-lambda";

export interface ApiGatewayEvent extends Omit<APIGatewayProxyEventV2, 'requestContext'> {
  requestContext: APIGatewayProxyEventV2['requestContext'] & {
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
