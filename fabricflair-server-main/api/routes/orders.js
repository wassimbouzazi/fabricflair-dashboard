const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Order } = require("../models/order");
const { PrevOrder } = require("../models/order");
const User = require("../models/user");
const Fabric = require("../models/fabric");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
var dateFormat = require("dateformat");

router.post("/generateInvoice", async (req, res) => {
  const orderId = req.body.orderId;
  let order = await Order.findById(orderId).exec();

  let ordered_items = [];
  order.items.forEach((item) => {
    console.log(item);
    ordered_items.push([
      item.type,
      item.fabric_name,
      item.option,
      item.quantity,
      item.price,
      (item.price * item.quantity).toFixed(2),
    ]);
  });

  console.log(ordered_items);

  const data = {
    customer: order.customer,
    customerReference: order.customerReference,
    invoice_number: order.invoice_number,
    invoice_date: dateFormat(order.order_date, "mmmm dS, yyyy"),
    discount: order.discount.toFixed(2),
    total: order.total.toFixed(2),
    name: order.shipping.name,
    address_line_1: order.shipping.address.address_line_1,
    admin_area_1: order.shipping.address.admin_area_1,
    admin_area_2: order.shipping.address.admin_area_2,
    postal_code: order.shipping.address.postal_code,
    country_code: order.shipping.address.country_code,
    items: ordered_items,
  };

  var templateHtml = fs.readFileSync(
    path.join(__dirname, "/template/invoice.html"),
    "utf8"
  );
  console.log(path.join(__dirname, "/template/invoice.html"));
  var template = handlebars.compile(templateHtml);
  var html = template(data);

  var milis = new Date();
  milis = milis.getTime();

  var pdfPath = path.join(
    __dirname,
    "../../invoices",
    `${order.invoice_number}.pdf`
  );

  var options = {
    width: "1230px",
    headerTemplate: "<p></p>",
    footerTemplate: "<p></p>",
    displayHeaderFooter: false,
    margin: {
      top: "10px",
      bottom: "30px",
    },
    printBackground: true,
    path: pdfPath,
  };

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

  var page = await browser.newPage();
  await page.goto(`data:text/html;charset=UTF-8,${html}`, {
    waitUntil: "networkidle0",
  });

  await page.pdf(options);
  await browser.close();

  res.json({
    message: "success",
    invoicePath: `${order.invoice_number}.pdf`,
  });
});

router.post("/changeOrderStatus", (req, res) => {
  let status = req.body.status;
  let orderId = req.body.orderId;
  let tracking_number = req.body.tracking_number;
  console.log(tracking_number);

  if (status == "Shipped") {
    Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          status: status,
          tracking_number: tracking_number,
        },
      },
      { new: true }
    )
      .exec()
      .then((result) => {
        console.log(result);
        res.status(200).json({
          message: "success",
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } else {
    Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          status: status,
          tracking_number: null,
        },
      },
      { new: true }
    )
      .exec()
      .then((result) => {
        console.log(result);
        res.status(200).json({
          message: "success",
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
});

function runScriptwithoutExlusive(
  fabricName,
  masterfilePath,
  extension,
  item_code,
  seamless,
  inches,
  ratio,
  landscape,
  hex,
  path1,
  path2,
  path3,
  size,
  cut_type,
  texture
) {
  return spawn("python3", [
    "-u",
    path.join(__dirname, "../../processor/main.py"),
    fabricName,
    masterfilePath,
    extension,
    item_code,
    seamless,
    inches,
    ratio,
    landscape,
    hex,
    path1,
    path2,
    path3,
    size,
    cut_type,
    texture,
  ]);
}

function runScriptwithExlusive(
  fabricName,
  masterfilePath,
  extension,
  item_code,
  seamless,
  inches,
  ratio,
  landscape,
  hex,
  path1,
  path2,
  path3,
  exclusive,
  size,
  cut_type,
  texture
) {
  console.log("arguments", arguments);
  return spawn("python3", [
    "-u",
    path.join(__dirname, "../../processor/main.py"),
    fabricName,
    masterfilePath,
    extension,
    item_code,
    seamless,
    inches,
    ratio,
    landscape,
    hex,
    path1,
    path2,
    path3,
    size,
    cut_type,
    texture,
    exclusive,
  ]);
}

router.post("/createOrder", async (req, res, next) => {
  let order = req.body.data;
  /*   console.log(order);
   */
  let order_items = order.items;
  order_items.forEach(function (order) {
    delete order.order_date;
    delete order._id;
    order.fabric_id = mongoose.Types.ObjectId(order.fabric_id);
  });

  const userInfo = await User.findById(order.user_id)
    .select("email exclusive companyPhone seq name companyAddress")
    .exec();
  /*   console.log(userInfo);
   */

  User.findOneAndUpdate({ _id: order.user_id }, { $set: { cart: [] } }).exec();

  const ordersCount = await Order.count({
    designer_program_email: userInfo.email,
  }).exec();
  /*   console.log(ordersCount);
   */

  if (order.payment_method == "Paypal") {
    const order_model = new Order({
      _id: new mongoose.Types.ObjectId(),
      status: "Paid",
      order_date: new Date(),
      invoice_number: userInfo.seq + "-" + ordersCount,
      customer: userInfo.exclusive,
      total: order.total,
      discount: order.discount,
      payee_email: order.payee_email,
      designer_program_email: userInfo.email,
      account_phone_number: userInfo.companyPhone,
      items: order_items,
      shipping: {
        name: order.shipping.name.full_name,
        address: order.shipping.address,
      },
    });

    order_model
      .save()
      .then(async (result) => {
        order_items.forEach(async (item) => {
          let fabric = await Fabric.findOne({ _id: item.fabric_id }).exec();
          console.log(fabric);

          // Python Script Params

          let fabricName = fabric.title;
          let masterfilePath = fabric["masterFile"]
            .split(".")
            .slice(0, -1)
            .join(".");
          let extension = fabric["masterFile"].substr(
            fabric["masterFile"].lastIndexOf(".") + 1
          );
          let item_code = fabric.item_code;
          let seamless = fabric.seamless == true ? "1" : "0";
          let inches = fabric.inches;
          let ratio = fabric.ratio;
          let hex = fabric.hex;
          let exclusive = fabric.exclusive;
          let landscape = fabric.landscape == true ? "1" : "0";

          //

          let size = item.product == "us" ? 56 : 42;
          let texture = item.type.split("-").join("");
          let cut_type;
          if (item.option.includes("panel")) {
            cut_type = "full-panel";
          } else if (item.option == "regular-cut") {
            cut_type = "fat-quarter";
          } else {
            cut_type = item.option;
          }

          console.log(
            "ALL DATA",
            fabricName,
            masterfilePath,
            extension,
            item_code,
            seamless,
            inches,
            ratio,
            hex,
            exclusive,
            landscape,
            size,
            cut_type,
            texture
          );
          let dir = path.join(
            __dirname,
            "../../orders/" + userInfo.seq + "-" + ordersCount
          );

          // Create order folder
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }

          // End

          if (exclusive == "General Release") {
            const subprocess = runScriptwithoutExlusive(
              fabricName,
              masterfilePath,
              extension,
              item_code,
              seamless,
              inches,
              ratio,
              landscape,
              hex,
              path.join(__dirname, "../../processor/"),
              dir + "/",
              path.join(__dirname, "../../"),
              size,
              cut_type,
              texture
            );
            console.log("without exclusive");

            subprocess.stdout.on("data", (data) => {
              console.log(`data:${data}`);
            });
            subprocess.stderr.on("data", (data) => {
              console.log(`error:${data}`);
            });
          } else {
            const subprocess = runScriptwithExlusive(
              fabricName,
              masterfilePath,
              extension,
              item_code,
              seamless,
              inches,
              ratio,
              landscape,
              hex,
              path.join(__dirname, "../../processor/"),
              dir + "/",
              path.join(__dirname, "../../"),
              exclusive,
              size,
              cut_type,
              texture
            );
            console.log("with exclusive");

            subprocess.stdout.on("data", (data) => {
              console.log(`data:${data}`);
            });
            subprocess.stderr.on("data", (data) => {
              console.log(`error:${data}`);
            });
          }
        });

        console.log(result);
        res.status(200).json({
          message: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  } else {
    const order_model = new Order({
      _id: new mongoose.Types.ObjectId(),
      status: "Unprocessed",
      reference: order.reference,
      customerReference: order.customerReference,
      order_date: new Date(),
      invoice_number: userInfo.seq + "-" + ordersCount,
      customer: userInfo.exclusive,
      total: order.total,
      discount: order.discount,
      payee_email: userInfo.email,
      designer_program_email: userInfo.email,
      account_phone_number: userInfo.companyPhone,
      items: order_items,
      shipping: {
        name: userInfo.name,
        address: {
          address_line_1: userInfo.companyAddress.companyAddressLine,
          admin_area_1: "",
          admin_area_2: "",
          country_code: userInfo.companyAddress.companyAddressCountry,
          postal_code: userInfo.companyAddress.companyAddressPostcode,
        },
      },
    });

    order_model
      .save()
      .then(async (result) => {
        order_items.forEach(async (item) => {
          let fabric = await Fabric.findOne({ _id: item.fabric_id }).exec();
          console.log(fabric);

          // Python Script Params

          let fabricName = fabric.title;
          let masterfilePath = fabric["masterFile"]
            .split(".")
            .slice(0, -1)
            .join(".");
          let extension = fabric["masterFile"].substr(
            fabric["masterFile"].lastIndexOf(".") + 1
          );
          let item_code = fabric.item_code;
          let seamless = fabric.seamless == true ? "1" : "0";
          let inches = fabric.inches;
          let ratio = fabric.ratio;
          let hex = fabric.hex;
          let exclusive = fabric.exclusive;
          let landscape = fabric.landscape == true ? "1" : "0";

          //

          let size = item.product == "us" ? 56 : 42;
          let texture = item.type.split("-").join("");
          let cut_type;
          if (item.option.includes("panel")) {
            cut_type = "full-panel";
          } else if (item.option == "regular-cut") {
            cut_type = "fat-quarter";
          } else {
            cut_type = item.option;
          }

          console.log(
            "ALL DATA",
            fabricName,
            masterfilePath,
            extension,
            item_code,
            seamless,
            inches,
            ratio,
            hex,
            exclusive,
            landscape,
            size,
            cut_type,
            texture
          );
          let dir = path.join(
            __dirname,
            "../../orders/" + userInfo.seq + "-" + ordersCount
          );

          // Create order folder
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }

          // End

          if (exclusive == "General Release") {
            const subprocess = runScriptwithoutExlusive(
              fabricName,
              masterfilePath,
              extension,
              item_code,
              seamless,
              inches,
              ratio,
              landscape,
              hex,
              path.join(__dirname, "../../processor/"),
              dir + "/",
              path.join(__dirname, "../../"),
              size,
              cut_type,
              texture
            );
            console.log("without exclusive");

            subprocess.stdout.on("data", (data) => {
              console.log(`data:${data}`);
            });
            subprocess.stderr.on("data", (data) => {
              console.log(`error:${data}`);
            });
          } else {
            const subprocess = runScriptwithExlusive(
              fabricName,
              masterfilePath,
              extension,
              item_code,
              seamless,
              inches,
              ratio,
              landscape,
              hex,
              path.join(__dirname, "../../processor/"),
              dir + "/",
              path.join(__dirname, "../../"),
              exclusive,
              size,
              cut_type,
              texture
            );
            console.log("with exclusive");

            subprocess.stdout.on("data", (data) => {
              console.log(`data:${data}`);
            });
            subprocess.stderr.on("data", (data) => {
              console.log(`error:${data}`);
            });
          }
        });

        console.log(result);
        res.status(200).json({
          message: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
});

router.get("/getOrders", (req, res) => {
  Order.find()
    .then((result) => {
      res.status(200).json({
        orders: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/getUserPrevOrders", (req, res) => {
  Order.find({ designer_program_email: req.body.user_email })
    .then((result) => {
      res.status(200).json({
        prevorders: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/getUserOrderFabrics", (req, res) => {
  Order.findByIdAndUpdate(req.body.id)
    .then((result) => {
      res.status(200).json({
        fabrics: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:orderId", (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findOne({ _id: orderId })
    .exec()
    .then((result) => {
      console.log(result);
      // Append order images to result

      const imagesFolder = "./orders/" + result.invoice_number;
      let paths = [];

      function GetFiles(Directory) {
        fs.readdirSync(Directory).forEach((File) => {
          const Absolute = path.join(Directory, File);
          if (fs.statSync(Absolute).isDirectory()) return GetFiles(Absolute);
          else
            return paths.push({
              path: path.resolve(__dirname, `../../` + Absolute),
              filename: File,
              img_link: Absolute,
            });
        });
      }

      GetFiles(imagesFolder);

      res.status(200).json({
        message: "success",
        order: result,
        order_images: paths,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/getOrderImages/:invoice_number", (req, res, next) => {
  const imagesFolder = "./orders/" + req.params.invoice_number;
  let paths = [];

  function GetFiles(Directory) {
    fs.readdirSync(Directory).forEach((File) => {
      const Absolute = path.join(Directory, File);
      if (fs.statSync(Absolute).isDirectory())
        return ThroughDirectory(Absolute);
      else
        return paths.push({
          path: path.resolve(__dirname, `../../` + Absolute),
          filename: File,
        });
    });
  }

  GetFiles(imagesFolder);

  res.status(200).json({
    files: paths,
  });
});

router.get("/downloadImage/:data", (req, res) => {
  const data = JSON.parse(
    req.params.data.split("alahalahaalykabidi").join("/")
  );

  const imagePath = data.imagePath;
  const imageName = data.imageName;

  var stat = fs.statSync(imagePath);

  res.writeHead(200, {
    "Content-Length": stat.size,
    "Content-Disposition": `attachment; filename=${imageName}.zip`,
  });

  fs.createReadStream(imagePath).pipe(res);
});

module.exports = router;
