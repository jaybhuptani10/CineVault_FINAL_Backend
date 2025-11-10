import {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../db/index.js";

const TABLE_NAME = "CineVault";

export const MovieModel = {
  /** Add a movie to watchlist */
  async addToWatchlist(userId, movieData) {
    const item = {
      PK: `USER#${userId}`,
      SK: `MOVIE#${movieData.movieId}`,
      movieId: movieData.movieId,
      title: movieData.title,
      poster: movieData.poster,
      status: "watchlist",
      rating: null,
      isFavourite: false,
      genres: movieData.genres || [],
      keywords: movieData.keywords || [],
      runtime: movieData.runtime || null,
      releaseYear: movieData.releaseYear || null,
      language: movieData.language || "en",
      popularity: movieData.popularity || null,
      voteAverage: movieData.voteAverage || null,
      addedAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item;
  },

  /** Fetch single movie for a user */
  async getMovie(userId, movieId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `MOVIE#${movieId}` },
    };
    const result = await docClient.send(new GetCommand(params));
    return result.Item;
  },

  /** Mark as watched — creates if not exists */
  async markAsWatched(userId, movieData) {
    const { movieId } = movieData;
    const existing = await this.getMovie(userId, movieId);

    if (existing) {
      // ✅ Just update status to watched
      const params = {
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `MOVIE#${movieId}` },
        UpdateExpression:
          "SET #status = :watched, #watchedAt = :time, #rating = if_not_exists(#rating, :null)",
        ExpressionAttributeNames: {
          "#status": "status",
          "#watchedAt": "watchedAt",
          "#rating": "rating",
        },
        ExpressionAttributeValues: {
          ":watched": "watched",
          ":time": new Date().toISOString(),
          ":null": null,
        },
        ReturnValues: "ALL_NEW",
      };
      const result = await docClient.send(new UpdateCommand(params));
      return result.Attributes;
    } else {
      // ⚙️ Create new entry if not in DB
      const item = {
        PK: `USER#${userId}`,
        SK: `MOVIE#${movieId}`,
        movieId,
        title: movieData.title,
        poster: movieData.poster,
        status: "watched",
        rating: null,
        isFavourite: false,
        genres: movieData.genres || [],
        keywords: movieData.keywords || [],
        runtime: movieData.runtime || null,
        releaseYear: movieData.releaseYear || null,
        language: movieData.language || "en",
        popularity: movieData.popularity || null,
        voteAverage: movieData.voteAverage || null,
        watchedAt: new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({ TableName: TABLE_NAME, Item: item })
      );
      return item;
    }
  },

  /** Rate a movie (auto marks as watched if needed) */
  async rateMovie(userId, movieId, rating) {
    const movie = await this.getMovie(userId, movieId);
    const status = movie?.status === "watched" ? "watched" : "watched";

    const params = {
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `MOVIE#${movieId}` },
      UpdateExpression: "SET #rating = :rating, #status = :status",
      ExpressionAttributeNames: { "#rating": "rating", "#status": "status" },
      ExpressionAttributeValues: { ":rating": rating, ":status": status },
      ReturnValues: "ALL_NEW",
    };

    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes;
  },

  /** Toggle favourite (only for watched movies) */
  async toggleFavourite(userId, movieId, isFavourite) {
    const movie = await this.getMovie(userId, movieId);
    if (!movie) throw new Error("Movie not found");

    if (movie.status !== "watched") {
      throw new Error("You can only favourite movies you've watched.");
    }

    const params = {
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `MOVIE#${movieId}` },
      UpdateExpression: "SET #isFavourite = :fav",
      ExpressionAttributeNames: { "#isFavourite": "isFavourite" },
      ExpressionAttributeValues: { ":fav": isFavourite },
      ReturnValues: "ALL_NEW",
    };
    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes;
  },

  /** Remove movie from user list (watchlist/watched) */
  async removeMovie(userId, movieId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `MOVIE#${movieId}` },
    };
    await docClient.send(new DeleteCommand(params));
    return { message: "Movie removed" };
  },

  /** Get all user’s movies (both watched + watchlist) */
  async getUserMovies(userId) {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :movie)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":movie": "MOVIE#",
      },
    };
    const result = await docClient.send(new QueryCommand(params));
    return result.Items;
  },
};
