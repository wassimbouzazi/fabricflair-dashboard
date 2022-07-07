const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Item = require("../models/item");

//Post an Item
router.post("/postItem", (req, res, next) => {
  const newItem = new Item({
    _id: new mongoose.Types.ObjectId(),
    userid: req.body.userid,
    itemname: req.body.itemname,
    itemimage: req.body.itemimage,
    category: req.body.category,
    description: req.body.description,
    price: req.body.price,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
  });

  newItem
    .save()
    .then((result) => {
      console.log(result);

      res.status(200).json({
        message: "Successfully added!",
        ItemData: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Getting all items, not in any particular order

router.get("/getAllItems", (req, res, next) => {
  Item.find()
    .exec()
    .then((docs) => {
      console.log(docs);
      res.status(200).json({
        message: "Getting all items",
        items: docs,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//get all items of one useerr by userId
router.post("/getbyuserid", (req, res, next) => {
  const userid = req.body.userid;
  Item.find({ userid: userid })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "SUCCESS",
        product: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//Delete an item
router.delete("/deleteItem:itemid", (req, res, next) => {
  const itemId = req.params.itemId;
  Item.remove({ _id: itemId })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "item deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//editing the item

router.patch("/editItem", (req, res, next) => {
  const id = req.body.itemId;
  Item.update(
    { _id: id },
    {
      $set: {
        itemnname: req.body.description,
        itemimage: req.body.itemimage,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        startdate: req.body.startdate,
        enddate: req.body.enddate,
      },
    }
  )
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "item edited!",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//search by category

router.get("/searchByCategory", (req, res, next) => {
  const category = req.body.category;
  Item.find({ category: category })
    .exec()
    .then((items) => {
      console.log(items);
      res.status(200).json({
        message: "Here are the items!",
        items: items,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//search by name

router.get("/searchByName", (req, res, next) => {
  const itemname = req.body.itemname;
  Item.find({ itemname: itemname })
    .exec()
    .then((items) => {
      console.log(items);
      res.status(200).json({
        message: "Here are the items!",
        items: items,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//add comment
router.patch("/addComment", (req, res, next) => {
  const id = req.body.itemId;
  Item.update({ _id: id }, { $set: { comments: req.body.comments } })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Your comment has been added!Thank you! ",
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
