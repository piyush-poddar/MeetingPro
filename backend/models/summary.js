const mongoose = require("mongoose");


const summarySchema = new mongoose.Schema({
    id: String,
    title: String,
    body: String
});

module.exports = mongoose.model("summary", summarySchema);