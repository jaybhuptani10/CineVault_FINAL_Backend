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
    UserId, // Changed from userId to UserId
    movieId,
    status,
    rating,
    review,
    movieTitle,
    posterUrl,
    type,
  }) {
    const params = {
      TableName: TABLE,
      Item: {
        UserId, // Changed from userId to UserId
        movieId,
        status,
        rating,
        review,
        movieTitle,
        posterUrl,
        type,
        timestamp: Date.now(),
      },
    };
    await dynamo.send(new PutCommand(params));
    return params.Item;
  },

  // Get all interactions of a specific user
  async getUserInteractions(UserId) {
    if (!UserId) {
      throw new Error("UserId is required");
    }

    const params = {
      TableName: TABLE,
      KeyConditionExpression: "UserId = :uid", // Changed from userId to UserId
      ExpressionAttributeValues: {
        ":uid": UserId.toString(), // Ensure UserId is a string
      },
    };

    console.log("Query params:", params);
    const { Items } = await dynamo.send(new QueryCommand(params));
    return Items || []; // Return empty array if no items found
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
