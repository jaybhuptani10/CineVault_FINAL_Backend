import { InteractionsModel } from "../models/interactions.model.js";

export const addOrUpdateInteraction = async (req, res) => {
  try {
    const { userId, movieId, status, rating, review, movieTitle, posterUrl } =
      req.body;
    const data = await InteractionsModel.upsertInteraction({
      userId,
      movieId,
      status,
      rating,
      review,
      movieTitle,
      posterUrl,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserInteractions = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await InteractionsModel.getUserInteractions(userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
