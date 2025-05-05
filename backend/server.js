const express = require("express");
const cors = require("cors");
const scheduler = require("./routes/scheduler");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
require("dotenv").config();

// Initialize Express & Middleware
const app = express();
connectDB();
app.use(cors());
app.use(bodyParser.json());

// Import Routes
const audioRoutes = require("./routes/audioRoutes");
const pythonRoutes = require("./routes/pythonRoutes");
app.use("/api/audio", audioRoutes);
app.use("/api/python", pythonRoutes);
app.use("/api/schedule", scheduler); // ✅ Schedule route is included

// Start HTTP Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
