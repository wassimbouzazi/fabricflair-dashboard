const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Medley = require("../models/medley");
const Fabric = require("../models/fabric");
const { spawn } = require("child_process");
const path = require("path");
const { title } = require("process");
const fs = require("fs");

router.delete("/:medleyId", (req, res, next) => {
  const medleyId = req.params.medleyId;
  Medley.remove({ _id: medleyId })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Successfully deleted the medley",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

function runMedleyScript(
  path1,
  path2,
  path3,
  path4,
  inches,
  shrink_options,
  folder_path
) {
  return spawn("python3", [
    "-u",
    path.join(__dirname, "../../medley_generator/medley.py"),
    path1,
    path2,
    path3,
    path4,
    inches,
    shrink_options,
    folder_path,
  ]);
}

router.get("/getMedleys", (req, res) => {
  Medley.find()
    .exec()
    .then((result) => {
      res.status(200).json({
        medleys: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/createMedley", (req, res) => {
  console.log(req.body);

  const medley = new Medley({
    _id: new mongoose.Types.ObjectId(),
    fabrics: req.body.fabrics,
    inches: req.body.inches,
    option: req.body.option,
    date: new Date(),
    title: req.body.title,
    shrink: req.body.shrink,
  });

  medley
    .save()
    .then(async (result) => {
      console.log(result);

      fabrics = await Fabric.find().where("_id").in(req.body.fabrics).exec();
      console.log(fabrics);
      console.log("initial ids");
      console.log(req.body.fabrics);
      console.log("fabrics taken from db");

      fabrics.forEach((fabric) => {
        console.log(fabric.masterFile + "  " + fabric._id);
      });

      // Sort fabrics based on frontend rearranging
      sortedFabrics = [];
      for (let index = 0; index < req.body.fabrics.length; index++) {
        const id = req.body.fabrics[index];
        sortedFabrics.push(fabrics.find((x) => x.id === id));
      }

      fabrics = sortedFabrics;

      // Get all required data to create a fabric

      let medley_fabric_categories = [];
      let medley_fabric_hashtags = [];
      let medley_fabric_titles = [];
      fabrics.forEach((fabric) => {
        medley_fabric_categories = medley_fabric_categories.concat(
          JSON.parse(fabric.categories)
        );
        medley_fabric_hashtags = medley_fabric_hashtags.concat(
          JSON.parse(fabric.hashtags)
        );
        medley_fabric_titles.push(fabric.title);
      });

      // Change Key name to work with Medleys Widget
      medley_fabric_categories = medley_fabric_categories.map(
        ({ id, name }) => ({ id: id, itemName: name })
      );

      let medley_data = {
        titles: medley_fabric_titles,
        hashtags: [...new Set(medley_fabric_hashtags)],
        categories: [
          ...new Map(
            medley_fabric_categories.map((item) => [item["id"], item])
          ).values(),
        ],
        title: req.body.title,
        imagePath:
          "/medleys/" +
          req.body.title.split(" ").join("_") +
          "/originals/" +
          req.body.title.split(" ").join("_") +
          "_27x36.jpg",
      };
      console.log(medley_data);
      // END

      if (fabrics.length == 2) {
        const subprocess = runMedleyScript(
          path.join(__dirname, "../../") +
            fabrics[0].masterFile.split(":").join("_"),
          path.join(__dirname, "../../") +
            fabrics[1].masterFile.split(":").join("_"),
          null,
          null,
          req.body.inches,
          req.body.shrink_options,
          req.body.title.split(" ").join("_")
        );
        console.log("Generating Medley (OPTION 2)");

        subprocess.stdout.on("data", (data) => {
          console.log(`data:${data}`);
          res.status(200).json({
            medley_data: medley_data,
            message: "Successfully created the medley",
          });
        });

        subprocess.stderr.on("data", (data) => {
          console.log(`error:${data}`);
        });
      }

      if (fabrics.length == 4) {
        const subprocess = runMedleyScript(
          path.join(__dirname, "../../") +
            fabrics[0].masterFile.split(":").join("_"),
          path.join(__dirname, "../../") +
            fabrics[1].masterFile.split(":").join("_"),
          path.join(__dirname, "../../") +
            fabrics[2].masterFile.split(":").join("_"),
          path.join(__dirname, "../../") +
            fabrics[3].masterFile.split(":").join("_"),
          req.body.inches,
          req.body.shrink_options,
          req.body.title.split(" ").join("_")
        );
        console.log("Generating Medley (OPTION 2)");

        subprocess.stdout.on("data", (data) => {
          console.log(`data:${data}`);
          res.status(200).json({
            medley_data: medley_data,
            message: "Successfully created the medley",
          });
        });
        subprocess.stderr.on("data", (data) => {
          console.log(`error:${data}`);
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

router.get("/downloadImage/:data", (req, res) => {
  const data = JSON.parse(
    req.params.data.split("alahalahaalykabidi").join("/")
  );
  console.log(data);

  const imageType = data.imageType;
  const title = data.title.split(" ").join("_");

  let imagePath =
    path.join(__dirname, "../../medleys/") +
    title +
    "/originals/" +
    title +
    imageType +
    ".jpg";
  console.log(imagePath);

  const imageName = data.title + data.imageType;

  var stat = fs.statSync(imagePath);

  res.writeHead(200, {
    "Content-Length": stat.size,
    "Content-Disposition": `attachment; filename=${imageName}.jpg`,
  });

  fs.createReadStream(imagePath).pipe(res);
});

module.exports = router;
