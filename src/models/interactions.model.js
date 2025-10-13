import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../db/index.js";
import dotenv from "dotenv";

dotenv.config();
const TABLE = process.env.DYNAMODB_TABLE_INTERACTIONS;

export const InteractionsModel = {
  // Add or update a user's interaction with a movie
  async upsertInteraction({
    userId,
    movieId,
    status,
    rating,
    review,
    movieTitle,
    posterUrl,
  }) {
    const params = {
      TableName: TABLE,
      Item: {
        userId,
        movieId,
        status,
        rating,
        review,
        movieTitle,
        posterUrl,
        timestamp: Date.now(),
      },
    };
    await dynamo.send(new PutCommand(params));
    return params.Item;
  },

  // Get all interactions of a specific user
  async getUserInteractions(userId) {
    const params = {
      TableName: TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    };
    const { Items } = await dynamo.send(new QueryCommand(params));
    return Items;
  },

  // Get interaction for a specific movie
  async getInteraction(userId, movieId) {
    const params = {
      TableName: TABLE,
      Key: { userId, movieId },
    };
    const { Item } = await dynamo.send(new GetCommand(params));
    return Item;
  },

  // Delete a movie from watchlist or interaction
  async deleteInteraction(userId, movieId) {
    const params = {
      TableName: TABLE,
      Key: { userId, movieId },
    };
    await dynamo.send(new DeleteCommand(params));
    return { message: "Interaction deleted" };
  },
};
