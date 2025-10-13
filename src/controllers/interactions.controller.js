import { InteractionsModel } from "../models/interactions.model.js";

export const addOrUpdateInteraction = async (req, res) => {
  try {
    const {
      UserId, // Changed from userId to UserId
      movieId,
      status,
      rating,
      review,
      movieTitle,
      posterUrl,
      type, // Added type field
    } = req.body;
    console.log("Request Body:", req.body); // Debugging line
    const data = await InteractionsModel.upsertInteraction({
      UserId, // Changed from userId to UserId
      movieId,
      status,
      rating,
      review,
      movieTitle,
      posterUrl,
      type, // Pass type to the model
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserInteractions = async (req, res) => {
  try {
    const { UserId } = req.params;
    if (!UserId) {
      return res.status(400).json({ error: "UserId is required" });
    }
    console.log("Fetching interactions for UserId:", UserId);
    const data = await InteractionsModel.getUserInteractions(UserId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error in getUserInteractions:", err);
    res.status(500).json({ error: err.message });
  }
};
