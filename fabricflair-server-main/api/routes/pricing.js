const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Pricing = require("../models/pricing");

router.post("/postPricing", (req, res, next) => {
  const pricing = new Pricing({
    _id: new mongoose.Types.ObjectId(),
    groupName: req.body.groupName,
    sizeNames: req.body.sizeNames,
    sizePrices: req.body.sizePrices,
  });

  pricing
    .save()
    .then((result) => {
      console.log(result);

      res.status(200).json({
        message: "success",
        pricingData: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/getPricings", (req, res, next) => {
  Pricing.find()
    .exec()
    .then((docs) => {
      console.log(docs);
      res.status(200).json({
        message: "Getting all pricings",
        pricings: docs,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/getPricingNames", (req, res, next) => {
  Pricing.find(null, { groupName: true, _id: false })
    .exec()
    .then((docs) => {
      console.log(docs);
      res.status(200).json({
        message: "success",
        pricings: docs,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:fabridId", (req, res, next) => {
  const fabridId = req.params.fabridId;
  Fabric.find({ _id: fabridId })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "success",
        fabric: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
