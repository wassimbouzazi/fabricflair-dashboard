const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const config = require("./config");
const compression = require("compression");
var cors = require("cors");

mongoose.set("runValidators", true); // here is your global setting

const mongoDB = config.mongoDB;
console.log(`Using ${config.databaseName} as database.`);
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const app = express();
app.use(cors());
app.use(compression());
app.use("/masterfiles", express.static(path.join(__dirname, "masterfiles")));
app.use("/generated", express.static(path.join(__dirname, "generated")));
app.use("/orders", express.static(path.join(__dirname, "orders")));
app.use("/previews", express.static(path.join(__dirname, "previews")));
app.use("/thumbnails", express.static(path.join(__dirname, "thumbnails")));
app.use(
  "/design_masterfiles",
  express.static(path.join(__dirname, "design_masterfiles"))
);
app.use(
  "/medleys/originals",
  express.static(path.join(__dirname, "medleys/originals"))
);
app.use("/medleys", express.static(path.join(__dirname, "medleys/")));
app.use("/invoices", express.static(path.join(__dirname, "invoices/")));
app.use("/exports", express.static(path.join(__dirname, "exports/")));

app.use("/.well-known", express.static(path.join(__dirname, ".well-known/")));

app.use(express.static(path.join(__dirname, "../fabricflair-front/dist")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const fabricRoutes = require("./api/routes/fabric");
const designRoutes = require("./api/routes/design");
const userRoutes = require("./api/routes/user");
const pricingRoutes = require("./api/routes/pricing");
const categoryRoutes = require("./api/routes/categories");
const customersRoutes = require("./api/routes/customers");
const medleyRoutes = require("./api/routes/medley");
const orderRoutes = require("./api/routes/orders");
const dashboardRoutes = require("./api/routes/dashboard");
const backupRoutes = require("./api/routes/backup");

app.use("/fabrics", fabricRoutes);
app.use("/designs", designRoutes);
app.use("/user", userRoutes);
app.use("/pricing", pricingRoutes);
app.use("/categories", categoryRoutes);
app.use("/customers", customersRoutes);
app.use("/medley", medleyRoutes);
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/backup", backupRoutes);

module.exports = app;
