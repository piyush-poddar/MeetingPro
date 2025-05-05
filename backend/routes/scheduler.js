const express = require("express");
const router = express.Router();
const Schedule = require("../models/schedule");

// Create a new meeting
router.post("/create", async (req, res) => {
    try {
        console.log("🔹 Received Request:", req.body); // ✅ Log incoming data

        const { heading, date, time, code } = req.body;

        if (!heading || !date || !time || !code) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check for duplicate meeting code
        const existingMeeting = await Schedule.findOne({ code });
        if (existingMeeting) {
            return res.status(400).json({ error: "Meeting code already exists. Use a unique code." });
        }

        const newMeeting = new Schedule({ heading, date, time, code });
        await newMeeting.save();

        console.log("✅ Meeting saved:", newMeeting); // ✅ Log saved data
        res.status(201).json({ message: "Meeting scheduled successfully", meeting: newMeeting });

    } catch (error) {
        console.error("❌ Error scheduling meeting:", error);
        res.status(500).json({ error: "Error scheduling meeting", details: error.message });
    }
});


// Get all meetings
router.get("/all", async (req, res) => {
    try {
        const meetings = await Schedule.find();
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ error: "Error fetching meetings", details: error });
    }
});

module.exports = router;
