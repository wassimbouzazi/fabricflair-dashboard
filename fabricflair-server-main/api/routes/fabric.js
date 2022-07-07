const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Fabric = require("../models/fabric");
const User = require("../models/user");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const zl = require("zip-lib");
const asyncSpawn = require("await-spawn");
const { spawn } = require("child_process");
var dateFormat = require("dateformat");
const lignator = require("lignator");
var unirest = require("unirest");
const config = require("../../config");
const imageThumbnail = require("image-thumbnail");
require("dotenv").config();

router.post("/generateSpecific", async (req, res) => {
  let fabricId = req.body.fabricId;
  let size = req.body.size;
  let cut_type = req.body.cut_type;
  let fabric_type = req.body.fabric_type;

  let fabric = await Fabric.findOne({ _id: fabricId }).exec();

  let fabricName = fabric.title;
  let masterfilePath = fabric["masterFile"].split(".").slice(0, -1).join(".");
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

  if (exclusive == "General Release") {
    try {
      await asyncRunScriptwithoutExlusiveSpecific(
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
        path.join(__dirname, "../../generated/"),
        path.join(__dirname, "../../"),
        size,
        cut_type,
        fabric_type
      );
      console.log("without exclusive");
    } catch (e) {
      console.log(e.stderr.toString());
    }
  } else {
    try {
      await asyncRunScriptwithExlusiveSpecific(
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
        path.join(__dirname, "../../generated/"),
        path.join(__dirname, "../../"),
        size,
        cut_type,
        fabric_type,
        exclusive
      );
      console.log("with exclusive");
    } catch (e) {
      console.log(e.stderr.toString());
    }
  }

  res.status(200).json({
    message: "success",
  });
});

router.post("/generateFabricsV2", async (req, res) => {
  let fabricId = req.body.fabricId;
  let fabric = await Fabric.findOne({ _id: fabricId }).exec();

  let fabricName = fabric.title;
  let masterfilePath = fabric["masterFile"].split(".").slice(0, -1).join(".");
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
      path.join(__dirname, "../../generated/"),
      path.join(__dirname, "../../")
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
      path.join(__dirname, "../../generated/"),
      path.join(__dirname, "../../"),
      exclusive
    );
    console.log("with exclusive");

    subprocess.stdout.on("data", (data) => {
      console.log(`data:${data}`);
    });
    subprocess.stderr.on("data", (data) => {
      console.log(`error:${data}`);
    });
  }

  res.status(200).json({
    message: "success",
  });
});

router.post("/deleteOrder", (req, res) => {
  //console.log(req.body.user_id);
  //console.log(req.body.orderId);

  User.update(
    { _id: req.body.user_id },
    { $pull: { cart: { _id: req.body.orderId } } },
    { multi: true }
  )
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "success",
      });
    })
    .catch((err) => {
      console.log(error);
    });
});

router.post("/updateOrder", (req, res) => {
  let order = req.body.order;

  User.update(
    { "cart._id": order._id },
    {
      $set: {
        "cart.$.product": order.product,
        "cart.$.option": order.option,
        "cart.$.type": order.type,
        "cart.$.hasSilver": order.hasSilver,
        "cart.$.quantity": order.quantity,
      },
    },
    (err, result) => {
      res.status(200).json({
        message: "success",
      });
    }
  );
});

router.post("/getCart", (req, res) => {
  User.findOne({ _id: req.body.user_id }, async (err, result) => {
    let fabricsIds = [];
    let deletedFabrics = [];
    result["cart"].forEach((order) => {
      fabricsIds.push(order.fabric_id);
    });

    let masterFiles = [];
    for (const fabricId of fabricsIds) {
      queryResult = await Fabric.findOne({ _id: fabricId }).exec();

      if (queryResult) {
        masterFiles.push({
          _id: queryResult._id,
          masterFile: queryResult.masterFile,
        });
      } else {
        deletedFabrics.push(fabricId);
        console.log(fabricId);
      }
    }

    res.status(200).json({
      orders: { cart: result["cart"] },
      masterFiles: masterFiles,
      discount: result.discount,
      deletedFabrics: deletedFabrics,
    });
  });
});

router.post("/orderfabric", (req, res) => {
  user_id = req.body.user_id;
  order_data = req.body.order_data;
  order_data.order_date = new Date();
  order_data.fabric_id = mongoose.Types.ObjectId(order_data.fabric_id);

  console.log(order_data);

  User.update({ _id: user_id }, { $addToSet: { cart: order_data } })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "success",
        result: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/getFabricNames", (req, res) => {
  Fabric.find()
    .select("title masterFile")
    .exec()
    .then((result) => {
      res.status(200).json({
        fabrics: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/generatePrevious", (req, res, next) => {
  Fabric.find()
    .exec()
    .then((docs) => {
      docs.forEach((doc) => {
        console.log(doc.masterFile);
        runScriptTexturePreviews(
          doc.masterFile,
          path.join(__dirname, "../../previews")
        );
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/generatePreview", (req, res) => {
  let imagePath = path.join(__dirname, "../../" + req.body.imagePath);
  let outputPath = path.join(__dirname, "../../previews");
  const subprocess = runScriptTexturePreviews(
    imagePath,
    outputPath,
    req.body.state
  );

  x;
  subprocess.stdout.on("data", (data) => {
    console.log(`data:${data}`);
  });
  subprocess.stderr.on("data", (data) => {
    console.log(`error:${data}`);
  });
});

router.post("/getFabricImagesPaths", (req, res) => {
  console.log("getting images");
  const folder = path.join(__dirname, "../../generated/") + req.body.fabricName;
  fs.readdir(folder, (err, files) => {
    if (err) {
      res.send("error");
      return;
    }

    //console.log(files);

    res.status(200).json({
      files: files,
    });
  });
});

router.get("/getItemCode", (req, res) => {
  let date = dateFormat(new Date(), "ddmmyy");
  let regex = "^" + date;

  console.log(regex);

  Fabric.find({ item_code: { $regex: regex } })
    .sort({ additionDate: 1 })
    .exec()
    .then((docs) => {
      console.log(docs);
      if (docs.length != 0) {
        let itemCodeNumber = docs[docs.length - 1].item_code;
        const lastItem = parseInt(
          itemCodeNumber.substring(itemCodeNumber.indexOf("-") + 1)
        );

        res.status(200).json({
          code: date + "-" + parseInt(lastItem + 1),
        });
      } else {
        res.status(200).json({
          code: date + "-" + 1,
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

function runScriptTexturePreviews(imagePath, outputPath, state) {
  return spawn("python3", [
    "-u",
    path.join(__dirname, "../../preview_generator/generate.py"),
    imagePath,
    outputPath,
    path.join(__dirname, "../../preview_generator/"),
    state,
  ]);
}

function runScriptTextureThumbnails(imagePath, outputPath, state) {
  return spawn("python3", [
    "-u",
    path.join(__dirname, "../../thumbnail_generator/generate.py"),
    imagePath,
    outputPath,
    state,
  ]);
}

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
  path3
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
    "all",
  ]);
}

async function asyncRunCheckMode(file_path) {
  return await asyncSpawn("python3", [
    "-u",
    path.join(__dirname, "../../processor/checkmode.py"),
    file_path,
  ]);
}

async function asyncRunScriptwithoutExlusiveSpecific(
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
  fabric_type
) {
  return await asyncSpawn("python3", [
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
    fabric_type,
  ]);
}

function runScriptwithoutExlusiveSpecific(
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
  fabric_type
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
    fabric_type,
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
  exclusive
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
    "all",
    exclusive,
  ]);
}

async function asyncRunScriptwithExlusiveSpecific(
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
  fabric_type,
  exclusive
) {
  return await asyncSpawn("python3", [
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
    fabric_type,
    exclusive,
  ]);
}

function runScriptwithExlusiveSpecific(
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
  fabric_type,
  exclusive
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
    fabric_type,
    exclusive,
  ]);
}

router.post("/generate", (req, res, next) => {
  let fabricName = req.body.fabricName;
  let masterfilePath = req.body.masterfilePath;
  let extension = req.body.extension;
  let item_code = req.body.item_code;
  let seamless = req.body.seamlessValue;
  let inches = req.body.inches;
  let ratio = req.body.ratio;
  let hex = req.body.hex;
  let exclusive = req.body.exclusive;

  if (exclusive == null) {
    const subprocess = runScriptwithoutExlusive(
      fabricName,
      masterfilePath,
      extension,
      item_code,
      seamless,
      inches,
      ratio,
      hex,
      path.join(__dirname, "../../processor/"),
      path.join(__dirname, "../../generated/"),
      path.join(__dirname, "../../")
    );
    console.log("without exclusive");

    res.status(200).json({
      message: "started",
    });

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
      hex,
      path.join(__dirname, "../../processor/"),
      path.join(__dirname, "../../generated/"),
      path.join(__dirname, "../../"),
      exclusive
    );
    console.log("with exclusive");

    res.status(200).json({
      message: "started",
    });

    subprocess.stdout.on("data", (data) => {
      console.log(`data:${data}`);
    });
    subprocess.stderr.on("data", (data) => {
      console.log(`error:${data}`);
    });
  }
});

router.post("/generateExclusive", (req, res, next) => {
  let fabricName = req.body.fabricName;
  let masterfilePath = req.body.masterfilePath;
  let extension = req.body.extension;
  let item_code = req.body.item_code;
  let seamless = req.body.seamless;
  let inches = req.body.inches;
  let ratio = req.body.ratio;
  let hex = req.body.hex;
  let exclusive = req.body.exclusive;

  console.log("with exclusive");
  console.log(exclusive);

  const subprocess = runScriptwithExlusive(
    fabricName,
    masterfilePath,
    extension,
    item_code,
    seamless,
    inches,
    ratio,
    hex,
    path.join(__dirname, "../../processor/"),
    path.join(__dirname, "../../generated/"),
    path.join(__dirname, "../../"),
    exclusive
  );

  subprocess.stderr.on("close", () => {
    console.log("Closed");
    res.status(200).json({
      output: "generated",
    });
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./masterfiles/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().split(":").join("_") +
        file.originalname.split(" ").join("_")
    );
    // cb(null, new Date.now()+"")
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else cb(null, false);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
  fileFilter: imageFilter,
});

//Post fabric data
router.post("/postFabric", upload.single("masterfile"), (req, res, next) => {
  Fabric.findOne({ title: req.body.title }, async (err, fabric) => {
    if (fabric) {
      res.status(500).json({
        error: "A fabric with the same title already exists in Database.",
      });
    } else {
      // Check if file is cmyk
      const checkProccess = await asyncRunCheckMode(
        path.join(__dirname, "../../") + req.file.path
      );

      if (!checkProccess.toString().includes("noncmyk")) {
        res.status(500).json({
          error:
            "CMYK Upload is not yet supported, please make sure to convert it first.",
        });
      } else {
        let landscapeBoolValue = req.body.landscape == 0 ? false : true;

        const fabric = new Fabric({
          _id: new mongoose.Types.ObjectId(),
          title: req.body.title,
          description: req.body.description,
          videoUrl: req.body.videoUrl,
          price: req.body.price,
          seamless: req.body.seamless,
          hashtags: req.body.hashtags,
          masterFile: req.file.path,
          additionDate: new Date(),
          item_code: req.body.item_code,
          categories: req.body.categories,
          added_by: req.body.added_by,
          inches: req.body.inches,
          hex: req.body.hex,
          ratio: req.body.ratio,
          exclusive: req.body.exclusive,
          landscape: landscapeBoolValue,
        });

        fabric
          .save()
          .then((result) => {
            // Once file upload and data is added, generate preview
            let imagePath = path.join(
              __dirname,
              "../../" + result["masterFile"]
            );
            let outputPath = path.join(__dirname, "../../previews");
            const subprocess1 = runScriptTexturePreviews(
              imagePath,
              outputPath,
              req.body.state
            );

            subprocess1.stdout.on("data", (data) => {
              console.log(`data:${data}`);
            });
            subprocess1.stderr.on("data", (data) => {
              console.log(`error:${data}`);
            });

            outputPath = path.join(__dirname, "../../thumbnails");
            const subprocess2 = runScriptTextureThumbnails(
              imagePath,
              outputPath,
              req.body.state
            );

            subprocess2.stdout.on("data", (data) => {
              console.log(`data:${data}`);
            });
            subprocess2.stderr.on("data", (data) => {
              console.log(`error:${data}`);
            });

            // Generate ordering previews OF BASE IMAGE.
            let fabricName = req.body.fabricName;
            let masterfilePath = result["masterFile"]
              .split(".")
              .slice(0, -1)
              .join(".");
            let extension = req.body.extension;
            let item_code = req.body.item_code;
            let seamless = req.body.seamlessValue;
            let inches = req.body.inches;
            let ratio = req.body.ratio;
            let hex = req.body.hex;
            let exclusive = req.body.exclusive;
            let landscape = req.body.landscape;

            // Generate previews
            const orderdingCutTypes = [
              "fat-16",
              "fat-12",
              "fat-9",
              "fat-8",
              "fat-quarter",
              "fat-half",
              "full-panel",
            ];

            const orderingSize = [56];
            const orderingFabricType = "14aida";

            orderdingCutTypes.forEach((cutType) => {
              const subprocess = runScriptwithoutExlusiveSpecific(
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
                path.join(__dirname, "../../previews/"),
                path.join(__dirname, "../../"),
                orderingSize,
                cutType,
                orderingFabricType
              );

              subprocess.stdout.on("data", (data) => {
                console.log(`data:${data}`);
              });
            });

            res.status(200).json({
              message: "success",
              fabricData: result,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    }
  });
});

router.post("/getAllFabrics", async (req, res) => {
  const userId = req.body.userId;
  let data;

  let user_exclusives = null;
  let general;

  const user = await User.findById(userId);

  if (user.is_exclusive) {
    user_exclusives = await Fabric.find({ exclusive: user.exclusive })
      .sort({ additionDate: "desc" })
      .exec();
  }
  general = await Fabric.find({ exclusive: "General Release" })
    .sort({ additionDate: "desc" })
    .exec();

  if (user.is_exclusive) {
    data = {
      all: user_exclusives.concat(general),
      general: general,
      user_exclusives: user_exclusives,
    };
  } else {
    data = { all: general, general: general, user_exclusives: user_exclusives };
  }

  res.status(200).json({
    data: data,
  });
});

router.get("/getFabrics", async (req, res, next) => {
  let fabrics = await Fabric.find().sort({ additionDate: "desc" }).exec();
  let exclusives = await User.find({ is_exclusive: true })
    .select("exclusive")
    .exec();

  console.log(exclusives);
  res.status(200).json({
    message: "Getting all items",
    fabrics: fabrics,
    exclusives: exclusives,
  });
});

router.get("/getPreviews", (req, res, next) => {
  Fabric.find()
    .exec()
    .then((docs) => {
      preview = [];
      docs.forEach((fabric) => {
        prev = fabric.masterFile.replace("masterfiles/", "");
        prev = prev.split(":").join("_");
        fs.appendFile("valid.txt", prev + "\n", function (err) {});
        preview.push(fabric.masterFile.replace("masterfiles/", ""));
      });

      console.log(docs);
      res.status(200).json({
        names: preview,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/getUserFabrics/:added_by", (req, res, next) => {
  Fabric.find({ added_by: req.params.added_by })
    .exec()
    .then((docs) => {
      res.status(200).json({
        message: "Getting all items",
        fabrics: docs,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Delete generated files
router.delete("/deleteGenerated/:fabricId", (req, res, next) => {
  const fabricId = req.params.fabricId;

  Fabric.findOne({ _id: fabricId }, (err, fabric) => {
    let fabricTitle = fabric.title;
    fabricTitle = fabricTitle.split(" ").join("_");

    const filePath = path.join(__dirname, "../../generated/" + fabricTitle);
    fs.rmSync(filePath, { recursive: true, force: true });

    console.log("Directory deleted.");
    res.status(200).json({
      message: "Successfully purged generated files.",
    });
  });
});

//Delete an item
router.delete("/:fabricId", (req, res, next) => {
  const fabricId = req.params.fabricId;

  Fabric.findOne({ _id: fabricId }, (err, fabric) => {
    let fabricTitle = fabric.title;
    fabricTitle = fabricTitle.split(" ").join("_");

    const filePath = path.join(__dirname, "../../generated/" + fabricTitle);
    fs.rmSync(filePath, { recursive: true, force: true });

    const previewsFilePath = path.join(
      __dirname,
      "../../previews/" + fabricTitle
    );
    fs.rmSync(previewsFilePath, { recursive: true, force: true });

    console.log("Directory deleted.");
    Fabric.remove({ _id: fabricId })
      .exec()
      .then((result) => {
        console.log(result);
        res.status(200).json({
          message: "Successfully deleted the fabric, updated users carts.",
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

router.patch("/deleteFile", (req, res, next) => {
  const filePath = req.body.filePath;
  lignator.remove(
    path.join(__dirname, "../../generated/" + req.body.folderName)
  );

  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
      res.status(200).json({
        message: err,
      });
    } else {
      res.status(200).json({
        message: "deleted file",
      });
    }
  });
});

router.patch("/editFabric", (req, res, next) => {
  const olddata = req.body.old;
  const newdata = req.body.new;

  newdata.bgColor = newdata.bgColor.includes("#")
    ? newdata.bgColor.substring(1)
    : newdata.bgColor;

  const new_ratio_value = newdata.keep_ratio === true ? "1" : "0";

  if (olddata.title != newdata.title) {
    // Check if there is already a fabric with that name.
    Fabric.findOne({ title: newdata.title })
      .then((result) => {
        if (result == null) {
          // Update and check if regeneration is required.
          Fabric.findOneAndUpdate(
            { _id: olddata._id },
            {
              $set: {
                title: newdata.title,
                description: newdata.description,
                videoUrl: newdata.videoUrl,
                notes: newdata.notes,
                shelfLocation: newdata.shelfLocation,
                price: newdata.price,
                hashtags: newdata.hashtags,
                inches: newdata.inches,
                exclusive: newdata.exclusive,
                hex: newdata.bgColor,
                seamless: newdata.seamless,
                ratio: new_ratio_value,
                landscape: newdata.landscape,
              },
            },
            { new: true }
          )
            .exec()
            .then((fabric) => {
              // New name, hence, delete and regenerate.
              // DELETE
              lignator.remove(
                path.join(
                  __dirname,
                  "../../generated/" + olddata.title.split(" ").join("_")
                )
              );

              res.status(200).json({
                message: "Fabric data updated, old generations deleted.",
              });
            });
        } else {
          console.log("A fabric with the chosen name already exists");
          res.status(200).json({
            message: "A fabric with the chosen name already exists",
          });
          return;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    // Check if generation params are the same and update
    if (
      olddata.inches == newdata.inches &&
      olddata.exclusive == newdata.exclusive &&
      olddata.hex == newdata.bgColor &&
      olddata.seamless == newdata.seamless &&
      olddata.ratio == new_ratio_value &&
      olddata.landscape == newdata.landscape
    ) {
      Fabric.findOneAndUpdate(
        { _id: olddata._id },
        {
          $set: {
            title: newdata.title,
            description: newdata.description,
            videoUrl: newdata.videoUrl,
            notes: newdata.notes,
            shelfLocation: newdata.shelfLocation,
            price: newdata.price,
            hashtags: newdata.hashtags,
            inches: newdata.inches,
            exclusive: newdata.exclusive,
            hex: newdata.bgColor,
            seamless: newdata.seamless,
            ratio: new_ratio_value,
            landscape: newdata.landscape,
          },
        },
        { new: true }
      )
        .exec()
        .then((fabric) => {
          console.log("Successfully updated.");
          res.status(200).json({
            message: "Fabric data updated.",
          });
        });
    } else {
      Fabric.findOneAndUpdate(
        { _id: olddata._id },
        {
          $set: {
            title: newdata.title,
            description: newdata.description,
            videoUrl: newdata.videoUrl,
            notes: newdata.notes,
            shelfLocation: newdata.shelfLocation,
            price: newdata.price,
            hashtags: newdata.hashtags,
            inches: newdata.inches,
            exclusive: newdata.exclusive,
            hex: newdata.bgColor,
            seamless: newdata.seamless,
            ratio: new_ratio_value,
            landscape: newdata.landscape,
          },
        },
        { new: true }
      )
        .exec()
        .then((fabric) => {
          // New name, hence, delete and regenerate.
          // DELETE
          lignator.remove(
            path.join(
              __dirname,
              "../../generated/" + olddata.title.split(" ").join("_")
            )
          );

          // Remove old previews
          lignator.remove(
            path.join(
              __dirname,
              "../../previews/" + olddata.title.split(" ").join("_")
            )
          );

          // Generate new previews
          const orderdingCutTypes = [
            "fat-16",
            "fat-12",
            "fat-9",
            "fat-8",
            "fat-quarter",
            "fat-half",
            "full-panel",
          ];

          const orderingSize = [56];
          const orderingFabricType = "14aida";

          console.log(fabric.masterfile);

          orderdingCutTypes.forEach((cutType) => {
            const subprocess = runScriptwithoutExlusiveSpecific(
              newdata.title,
              olddata.masterFile.split(".").slice(0, -1).join("."),
              fabric.masterFile.split(".")[2],
              fabric.item_code,
              newdata.seamless == true ? 1 : 0,
              newdata.inches,
              new_ratio_value,
              newdata.landscape == true ? 1 : 0,
              newdata.bgColor,
              path.join(__dirname, "../../processor/"),
              path.join(__dirname, "../../previews/"),
              path.join(__dirname, "../../"),
              orderingSize,
              cutType,
              orderingFabricType
            );

            subprocess.stdout.on("data", (data) => {
              console.log(`data:${data}`);
            });
            subprocess.stderr.on("data", (data) => {
              console.log(`error:${data}`);
            });
          });

          res.status(200).json({
            message: "Fabric data updated, generating new previews.",
          });
        });
    }
  }
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

function formatBytes(a, b = 2, k = 1024) {
  with (Math) {
    let d = floor(log(a) / log(k));
    return 0 == a
      ? "0 Bytes"
      : parseFloat((a / pow(k, d)).toFixed(max(0, b))) +
          " " +
          ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d];
  }
}

router.get("/getImages/:fabricTitle", (req, res, next) => {
  const cut_types = [
    "full-panel",
    "fat-half",
    "fat-quarter",
    "fat-8",
    "fat-9",
    "fat-12",
    "fat-16",
  ];

  const fabric_types = [
    "14-Aida",
    "16-Aida",
    "18-Aida",
    "28-Evenweave",
    "32-Evenweave",
    "36-Evenweave",
    "28-Linen",
    "32-Linen",
    "36-Linen",
    "40-Linen",
  ];

  const sizes = ["36x56", "36x42"];

  const fabricTitle = req.params.fabricTitle;
  const tempPaths = [];
  generatedCount = 0;

  cut_types.forEach((cut_type) => {
    fabric_types.forEach((fabric_type) => {
      sizes.forEach((size) => {
        tempPath = `${fabricTitle}-${cut_type}-${fabric_type}-${size}.jpg`;
        fileGenerated = false;
        try {
          if (
            fs.existsSync(
              path.resolve(
                __dirname,
                `../../generated/` + req.params.fabricTitle + "/" + tempPath
              )
            )
          ) {
            generatedCount += 1;
            fileGenerated = true;
          }
        } catch (error) {}
        tempPaths.push({
          path: path.resolve(
            __dirname,
            `../../generated/` + req.params.fabricTitle + "/" + tempPath
          ),
          filename: tempPath,
          img_link: `/generated/` + req.params.fabricTitle + "/" + tempPath,
          generated: fileGenerated,
          size: size == "36x56" ? 56 : 42,
          cut_type: cut_type,
          fabric_type: fabric_type.toLowerCase().split("-").join(""),
        });
      });
    });
  });

  require("du")(
    path
      .resolve(__dirname, "../../generated", req.params.fabricTitle)
      .toString(),
    (err, size) => {
      console.log(size);
      res.status(200).json({
        files: tempPaths,
        folderSize: size == undefined ? "0 kb" : formatBytes(size),
        totalGenerated: generatedCount,
      });
    }
  );
});

router.get("/download", (req, res) => {
  const file = path.resolve(
    __dirname,
    `../../generated/azdzad/azdzad-full-14-Aida-36x42.jpg`
  );
  //No need for special headers
  res.download(file);
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
    "Content-Disposition": `attachment; filename=${imageName.substring(
      0,
      imageName.indexOf(".")
    )}.jpg`,
  });

  fs.createReadStream(imagePath).pipe(res);
});

router.get("/downloadPreview/:data", (req, res) => {
  const data = JSON.parse(
    req.params.data.split("alahalahaalykabidi").join("/")
  );

  const imageName = data.imageName;
  const imagePath = path.resolve(__dirname, `../../previews/` + imageName);

  console.log(imageName);
  console.log(imagePath);

  var stat = fs.statSync(imagePath);

  res.writeHead(200, {
    "Content-Length": stat.size,
    "Content-Disposition": `attachment; filename=${imageName}`,
  });

  fs.createReadStream(imagePath).pipe(res);
});

router.get("/zipImages/:data", (req, res) => {
  const data = JSON.parse(
    req.params.data.split("alahalahaalykabidi").join("/")
  );

  let directoryName = data.directoryName;
  zl.archiveFolder(
    path.resolve(__dirname, "../../generated/" + directoryName),
    path.resolve(__dirname, "../../generated/" + directoryName + ".zip")
  ).then(
    function () {
      var zipPath = path.resolve(
        __dirname,
        "../../generated/" + directoryName + ".zip"
      );

      var stat = fs.statSync(zipPath);

      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Disposition": `attachment; filename=${directoryName}.zip`,
      });

      fs.createReadStream(zipPath).pipe(res);
    },
    function (err) {
      console.log(err);
      res.status(200).json({
        status: "fail",
      });
    }
  );
});

router.post("/zipImages", (req, res) => {
  var directoryName = req.body.directoryName;

  zl.archiveFolder(
    path.resolve(__dirname, "../../generated/" + directoryName),
    path.resolve(__dirname, "../../generated/" + directoryName + ".zip")
  ).then(
    function () {
      var zipPath = path.resolve(
        __dirname,
        "../../generated/" + directoryName + ".zip"
      );
      res.download(zipPath);
    },
    function (err) {
      console.log(err);
      res.status(200).json({
        status: "fail",
      });
    }
  );
});

router.post("/createFabricFlairProduct", (request, response) => {
  console.log("------------------");
  let fabric = request.body.fabric;

  console.log(request.body.fabric);

  var req = unirest(
    "POST",
    "https://api.bigcommerce.com/stores/hzc9x65who/v2/products"
  );
  req.headers({
    accept: "application/json",
    "content-type": "application/json",
    "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
    "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
  });
  req.type("json");

  console.log(fabric["title"]);
  console.log(JSON.parse(fabric["categories"]));

  let categoryIds = [];
  JSON.parse(fabric["categories"]).forEach((category) => {
    categoryIds.push(category["id"]);
  });

  req.send({
    name: fabric["title"],
    description: fabric["description"],
    type: "physical",
    weight: 4,
    categories: categoryIds,
    price: 10,
    availability: "available",
    option_set_id: "20",
    is_visible: true,
  });

  req.end(function (res) {
    console.log(res.body["name"]);
    console.log(fabric["title"]);

    if (res.body["name"] == fabric["title"]) {
      let prodId = res.body["id"];
      var req = unirest(
        "POST",
        "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/products/" +
          prodId +
          "/images"
      );
      req.headers({
        accept: "application/json",
        "content-type": "application/json",
        "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
        "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
      });

      req.type("json");
      req.send({
        is_thumbnail: true,
        sort_order: 1,
        description: "Top View",
        image_url:
          `/` +
          fabric.masterFile
            .replace("masterfiles/", "previews/")
            .split(":")
            .join("_"),
      });

      req.end(function (res) {
        console
          .log(`/` + fabric.masterFile.replace("masterfiles/", "previews/"))
          .split(":")
          .join("_");
        console.log(res.body);
        response.status(200).json({
          status: "success",
        });
      });
    } else {
      response.status(200).json({
        status: "failed",
      });
    }
  });
});

module.exports = router;
