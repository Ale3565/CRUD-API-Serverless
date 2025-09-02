import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  ScanCommand 
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  },
  body: JSON.stringify(body)
});

const validateUser = (user) => {
  const errors = [];
  
  if (!user.name || user.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!user.email || !user.email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  return errors;
};

const getUser = async (id) => {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });

    const result = await docClient.send(command);
    
    if (!result.Item) {
      return createResponse(404, { 
        message: 'User not found',
        id 
      });
    }

    return createResponse(200, {
      message: 'User retrieved successfully',
      user: result.Item
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return createResponse(500, { 
      message: 'Error retrieving user',
      error: error.message 
    });
  }
};

const getAllUsers = async () => {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME
    });

    const result = await docClient.send(command);
    
    return createResponse(200, {
      message: 'Users retrieved successfully',
      users: result.Items || [],
      count: result.Count || 0
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    return createResponse(500, { 
      message: 'Error retrieving users',
      error: error.message 
    });
  }
};

const createUser = async (userData) => {
  try {
    
    const validationErrors = validateUser(userData);
    if (validationErrors.length > 0) {
      return createResponse(400, {
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    
    const user = {
      id: randomUUID(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      age: userData.age || null,
      phone: userData.phone || null,
      address: userData.address || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(id)' 
    });

    await docClient.send(command);

    return createResponse(201, {
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(409, { 
        message: 'User already exists' 
      });
    }

    return createResponse(500, { 
      message: 'Error creating user',
      error: error.message 
    });
  }
};


const updateUser = async (id, userData) => {
  try {
    if (!id) {
      return createResponse(400, { 
        message: 'User ID is required' 
      });
    }

   
    if (userData.name !== undefined || userData.email !== undefined) {
      const validationErrors = validateUser({
        name: userData.name || 'dummy', 
        email: userData.email || 'dummy@example.com' 
      });
      
      if (userData.name !== undefined && !userData.name?.trim()) {
        return createResponse(400, {
          message: 'Name cannot be empty'
        });
      }
      
      if (userData.email !== undefined && !userData.email?.includes('@')) {
        return createResponse(400, {
          message: 'Valid email is required'
        });
      }
    }

    
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    
    const updatableFields = ['name', 'email', 'age', 'phone', 'address'];
    
    updatableFields.forEach(field => {
      if (userData[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        
        if (field === 'email') {
          expressionAttributeValues[`:${field}`] = userData[field].trim().toLowerCase();
        } else if (field === 'name') {
          expressionAttributeValues[`:${field}`] = userData[field].trim();
        } else {
          expressionAttributeValues[`:${field}`] = userData[field];
        }
      }
    });

    
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (updateExpressions.length === 1) { 
      return createResponse(400, { 
        message: 'No fields to update' 
      });
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(id)', 
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);

    return createResponse(200, {
      message: 'User updated successfully',
      user: result.Attributes
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(404, { 
        message: 'User not found' 
      });
    }

    return createResponse(500, { 
      message: 'Error updating user',
      error: error.message 
    });
  }
};


const deleteUser = async (id) => {
  try {
    if (!id) {
      return createResponse(400, { 
        message: 'User ID is required' 
      });
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression: 'attribute_exists(id)', 
      ReturnValues: 'ALL_OLD'
    });

    const result = await docClient.send(command);

    return createResponse(200, {
      message: 'User deleted successfully',
      deletedUser: result.Attributes
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(404, { 
        message: 'User not found' 
      });
    }

    return createResponse(500, { 
      message: 'Error deleting user',
      error: error.message 
    });
  }
};


export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { requestContext, pathParameters, body } = event;
    const httpMethod = requestContext.http.method;
    const path = requestContext.http.path;
    
    
    if (httpMethod === 'OPTIONS') {
      return createResponse(200, { message: 'OK' });
    }

    
    if (path === '/health') {
      return createResponse(200, { 
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        tableName: TABLE_NAME 
      });
    }

   
    switch (httpMethod) {
      case 'GET':
        if (pathParameters?.id) {
          return await getUser(pathParameters.id);
        }
        return await getAllUsers();
      
      case 'POST':
        if (!body) {
          return createResponse(400, { 
            message: 'Request body is required' 
          });
        }
        
        let userData;
        try {
          userData = JSON.parse(body);
        } catch (parseError) {
          return createResponse(400, { 
            message: 'Invalid JSON in request body' 
          });
        }
        
        return await createUser(userData);
      
      case 'PUT':
        if (!pathParameters?.id) {
          return createResponse(400, { 
            message: 'User ID is required in path' 
          });
        }
        
        if (!body) {
          return createResponse(400, { 
            message: 'Request body is required' 
          });
        }
        
        let updateData;
        try {
          updateData = JSON.parse(body);
        } catch (parseError) {
          return createResponse(400, { 
            message: 'Invalid JSON in request body' 
          });
        }
        
        return await updateUser(pathParameters.id, updateData);
      
      case 'DELETE':
        if (!pathParameters?.id) {
          return createResponse(400, { 
            message: 'User ID is required in path' 
          });
        }
        
        return await deleteUser(pathParameters.id);
      
      default:
        return createResponse(405, { 
          message: `Method ${httpMethod} not allowed` 
        });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return createResponse(500, { 
      message: 'Internal server error',
      error: error.message 
    });
  }
};