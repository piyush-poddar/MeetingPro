const Audio = require("../models/Audio");  // Your MongoDB Audio model
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let pythonProcess = null; // Store the running Python process

// Function to handle audio processing and storing the transcription
exports.uploadAudio = async (req, res) => {
  try {
    const audioPath = path.join(__dirname, "../python/captured_audio.wav");  // Path to the captured audio file

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: "Captured audio file not found!" });
    }

    // If there's already a running process, we shouldn't start a new one
    if (pythonProcess) {
      return res.status(400).json({ message: "Python process is already running. Please stop it first." });
    }

    // Call the Python script to process the captured audio file
    pythonProcess = spawn("python", [
      path.join(__dirname, "../python/piyush.py"),  // Path to the Python script
      audioPath  // Pass the audio file path to the Python script
    ]);

    let transcript = "";
    pythonProcess.stdout.on("data", (data) => {
      transcript += data.toString();  // Append the transcription from Python
    });

    pythonProcess.on("close", async () => {
      // If a transcription is available, save it to MongoDB
      if (transcript) {
        const newAudio = new Audio({
          filename: "captured_audio.wav",  // Name of the captured audio file
          transcript,  // Store the transcription from the Python script
        });

        // Save the audio data to MongoDB
        await newAudio.save();
        res.json({ message: "Audio processed and stored successfully", transcript });
      } else {
        res.status(500).json({ error: "Failed to transcribe audio" });
      }
      pythonProcess = null; // Reset the process after completion
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to stop the running Python process
exports.stopPythonProcess = (req, res) => {
  if (!pythonProcess) {
    return res.status(400).json({ message: "No Python process is currently running." });
  }

  try {
    pythonProcess.kill(); // Kill the running Python process
    pythonProcess = null; // Reset the reference
    return res.json({ message: "Python process stopped successfully." });
  } catch (error) {
    console.error("Error stopping Python script:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Function to fetch all transcripts from the database
exports.getAllTranscripts = async (req, res) => {
  try {
    const transcripts = await Audio.find();  // Get all audio records from the database
    res.json(transcripts);  // Return the transcripts as JSON
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
