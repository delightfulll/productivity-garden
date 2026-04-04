import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import taskRoutes from "./routes/tasks";
import userRoutes from "./routes/users";
import goalRoutes from "./routes/goals";
import backlogRoutes from "./routes/backlog";
import journalRoutes from "./routes/journal";
import winsRoutes from "./routes/wins";
import timeblockingRoutes from "./routes/timeblocking";
import addictionsRoutes from "./routes/addictions";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/backlog", backlogRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/wins", winsRoutes);
app.use("/api/timeblocking", timeblockingRoutes);
app.use("/api/addictions", addictionsRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

export default app;
