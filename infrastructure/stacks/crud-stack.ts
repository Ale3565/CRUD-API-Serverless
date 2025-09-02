import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { DatabaseConstruct } from "../constructs/database.js";
import { CognitoConstruct } from "../constructs/auth.js";
import { LambdaConstructor } from "../constructs/lambda.js";
import { ApiConstruct } from "../constructs/api.js";
import * as cdk from "aws-cdk-lib";

export class CrudStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new DatabaseConstruct(this, "Database", {
      tableName: "users-table",
      partitionKey: "id",
    });

    const auth = new CognitoConstruct(this, "Auth", {
      userPoolName: "user-crud-pool",
    });

    const lambda = new LambdaConstructor(this, "Lambda", {
      table: database.table,
    });

    const api = new ApiConstruct(this, "Api", {
      database: database,
      lambda: lambda,
      auth: auth,
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "URL del API Gateway",
      exportName: "CrudApi-Url",
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: auth.userPool.userPoolId,
      description: "ID del User Pool de Cognito",
      exportName: "CrudApi-UserPoolId",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: auth.userPoolClient.userPoolClientId,
      description: "ID del Client del User Pool",
      exportName: "CrudApi-UserPoolClientId",
    });

    new cdk.CfnOutput(this, "CognitoRegion", {
      value: this.region,
      description: "Región de AWS donde está desplegado Cognito",
      exportName: "CrudApi-Region",
    });
  }
}
