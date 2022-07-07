const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Fabric = require("../models/fabric");

router.get("/getCustomers", (req, res) => {
  User.find({ type: "regular" })
    .select("name email is_exclusive exclusive discount")
    .then((result) => {
      res.status(200).json({
        customers: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/updateCustomers", (req, res) => {
  let customers = req.body.customers;

  customers.forEach((customer) => {
    console.log(customer);
    User.findOneAndUpdate({ _id: customer._id }, customer, (err, result) => {
      console.log(result);
    });
  });

  res.status(200).json({
    message: "success",
  });
});

router.get("/getExclusiveCustomers", (req, res) => {
  User.find({ is_exclusive: true })
    .select("exclusive")
    .then((result) => {
      res.status(200).json({
        exclusives: result.map((a) => a.exclusive),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/updateExclusiveFabrics", (req, res) => {
  Fabric.updateMany(
    { exclusive: "null" },
    { $set: { exclusive: "General Release" } }
  ).then((result) => {
    res.status(200).json({
      res: result,
    });
  });
});

module.exports = router;
