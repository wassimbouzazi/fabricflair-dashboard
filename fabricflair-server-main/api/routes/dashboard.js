const express = require("express");
const Fabric = require("../models/fabric");
const { Order } = require("../models/order");
const User = require("../models/user");
const router = express.Router();
const path = require("path");
const du = require("du");

const formatBytes = (a, b = 2, k = 1024) => {
  with (Math) {
    let d = floor(log(a) / log(k));
    return 0 == a
      ? "0 Bytes"
      : parseFloat((a / pow(k, d)).toFixed(max(0, b))) +
          " " +
          ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d];
  }
};

router.get("/getDatabaseInfo", async (req, res, next) => {
  try {
    const fabricsCount = await Fabric.countDocuments({}).exec();

    const generatedFolderSize = await du(
      path.resolve(__dirname, "../../generated").toString()
    );

    const masterfilesFolderSize = await du(
      path.resolve(__dirname, "../../masterfiles").toString()
    );

    const ordersCount = await Order.countDocuments({}).exec();

    const ordersFolderSize = await du(
      path.resolve(__dirname, "../../orders").toString()
    );

    const unprocessedOrders = await Order.find({
      status: "Unprocessed",
    }).exec();

    const customersCount = await User.countDocuments({
      type: "regular",
    }).exec();

    const exclusiveCustomersCount = await User.countDocuments({
      type: "regular",
      is_exclusive: true,
    }).exec();

    return res.status(200).json({
      fabricsCount: fabricsCount,
      generatedFolderSize: formatBytes(generatedFolderSize),
      masterfilesFolderSize: formatBytes(masterfilesFolderSize),
      ordersCount: ordersCount,
      ordersFolderSize: formatBytes(ordersFolderSize),
      unprocessedOrdersCount: unprocessedOrders.length,
      customersCount: customersCount,
      exclusiveCustomersCount: exclusiveCustomersCount,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }
});

router.get("/status", (req, res, next) => {
  return res.status(200).send("System up.");
});

module.exports = router;
