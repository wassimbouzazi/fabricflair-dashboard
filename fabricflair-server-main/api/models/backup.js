const mongoose = require("mongoose");
const backupSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
});

module.exports = mongoose.model("backup", backupSchema);
