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

  // Add a favorite movie to user's favorites (no duplicates)
  async addFavorite(UserId, movie) {
    const user = await this.getUserById(UserId);
    const favorites = Array.isArray(user?.favorites) ? [...user.favorites] : [];

    // ensure movie object has movieId
    if (!movie || !movie.movieId) {
      throw new Error("movie.movieId is required");
    }

    const exists = favorites.find((f) => f.movieId === movie.movieId);
    if (!exists) {
      favorites.push({ ...movie, addedAt: Date.now() });
    }

    const updated = await this.updateUser(UserId, { favorites });
    return updated; // returns Attributes from UpdateCommand (ALL_NEW)
  },

  // Remove a favorite movie by movieId
  async removeFavorite(UserId, movieId) {
    const user = await this.getUserById(UserId);
    const favorites = Array.isArray(user?.favorites) ? [...user.favorites] : [];
    const filtered = favorites.filter((f) => f.movieId !== movieId);
    const updated = await this.updateUser(UserId, { favorites: filtered });
    return updated;
  },

  // Get favorites array
  async getFavorites(UserId) {
    const user = await this.getUserById(UserId);
    return Array.isArray(user?.favorites) ? user.favorites : [];
  },
};
