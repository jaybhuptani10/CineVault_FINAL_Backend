import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../db/index.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = "CineVault";

export const UserModel = {
  // ➕ Create new user
  async createUserProfile({
    fullName,
    username,
    email,
    password,
    bio = "",
    location = "",
    interests = [],
    profilePic = "",
  }) {
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    const userItem = {
      PK: `USER#${userId}`,
      SK: "PROFILE",
      GSI1PK: `EMAIL#${email.toLowerCase()}`, // 🔥 Added
      GSI1SK: `USER#${userId}`, // 🔥 Added
      userId,
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      bio,
      profilePic,
      location,
      interests,
      favourites: [],
      badges: ["New User"],
      points: 0,
      privacy: {
        profileVisibility: "public",
        showActivity: true,
        showCollections: true,
      },
      followersCount: 0,
      followingCount: 0,
      watchlistCount: 0,
      collectionsCount: 0,
      joinedAt: new Date().toISOString(),
      settings: { theme: "dark", language: "en" },
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: userItem,
        ConditionExpression: "attribute_not_exists(PK)",
      })
    );

    return { message: "✅ User created successfully", user: userItem };
  },

  // 🔎 Get by email (for login)
  async getUserByEmail(email) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "GSI1", // optional if you create GSI on email; otherwise scan manually
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": `EMAIL#${email.toLowerCase()}` },
    };
    const result = await docClient.send(new QueryCommand(params));
    return result.Items?.[0];
  },

  // 👀 Get profile by userId
  async getUserProfile(userId) {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND SK = :sk",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "PROFILE",
      },
    };
    const result = await docClient.send(new QueryCommand(params));
    return result.Items?.[0];
  },

  // ✏️ Update profile
  async updateUserProfile(userId, updateData) {
    const updateExpressions = [];
    const attrNames = {};
    const attrValues = {};

    Object.keys(updateData).forEach((key) => {
      updateExpressions.push(`#${key} = :${key}`);
      attrNames[`#${key}`] = key;
      attrValues[`:${key}`] = updateData[key];
    });

    const params = {
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      UpdateExpression: "SET " + updateExpressions.join(", "),
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
      ReturnValues: "ALL_NEW",
    };

    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes;
  },
};
