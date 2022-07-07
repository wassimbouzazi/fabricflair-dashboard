const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Design = require("../models/design");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
var mime = require("mime");
const { spawn } = require("child_process");

function runScriptOverlay(fabricImg, designImg, height, width, overlayName) {
  return spawn("python3", [
    "-u",
    path.join(__dirname, "../../overlay_generator/overlay.py"),
    fabricImg,
    designImg,
    height,
    width,
    overlayName,
  ]);
}

router.get("/downloadOverlayed/:data", (req, res) => {
  const data = JSON.parse(
    req.params.data.split("alahalahaalykabidi").join("/")
  );

  const fabricImg =
    path.join(__dirname, "../../previews/") +
    data.fabricImg.split(":").join("_");
  const designImg =
    path.join(__dirname, "../../design_masterfiles/") + data.designImg;
  const height = data.height;
  const width = data.width;
  const overlayName = data.overlayedName;

  console.log(`Height: ${height}, Width: ${width}`);

  const subprocess = runScriptOverlay(
    fabricImg,
    designImg,
    width * 9,
    height * 9,
    path.join(__dirname, "../../overlays/") + overlayName + ".jpg"
  );

  subprocess.stdout.on("data", (data) => {
    if (data) {
      const file =
        path.join(__dirname, "../../overlays/") + overlayName + ".jpg";
      var stat = fs.statSync(file);

      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Disposition": `attachment; filename=${overlayName}.jpg`,
      });

      fs.createReadStream(file).pipe(res);
    }
  });

  subprocess.stderr.on("data", (data) => {
    console.log(`${data}`);
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./design_masterfiles/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname.split(" ").join("_"));
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

// Post design data
router.post(
  "/postDesign",
  upload.single("design_masterfile"),
  (req, res, next) => {
    const design = new Design({
      _id: new mongoose.Types.ObjectId(),
      pattern_name: req.body.pattern_name,
      description: req.body.description,
      design_masterfile: req.file.path,
      additionDate: new Date(),
      stitchount_width: req.body.stitchount_width,
      stitchcount_height: req.body.stitchcount_height,
      designer_name: req.body.designer_name,
      default_count: req.body.default_count,
    });

    design
      .save()
      .then((result) => {
        res.status(200).json({
          message: "success",
          designData: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
);

router.get("/getdata/:designId", (req, res, next) => {
  const designId = req.params.designId;
  Design.find({ _id: designId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "success",
        design: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/getDesigns", (req, res, next) => {
  Design.find()
    .exec()
    .then((docs) => {
      res.status(200).json({
        message: "Getting all items",
        designs: docs,
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
router.delete("/:designId", (req, res, next) => {
  const designId = req.params.designId;
  Design.remove({ _id: designId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Successfully deleted the design",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/deleteFile", (req, res, next) => {
  const filePath = req.body.filePath;

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

module.exports = router;
