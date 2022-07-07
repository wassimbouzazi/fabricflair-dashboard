const mongoose = require("mongoose");
const accountrequestchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  fullName: { type: String, required: true, allowNull: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, allowNull: false },
  companyName: { type: String, required: false, allowNull: false },
  companyAddress: {
    companyAddressLine: { type: String, required: false },
    companyAddressRegion: { type: String, required: false },
    companyAddressPostcode: { type: String, required: false },
    companyAddressCountry: { type: String, required: false },
  },
  companyPhone: { type: Number, required: true, allowNull: false },
  companyWebsite: { type: String, required: true },
  companyEIN: { type: String, required: true },
  clientType: { type: String, required: true },
  approved: { type: Boolean, required: true, default: false },
  date: { type: Date, required: true },
  status: { type: String, required: true, default: "Pending" },
});

module.exports = mongoose.model("RequestAccount", accountrequestchema);
