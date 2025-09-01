import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { DatabaseConstruct } from "./database.js";
import { LambdaConstructor } from "./lambda.js";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

interface ApiConstructProps {
  database: DatabaseConstruct;
  lambda: LambdaConstructor;
}

export class ApiConstruct extends Construct {
  public readonly api: apigwv2.HttpApi;
  public readonly url: string;
  public readonly database: DatabaseConstruct;
  public readonly userIntegration: HttpLambdaIntegration;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);
    this.database = props.database;
    this.userIntegration = new HttpLambdaIntegration(
      "UserLambdaIntegration",
      props.lambda.lambdaFunction
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
    });

    this.api.addRoutes({
      path: "/users/{id}",
      methods: [
        apigwv2.HttpMethod.GET,
        apigwv2.HttpMethod.PUT,
        apigwv2.HttpMethod.DELETE,
      ],
      integration: this.userIntegration,
    });
  }
}
