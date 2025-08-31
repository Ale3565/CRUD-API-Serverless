import { Construct } from "constructs";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { DatabaseConstruct } from "./database.js";
interface ApiConstructProps {
  database: dynamodb.Table;
}

export class ApiConstruct extends Construct {
  public readonly api: apigatewayv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);
    this.api = new apigatewayv2.HttpApi(this,"CrudApi",{
      database = new DatabaseConstruct();
    })
  }
}
