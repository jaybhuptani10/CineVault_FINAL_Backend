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
      type,
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

export const getUserInteractionsByType = async (req, res) => {
  try {
    const { UserId, type } = req.params;
    if (!UserId || !type) {
      return res.status(400).json({ error: "UserId and type are required" });
    }
    console.log("Fetching interactions for UserId:", UserId, "and type:", type);
    const data = await InteractionsModel.getUserInteractionsByType(
      UserId,
      type
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error in getUserInteractionsByType:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserMovieInteraction = async (req, res) => {
  try {
    const { UserId, type, movieId } = req.params;
    console.log("Looking up interaction:", { UserId, type, movieId });

    if (!UserId || !movieId) {
      return res.status(400).json({
        success: false,
        error: "UserId and movieId are required",
      });
    }

    const data = await InteractionsModel.getUserMovieInteraction(
      UserId,
      type,
      movieId
    );

    console.log("Interaction data found:", data);

    if (!data) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No interaction found for this movie",
      });
    }

    res.status(200).json({
      success: true,
      data,
      message: "Interaction found",
    });
  } catch (err) {
    console.error("Error in getUserMovieInteraction:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
