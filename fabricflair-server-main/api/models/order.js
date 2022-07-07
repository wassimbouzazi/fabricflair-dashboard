const mongoose = require("mongoose");

var itemSchema = mongoose.Schema({
  fabric_id: mongoose.Schema.Types.ObjectId,
  fabric_name: String,
  product: String,
  option: String,
  type: String,
  hasSilver: Boolean,
  quantity: Number,
  price: Number,
});

const orderSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  status: { type: String, required: true },
  order_date: { type: Date, required: true },
  reference: { type: String, required: false },
  customerReference: { type: String, required: false },
  invoice_number: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  total: { type: Number, required: true },
  discount: { type: Number, required: true },
  payee_email: { type: String, required: true },
  tracking_number: { type: String, default: null },
  designer_program_email: { type: String, required: true },
  account_phone_number: { type: Number, required: true },
  items: [itemSchema],
  shipping: {
    name: String,
    address: {
      address_line_1: String,
      admin_area_1: String,
      admin_area_2: String,
      country_code: String,
      postal_code: String,
    },
  },
});

const Order = mongoose.model("order", orderSchema);

module.exports = {
  Order: Order,
};
