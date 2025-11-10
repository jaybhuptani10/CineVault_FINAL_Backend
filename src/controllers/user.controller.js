import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// 🧍 Signup
export const createUser = async (req, res) => {
  try {
    const { fullName, username, email, password, bio, location, interests } =
      req.body;
    if (!fullName || !username || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    // Cloudinary upload
    let profilePicUrl = "";
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.path);
      if (upload) profilePicUrl = upload.secure_url;
    }

    const result = await UserModel.createUserProfile({
      fullName,
      username,
      email,
      password,
      bio,
      location,
      interests,
      profilePic: profilePicUrl,
    });

    const token = generateToken(result.user);
    res.status(201).json({ message: result.message, token, user: result.user });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔐 Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await UserModel.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(user);
    res.json({ message: "✅ Login successful", token, user });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 👀 Get profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.getUserProfile(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("❌ Fetch profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✏️ Update profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.userId !== userId)
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this profile" });

    const updateData = { ...req.body };
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.path);
      if (upload) updateData.profilePic = upload.secure_url;
    }

    const updatedUser = await UserModel.updateUserProfile(userId, updateData);
    res.json({ message: "✅ Profile updated", user: updatedUser });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
