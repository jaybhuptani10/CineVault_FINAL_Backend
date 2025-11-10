import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  addToWatchlist,
  markAsWatched,
  rateMovie,
  toggleFavourite,
  getUserMovies,
  removeMovie,
} from "../controllers/movie.controller.js";

const movieRouter = express.Router();

movieRouter.post("/watchlist", authenticateToken, addToWatchlist);
movieRouter.patch("/watched/:movieId", authenticateToken, markAsWatched);
movieRouter.patch("/rate/:movieId", authenticateToken, rateMovie);
movieRouter.patch("/favourite/:movieId", authenticateToken, toggleFavourite);
movieRouter.get("/mine", authenticateToken, getUserMovies);
movieRouter.delete("/:movieId", authenticateToken, removeMovie);

export default movieRouter;
