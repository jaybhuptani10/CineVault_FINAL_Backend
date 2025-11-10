import express from "express";
import { upload } from "../middlewares/uploads.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/signup", upload.single("profilePic"), createUser);
userRouter.post("/login", loginUser);
userRouter.get("/:userId", getUserProfile);
userRouter.patch(
  "/:userId",
  authenticateToken,
  upload.single("profilePic"),
  updateUserProfile
);

export default userRouter;
