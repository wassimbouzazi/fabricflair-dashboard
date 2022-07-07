const mongoose = require("mongoose");

var orderSchema = mongoose.Schema({
  fabric_id: mongoose.Schema.Types.ObjectId,
  fabric_name: String,
  product: String,
  option: String,
  type: String,
  hasSilver: Boolean,
  quantity: Number,
  order_date: Date,
});

const userSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: { type: String, required: true, allowNull: false },
  password: { type: String, required: true, allowNull: false },
  type: { type: String, required: true, allowNull: false },
  name: { type: String, required: true },
  is_exclusive: { type: Boolean, required: false },
  exclusive: { type: String, required: false, default: null },
  cart: [orderSchema],
  companyName: { type: String, required: false },
  companyAddress: {
    companyAddressLine: { type: String, required: false },
    companyAddressRegion: { type: String, required: false },
    companyAddressPostcode: { type: String, required: false },
    companyAddressCountry: { type: String, required: false },
  },
  companyPhone: { type: Number, required: false },
  companyWebsite: { type: String, required: false },
  companyEIN: { type: String, required: false },
  clientType: { type: String, required: false },
  seq: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
});

module.exports = mongoose.model("user", userSchema);
