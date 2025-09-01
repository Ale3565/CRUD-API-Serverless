import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "node:path";
import { Duration } from "aws-cdk-lib";
interface LambdaConstructProps {
  table: dynamodb.Table;
}

export class LambdaConstructor extends Construct {
  public readonly table: dynamodb.Table;
  public readonly lambdaFunction: lambda.Function;
  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);
    this.table = props.table;
    this.lambdaFunction = new lambda.Function(this, "UserLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "crud-handler.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../../src/handlers")),
      environment: {
        TABLE_NAME: this.table.tableName,
        NODE_OPTIONS: "--enable-source-maps",
      },
      timeout: Duration.seconds(30),
      memorySize: 512,
    });
    this.table.grantReadWriteData(this.lambdaFunction);
  }
}
