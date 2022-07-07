const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const AccountRequest = require("../models/account_request");
var jwt = require("jsonwebtoken");
const fs = require("fs");
var path = require("path");
const nodemailer = require("nodemailer");
const { request } = require("http");
const { ResumeToken } = require("mongodb");
const fabric = require("../models/fabric");

router.get("/updateUserars", async (req, res) => {
  User.find()
    .exec()
    .then(async (result) => {
      console.log(result.length);
      for (let i = 0; i < result.length; i++) {
        const data = await User.findByIdAndUpdate(result[i]._id, {
          seq: i,
        }).exec();
        console.log(data);
      }
    });
});

var privateKey = fs.readFileSync(path.resolve(__dirname, "jwtRS256.key"));
const check = (req, res, next) => {
  const token = req.cookies.jwt;
  jwt.verify(token, privateKey, function (err, decoded) {
    if (err) return res.status(200).json({ error: err });
    req.decoded = decoded;
    next();
  });
};

router.post("/requestAccount", (req, res) => {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreply.fabricflairusa@gmail.com",
      pass: "?Music247Orange",
    },
  });

  let mailDetails = {
    from: "noreply.fabricflairusa@gmail.com",
    to: req.body.email,
    subject: "FabricFlair Designer Program - Account request",
    text: "Thank you for registering with Fabric Flair. We will review your application within 24hrs. If you are not approved within 24hrs, or to have your account approved immediately please call 4132770090. M-F 9-5 EST. You will require proof of trade.",
  };

  const accountRequest = new AccountRequest({
    _id: new mongoose.Types.ObjectId(),
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    companyName: req.body.companyName,
    companyAddress: {
      companyAddressLine: req.body.companyAddressLine,
      companyAddressRegion: req.body.companyAddressRegion,
      companyAddressPostcode: req.body.companyAddressPostcode,
      companyAddressCountry: req.body.companyAddressCountry,
    },
    companyPhone: req.body.companyPhone,
    companyWebsite: req.body.companyWebsite,
    companyEIN: req.body.companyEIN,
    clientType: req.body.clientType,
    date: new Date(),
  });

  accountRequest
    .save()
    .then((result) => {
      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("Email sent successfully");
        }
      });

      console.log(result);
      res.status(200).json({
        data: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/rejectRequest", (req, res) => {
  const request = req.body;

  AccountRequest.findOneAndUpdate(
    { _id: request._id },
    { $set: { approved: false, status: "Rejected" } },
    { new: true }
  )
    .exec()
    .then((result) => {
      console.log(result);

      res.status(200).json({
        message: "Account request rejected",
      });
    });
});

router.post("/approveRequest", async (req, res) => {
  const request = req.body.request;
  const requestId = request._id;
  const storeName = req.body.storeName;

  console.log("request ", request);
  console.log("storeName ", storeName);

  const usersCount = await User.count().exec();
  AccountRequest.findOneAndUpdate(
    { _id: requestId },
    { $set: { approved: true, status: "Approved" } },
    { new: true }
  )
    .exec()
    .then((result) => {
      console.log(result);

      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: result.email,
        password: result.password,
        name: result.fullName,
        is_exclusive: false,
        exclusive: storeName,
        type: "regular",
        companyName: result.companyName,
        companyAddress: result.companyAddress,
        companyPhone: result.companyPhone,
        companyWebsite: result.companyWebsite,
        companyEIN: result.companyEIN,
        clientType: result.clientType,
        seq: usersCount,
      });

      user
        .save()
        .then((response) => {
          console.log(response);

          let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "noreply.fabricflairusa@gmail.com",
              pass: "?Music247Orange",
            },
          });

          let mailDetails = {
            from: "noreply.fabricflairusa@gmail.com",
            to: req.body.email,
            subject: "FabricFlair Designer Program - Account request approved",
            text: "Your account has been approved. Note: Oders are not dispatched until paid in full. We look forward to a fun and prosperous future with you. To ensure quick dispatch we reccomend leaving payment on file through our secure third party system. Please contact us to set this up",
          };

          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log("Error Occurs");
            } else {
              console.log("Email sent successfully");
            }
          });

          res.status(200).json({
            message: "User added",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    });
});

router.get("/requests", (req, res) => {
  AccountRequest.find()
    .exec()
    .then((result) => {
      res.status(200).json({
        result: result,
      });
    });
});

router.post("/register", (req, res, next) => {
  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    password: req.body.password,
    type: req.body.type,
  });
  newUser
    .save()
    .then((result) => {
      console.log(result);

      res.status(200).json({
        message: "User added",
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
router.post("/login", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email, password: password })
    .exec()
    .then((result) => {
      if (result != null) {
        var token = jwt.sign(
          { id: result._id, email: result.email, type: result.type },
          privateKey,
          (err, encoded) => {
            res.cookie("jwt", encoded);
            res.status(200).json({
              jwt: encoded,
              status: "success",
            });
          }
        );
      } else {
        res.status(500).json({
          status: "failure",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
