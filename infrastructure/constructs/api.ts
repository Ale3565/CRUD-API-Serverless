import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { DatabaseConstruct } from "./database.js";
interface ApiConstructProps {
  database: DatabaseConstruct;
}

export class ApiConstruct extends Construct {
  public readonly api: apigwv2.HttpApi;
  public readonly url: string;
  public readonly database: DatabaseConstruct;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);
    this.database = props.database;
    this.api = new apigwv2.HttpApi(this, "CrudApi", {
      apiName: "user-crud-api",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowHeaders: ["*"],
      },
    });
    this.url = this.api.url || "URL not available";
  }
}
