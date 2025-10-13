import dotenv from "dotenv";

import app from "./app.js";
dotenv.config({ path: "./.env" });
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server: ", error);
    process.exit(1); // Exit with a failure code
  }
};

startServer();
