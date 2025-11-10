import { MovieModel } from "../models/movie.model.js";

// ✅ Add movie to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const movieData = req.body;

    const existing = await MovieModel.getMovie(userId, movieData.movieId);
    if (existing) {
      return res
        .status(400)
        .json({ message: "Movie already exists in your list" });
    }

    const movie = await MovieModel.addToWatchlist(userId, movieData);
    res.json({ message: "Added to watchlist ✅", movie });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark as watched (can create or update)
export const markAsWatched = async (req, res) => {
  try {
    const userId = req.user.userId;
    const movieData = req.body; // frontend sends full metadata

    const updatedMovie = await MovieModel.markAsWatched(userId, movieData);

    res.status(200).json({
      message: "Movie marked as watched successfully 🎬",
      movie: updatedMovie,
    });
  } catch (error) {
    console.error("Error marking as watched:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Rate a movie
export const rateMovie = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId } = req.params;
    const { rating } = req.body;

    const updated = await MovieModel.rateMovie(userId, movieId, rating);
    res.json({ message: "Rated successfully ⭐", movie: updated });
  } catch (error) {
    console.error("Error rating movie:", error);
    res.status(400).json({ error: error.message });
  }
};

// ✅ Toggle favourite
export const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId } = req.params;
    const { isFavourite } = req.body;

    const updated = await MovieModel.toggleFavourite(
      userId,
      movieId,
      isFavourite
    );
    res.json({ message: "Favourite updated ❤️", movie: updated });
  } catch (error) {
    console.error("Error toggling favourite:", error);
    res.status(400).json({ error: error.message });
  }
};

// ✅ Remove movie
export const removeMovie = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { movieId } = req.params;

    await MovieModel.removeMovie(userId, movieId);
    res.json({ message: "Movie removed ❌" });
  } catch (error) {
    console.error("Error removing movie:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all user movies (watchlist + watched)
export const getUserMovies = async (req, res) => {
  try {
    const userId = req.user.userId;
    const movies = await MovieModel.getUserMovies(userId);
    res.json({ movies });
  } catch (error) {
    console.error("Error fetching user movies:", error);
    res.status(500).json({ error: error.message });
  }
};
