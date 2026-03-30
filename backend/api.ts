import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import taskRoutes from "./routes/tasks";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

export default app;
