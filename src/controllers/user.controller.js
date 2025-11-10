import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ✅ Register User
export const registerUser = async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Upload profile picture to Cloudinary if provided
    let profilePicUrl = null;
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path);
      if (cloudinaryResponse) {
        profilePicUrl = cloudinaryResponse.secure_url;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      UserId: Date.now().toString(),
      username,
      email,
      fullName,
      password: hashedPassword,
      profilePic: profilePicUrl,
    };

    const newUser = await UserModel.createUser(user);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { UserId: user.UserId, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        UserId: user.UserId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add favorite movie
export const addFavoriteMovie = async (req, res) => {
  try {
    const { UserId } = req.user;
    if (!UserId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const { movieId, movieTitle, movieYear, posterUrl, type } = req.body;
    if (!movieId)
      return res
        .status(400)
        .json({ success: false, error: "movieId is required" });

    const movie = {
      movieId: movieId.toString(),
      movieTitle,
      movieYear,
      posterUrl,
      type,
    };
    const updated = await UserModel.addFavorite(UserId, movie);

    res.status(200).json({ success: true, favorites: updated.favorites || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Remove favorite movie
export const removeFavoriteMovie = async (req, res) => {
  try {
    const { UserId } = req.user;
    if (!UserId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const { movieId } = req.params;
    if (!movieId)
      return res
        .status(400)
        .json({ success: false, error: "movieId is required" });

    const updated = await UserModel.removeFavorite(UserId, movieId.toString());
    res.status(200).json({ success: true, favorites: updated.favorites || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get user's favorites
export const getFavorites = async (req, res) => {
  try {
    const { UserId } = req.user;
    if (!UserId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const favorites = await UserModel.getFavorites(UserId);
    res.status(200).json({ success: true, favorites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get user profile
export const profile = async (req, res) => {
  try {
    const { UserId } = req.user; // userId from decoded JWT

    // Fetch full user record from DynamoDB
    const user = await UserModel.getUserById(UserId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Don’t expose password hash
    delete user.password;

    res.status(200).json({
      success: true,
      message: "Profile data retrieved successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
