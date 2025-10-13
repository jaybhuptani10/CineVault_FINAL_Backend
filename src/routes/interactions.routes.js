import express from "express";
import {
  addOrUpdateInteraction,
  getUserInteractions,
} from "../controllers/interactions.controller.js";

const router = express.Router();

router.post("/interaction", addOrUpdateInteraction);
router.get("/interactions/:UserId", getUserInteractions); // Changed from userId to UserId

export default router;
