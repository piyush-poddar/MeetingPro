import React, { useState } from "react";
import axios from "axios";

const TriggerPython = () => {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleTriggerPython = async () => {
    setLoading(true);
    try {
      // Make the POST request to trigger the Python script
      const response = await axios.post("http://localhost:5000/api/python/trigger");

      // Display the response message
      const { message } = response.data; // Assuming the backend sends a 'message'
      setResponseMessage(message); // Show the status message (e.g., Python script executed)
    } catch (error) {
      console.error("Error triggering Python script:", error);
      setResponseMessage("Error triggering translation.");
    }
    setLoading(false);
  };

  const handleStopPython = async () => {
    setLoading(true);
    try {
      // Make the POST request to stop the Python script
      const response = await axios.post("http://localhost:5000/api/python/stop");

      // Display the response message
      const { message } = response.data; // Assuming the backend sends a 'message'
      setResponseMessage(message); // Show the status message (e.g., Python script stopped)
    } catch (error) {
      console.error("Error stopping Python script:", error);
      setResponseMessage("Error stopping translation.");
    }
    setLoading(false);
  };

  return (
    <div className="trigger-container">
      <button
        onClick={handleTriggerPython}
        className="trigger-python-btn"
        disabled={loading}
      >
        {loading ? "Processing..." : "Run Translation"}
      </button>
      <button
        onClick={handleStopPython}
        className="stop-python-btn"
        disabled={loading}
      >
        {loading ? "Stopping..." : "Stop Execution"}
      </button>
      {responseMessage && <p className="trigger-response">{responseMessage}</p>}
    </div>
  );
};

export default TriggerPython;
