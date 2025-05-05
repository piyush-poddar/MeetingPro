const { spawn } = require("child_process");
const path = require("path");

let pythonProcess = null; // This will store the current Python process

// Function to trigger the Python script
exports.triggerPythonScript = (req, res) => {
  try {
    // Highlight the directory path to the Python script (adjust accordingly)
    const pythonScriptPath = path.join(__dirname, "../python/piyush.py");  // <-- Change this directory path if needed
    
    // Ensure there's no active process already
    if (pythonProcess) {
      return res.status(400).json({ message: "Python script is already running." });
    }

    // Start the Python script
    pythonProcess = spawn("python", [pythonScriptPath]);

    pythonProcess.on("close", (code) => {
      console.log(`Python script finished with code: ${code}`);
      pythonProcess = null; // Reset the python process when it's done

      if (code === 0) {
        res.json({ message: "Python script executed and audio is being processed." });
      } else {
        res.status(500).json({ error: "Error executing Python script." });
      }
    });

    // Capture stderr to log any errors from the Python script
    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data.toString()}`);
    });

  } catch (error) {
    console.error("Error triggering Python script:", error);
    res.status(500).json({ error: error.message });
  }
};

// Function to stop the running Python process
exports.stopPythonScript = (req, res) => {
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
