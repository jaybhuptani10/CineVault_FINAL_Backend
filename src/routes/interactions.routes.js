import express from "express";
import {
  addOrUpdateInteraction,
  getUserInteractions,
} from "../controllers/interactions.controller.js";

const router = express.Router();

router.post("/interaction", addOrUpdateInteraction);
router.get("/interactions/:userId", getUserInteractions);

export default router;
