import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUser } from "../types/indexjs";
import { logger } from "../utils/index.js";

export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({});
  }

  extractUserFromJWT(event: any): CognitoUser | null {
    try {
      const claims = event.requestContext?.authorizer?.jwt?.claims;

      if (!claims) {
        logger.warn("No JWT claims found in request context");
        return null;
      }

      return {
        sub: claims.sub,
        email: claims.email,
        email_verified: claims.email_verified === "true",
        ...claims,
      };
    } catch (error) {
      logger.error("Error extracting user from JWT:", error);
      return null;
    }
  }

  async validateAccessToken(accessToken: string): Promise<CognitoUser | null> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const result = await this.cognitoClient.send(command);

      const userAttributes = result.UserAttributes?.reduce((acc, attr) => {
        if (attr.Name) {
          acc[attr.Name] = attr.Value || "";
        }
        return acc;
      }, {} as Record<string, string>);

      return {
        sub: result.Username || "",
        email: userAttributes?.email || "",
        email_verified: userAttributes?.email_verified === "true",
        ...userAttributes,
      };
    } catch (error) {
      logger.error("Error validating access token:", error);
      return null;
    }
  }
}
