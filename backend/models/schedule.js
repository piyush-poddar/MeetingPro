const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    date: { type: String, required: true }, // Store date as a string (YYYY-MM-DD)
    time: { type: String, required: true }, // Store time as a string (HH:MM format)
    code: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
