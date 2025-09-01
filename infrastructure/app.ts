import { App } from "aws-cdk-lib";
import { CrudStack } from "./stacks/crud-stack.js";

const app = new App();
new CrudStack(app, "CrudStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description:
    "Stack para CRUD de usuarios con DynamoDB, Lambda, API Gateway y Cognito",
});

app.synth();
