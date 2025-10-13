import express from "express";
import {
  registerUser,
  loginUser,
  profile,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/uploads.js";

const router = express.Router();

router.post("/register", upload.single("profilePic"), registerUser);
router.post("/login", loginUser);

router.get("/profile", verifyToken, profile);

export default router;
