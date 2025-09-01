import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface LambdaContructProps {
  table: dynamodb.Table;
}

export class LambdaContructor extends Construct {
  constructor() {}
}
