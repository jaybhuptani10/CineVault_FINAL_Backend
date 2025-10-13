import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../db/index.js";
import dotenv from "dotenv";

dotenv.config();
const USERS_TABLE = process.env.DYNAMODB_TABLE_USERS;

export const UserModel = {
  // ✅ Create new user
  async createUser(userData) {
    const params = {
      TableName: USERS_TABLE,
      Item: userData,
    };
    await dynamo.send(new PutCommand(params));
    return userData;
  },

  // ✅ Get user by userId (primary key)
  async getUserById(UserId) {
    const params = {
      TableName: USERS_TABLE,
      Key: { UserId },
    };
    const { Item } = await dynamo.send(new GetCommand(params));
    return Item;
  },

  // ✅ Get user by email (if email is not your primary key)
  async findByEmail(email) {
    // DynamoDB doesn't allow direct "Get" by a non-key attribute
    // so we use Scan (or GSI if you set one up for email)
    const params = {
      TableName: USERS_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };
    const { Items } = await dynamo.send(new ScanCommand(params));
    return Items.length > 0 ? Items[0] : null;
  },

  // ✅ Update user info
  async updateUser(UserId, updates) {
    const updateExpression = [];
    const expressionAttributeValues = {};

    for (const [key, value] of Object.entries(updates)) {
      updateExpression.push(`${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = value;
    }

    const params = {
      TableName: USERS_TABLE,
      Key: { UserId },
      UpdateExpression: `set ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamo.send(new UpdateCommand(params));
    return Attributes;
  },

  // ✅ Delete user
  async deleteUser(UserId) {
    const params = {
      TableName: USERS_TABLE,
      Key: { UserId },
    };
    await dynamo.send(new DeleteCommand(params));
    return { message: "User deleted successfully" };
  },
};
