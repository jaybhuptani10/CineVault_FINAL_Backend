import express from "express";
import {
  addOrUpdateInteraction,
  getUserInteractions,
  getUserInteractionsByType,
  getUserMovieInteraction,
} from "../controllers/interactions.controller.js";

const router = express.Router();

router.post("/interaction", addOrUpdateInteraction);
router.get("/interactions/:UserId", getUserInteractions); // Changed from userId to UserId
router.get("/interactions/:UserId/type/:type", getUserInteractionsByType);
router.get("/interactions/:UserId/:type/:movieId", getUserMovieInteraction);

export default router;
