const mongoose = require("mongoose");
const fabricSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  title: { type: String, required: true, allowNull: false },
  description: { type: String, required: true, allowNull: false },
  videoUrl: { type: String, required: false, allowNull: false },
  notes: { type: String, required: false, allowNull: false },
  shelfLocation: { type: String, required: false, allowNull: false },
  price: { type: String, required: true, allowNull: false },
  seamless: { type: Boolean, required: true, allowNull: false },
  hashtags: { type: [String], required: true, allowNull: false },
  masterFile: { type: String, required: true },
  additionDate: { type: Date, required: false },
  item_code: { type: String, required: true, unique: true },
  categories: { type: [String], required: true },
  added_by: { type: String, required: true },
  inches: { type: String, required: true },
  hex: { type: String, required: true },
  ratio: { type: String, required: true },
  exclusive: { type: String, required: true },
  landscape: { type: Boolean, required: true },
});

module.exports = mongoose.model("fabric", fabricSchema);
