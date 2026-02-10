const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// 🔥 IMPORTANT: connect BEFORE routes
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "proready", // 🔑 force DB name
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("Mongoose state:", mongoose.connection.readyState); // must be 1
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// routes (AFTER DB CONNECT)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/resources", require("./routes/resources"));
app.use("/api/streaks", require("./routes/streaks"));
app.use("/api/ai", require("./routes/ai"));

// health
app.get("/", (req, res) => {
  res.json({ message: "ProReady API is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
