const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Backup = require("../models/backup");
const Orders = require("../models/order");
const Fabrics = require("../models/fabric");
const Users = require("../models/user");
const Designs = require("../models/design");
const Medleys = require("../models/medley");
const Pricings = require("../models/pricing");
const Requestaccounts = require("../models/account_request");
const fastcsv = require("fast-csv");
const zipper = require("zip-local");
const fs = require("fs").promises;
const fss = require("fs");
const path = require("path");
const fabric = require("../models/fabric");

router.get("/dailyBackup", async (req, res, next) => {
  fileNames = [];
  folderName = +new Date();

  fabricsList = [];
  data = await Fabrics.find({}, null, { lean: true }).exec();
  for (const fabric of data) {
    fabricsList.push(fabric.masterFile.split("/")[1]);
  }

  await fs.mkdir(
    path.join(__dirname, "../../exports", folderName.toString()),
    { recursive: true },
    (err) => {
      if (err) throw err;
    }
  );

  for (const collectionName of [
    "orders",
    "fabrics",
    "users",
    "designs",
    "medleys",
    "pricings",
    "requestaccounts",
  ]) {
    switch (collectionName) {
      case "orders":
        data = await Orders.Order.find({}, null, { lean: true }).exec();
        break;
      case "fabrics":
        data = await Fabrics.find({}, null, { lean: true }).exec();
        break;
      case "users":
        data = await Users.find({}, null, { lean: true }).exec();
        break;
      case "designs":
        data = await Designs.find({}, null, { lean: true }).exec();
        break;
      case "medleys":
        data = await Medleys.find({}, null, { lean: true }).exec();
        break;
      case "pricings":
        data = await Pricings.find({}, null, { lean: true }).exec();
        break;
      case "requestaccounts":
        data = await Requestaccounts.find({}, null, { lean: true }).exec();
        break;
      default:
        res.status(500).json({
          message: "Please specify collectionName/Wrong collectionName",
        });
        return;
    }

    timestamp = +new Date();
    filename = `${timestamp}_${collectionName}.json`;
    fileNames.push(filename);

    await fs.writeFile(
      path.join(__dirname, "../../exports", folderName.toString(), filename),
      JSON.stringify(data),
      (err) => {
        if (err) throw err;
        console.log(`complete ${collectionName}`);
      }
    );
  }

  zipper.sync
    .zip(path.join(__dirname, "../../exports", folderName.toString()))
    .compress()
    .save(
      path.join(
        __dirname,
        "../../exports",
        `${new Date().toISOString().split("T")[0]}.zip`
      )
    );

  fss.rmSync(path.join(__dirname, "../../exports", folderName.toString()), {
    recursive: true,
    force: true,
  });

  await res.status(200).json({
    message: "Done.",
    resultFile: `${new Date().toISOString().split("T")[0]}.zip`,
    fabrics: fabricsList,
  });
});

router.post("/export", async (req, res, next) => {
  collectionName = req.body.collectionName;
  exportFormat = req.body.exportFormat;
  data = [];

  switch (collectionName) {
    case "orders":
      data = await Orders.Order.find({}, null, { lean: true }).exec();
      break;
    case "fabrics":
      data = await Fabrics.find({}, null, { lean: true }).exec();
      break;
    case "users":
      data = await Users.find({}, null, { lean: true }).exec();
      break;
    case "designs":
      data = await Designs.find({}, null, { lean: true }).exec();
      break;
    case "medleys":
      data = await Medleys.find({}, null, { lean: true }).exec();
      break;
    case "pricings":
      data = await Pricings.find({}, null, { lean: true }).exec();
      break;
    case "requestaccounts":
      data = await Requestaccounts.find({}, null, { lean: true }).exec();
      break;
    default:
      res.status(500).json({
        message: "Please specify collectionName/Wrong collectionName",
      });
      return;
  }

  if (exportFormat == "csv") {
    data.map((object) => {
      Object.keys(object).forEach((key) => {
        if (typeof object[key] === "object") {
          object[key] = JSON.stringify(object[key]);
        }
      });
    });
  }

  timestamp = +new Date();
  filename = `${timestamp}_${collectionName}.${exportFormat}`;

  const ws = fss.createWriteStream(
    path.join(__dirname, "../../exports", filename)
  );

  if (exportFormat == "csv") {
    fastcsv
      .write(data, { headers: true })
      .on("finish", function () {
        console.log(`Write to ${filename} successfully!`);
      })
      .pipe(ws);
  } else {
    fs.writeFile(
      path.join(__dirname, "../../exports", filename),
      JSON.stringify(data),
      function (err) {
        if (err) throw err;
        console.log("complete");
      }
    );
  }

  res.status(200).json({ message: "Done.", path: filename });
});

module.exports = router;
