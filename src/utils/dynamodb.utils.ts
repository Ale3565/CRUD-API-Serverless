import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export interface UpdateExpressionBuilder {
  updateExpression: string;
  expressionAttributeNames: Record<string, string>;
  expressionAttributeValues: Record<string, any>;
}

export const buildUpdateExpression = (
  updates: Record<string, any>,
  excludeFields: string[] = []
): UpdateExpressionBuilder => {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(updates).forEach(([field, value]) => {
    if (value !== undefined && !excludeFields.includes(field)) {
      updateExpressions.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;

      if (field === "email" && typeof value === "string") {
        expressionAttributeValues[`:${field}`] = value.trim().toLowerCase();
      } else if (field === "name" && typeof value === "string") {
        expressionAttributeValues[`:${field}`] = value.trim();
      } else {
        expressionAttributeValues[`:${field}`] = value;
      }
    }
  });

  updateExpressions.push("#updatedAt = :updatedAt");
  expressionAttributeNames["#updatedAt"] = "updatedAt";
  expressionAttributeValues[":updatedAt"] = new Date().toISOString();

  return {
    updateExpression: `SET ${updateExpressions.join(", ")}`,
    expressionAttributeNames,
    expressionAttributeValues,
  };
};

export const sanitizeUserData = (userData: any): any => {
  const sanitized = { ...userData };

  if (sanitized.name) sanitized.name = sanitized.name.trim();
  if (sanitized.email) sanitized.email = sanitized.email.trim().toLowerCase();
  if (sanitized.phone) sanitized.phone = sanitized.phone.trim();
  if (sanitized.address) sanitized.address = sanitized.address.trim();

  if (sanitized.age && typeof sanitized.age === "string") {
    sanitized.age = parseInt(sanitized.age, 10);
  }

  return sanitized;
};
