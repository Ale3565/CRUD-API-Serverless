import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { DatabaseConstruct } from "./database.js";
import * as path from "node:path";

interface LambdaConstructProps {
  table: dynamodb.Table;
}

export class LambdaConstructor extends Construct {
  public readonly table: dynamodb.Table;
  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);
    this.table = props.table;
    const lambdaFunction = new lambda.Function(this, "UserLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "crud-handler.handler",
      code: lambda.Code.fromAsset(path.join(__filename, "crud-handler")),
    });
  }
}
