const express = require("express");
const multer = require("multer");
const { uploadAudio, getAllTranscripts } = require("../controllers/audioController");

const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.post("/upload", upload.single("audio"), uploadAudio);
router.get("/transcripts", getAllTranscripts);

module.exports = router;
