import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { DatabaseConstruct } from "./database.js";
import { LambdaConstructor } from "./lambda.js";
import { CognitoConstruct } from "./auth.js";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { Stack } from "aws-cdk-lib";

interface ApiConstructProps {
  database: DatabaseConstruct;
  lambda: LambdaConstructor;
  auth: CognitoConstruct;
}

export class ApiConstruct extends Construct {
  public readonly api: apigwv2.HttpApi;
  public readonly url: string;
  public readonly database: DatabaseConstruct;
  public readonly userIntegration: HttpLambdaIntegration;
  public readonly authorizer: HttpJwtAuthorizer;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);
    this.database = props.database;

    this.userIntegration = new HttpLambdaIntegration(
      "UserLambdaIntegration",
      props.lambda.lambdaFunction
    );

    this.authorizer = new HttpJwtAuthorizer(
      "CognitoAuthorizer",
      `https://cognito-idp.${Stack.of(this).region}.amazonaws.com/${
        props.auth.userPool.userPoolId
      }`,
      {
        jwtAudience: [props.auth.userPoolClient.userPoolClientId],
      }
    );

    this.api = new apigwv2.HttpApi(this, "CrudApi", {
      apiName: "user-crud-api",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowHeaders: ["*"],
      },
    });

    this.url = this.api.url || "URL not available";

    this.api.addRoutes({
      path: "/users",
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST],
      integration: this.userIntegration,
      authorizer: this.authorizer,
    });

    this.api.addRoutes({
      path: "/users/{id}",
      methods: [
        apigwv2.HttpMethod.GET,
        apigwv2.HttpMethod.PUT,
        apigwv2.HttpMethod.DELETE,
      ],
      integration: this.userIntegration,
      authorizer: this.authorizer,
    });

    this.api.addRoutes({
      path: "/health",
      methods: [apigwv2.HttpMethod.GET],
      integration: this.userIntegration,
    });
  }
}
