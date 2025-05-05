const express = require("express");
const { triggerPythonScript, stopPythonScript } = require("../controllers/pythonController");

const router = express.Router();

router.post("/trigger", triggerPythonScript); // Route to start the Python script
router.post("/stop", stopPythonScript); // Route to stop the Python script

module.exports = router;
