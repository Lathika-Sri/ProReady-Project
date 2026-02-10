import express from "express";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use("/ai", resumeRoutes);

export default app;
