import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface DataBaseConstructProps {
  tableName: string;
  partitionKey: string;
}

export class DatabaseConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DataBaseConstructProps) {
    super(scope, id);
    this.table = new dynamodb.Table(this, "UserTable", {
      tableName: props.tableName,
      partitionKey: {
        name: props.partitionKey,
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
