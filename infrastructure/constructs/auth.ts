import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";

interface CognitoConstructProps {
  userPoolName?: string;
}

export class CognitoConstruct extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);
    this.userPool = new cognito.UserPool(this, "userPool", {
      userPoolName: props.userPoolName,
      signInAliases: {
        email: true,
        username: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
      },
      autoVerify: {
        email: true,
      },
    });
    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
      userPoolClientName: "user-crud-client",

      authFlows: {
        userSrp: true,
        userPassword: true,
      },

      generateSecret: false,

      accessTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
    });
  }
}
