import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { saveAs } from "file-saver";

declare const $: any;

@Component({
  selector: "app-viewfabric-cmp",
  templateUrl: "viewfabric.component.html",
})
export class ViewFabricComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  fabric;
  hashtags = [];
  id;
  imagePaths = null;
  generatedCount = 0;
  folderSize;
  cut_types = [
    "full-panel",
    "fat-half",
    "fat-quarter",
    "fat-8",
    "fat-9",
    "fat-12",
    "fat-16",
  ];
  generated = [];

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((x) => {
      this.id = x.get("fabricId");

      // GET FABRIC DATA
      this.http.get("/fabrics/" + this.id).subscribe((result) => {
        this.fabric = result["fabric"][0];
        this.hashtags = JSON.parse(this.fabric.hashtags[0]);
        console.log(this.fabric.hashtags[0]);

        // CHECK GENERATED IMAGES AND SHOW EM IF EXISTANT

        this.http
          .get("/fabrics/getImages/" + this.fabric.title.split(" ").join("_"))
          .subscribe((result) => {
            if (result["error"]) {
              console.log("errrr");
            } else {
              this.generatedCount = result["totalGenerated"];
              this.folderSize = result["folderSize"];
              this.imagePaths = result["files"];
              console.log(`count: ${this.generatedCount}`);

              for (let i = 0; i < this.cut_types.length; i++) {
                const cut_type = this.cut_types[i];
                this.generated.push({
                  type: cut_type,
                  imgs_56: [],
                  imgs_42: [],
                });
                for (let j = 0; j < this.imagePaths.length; j++) {
                  const img = this.imagePaths[j];
                  img["generating"] = false;
                  if (
                    img.filename.includes(cut_type) &&
                    img.filename.includes("36x56")
                  ) {
                    this.generated[i].imgs_56.push(img);
                  } else if (
                    img.filename.includes(cut_type) &&
                    img.filename.includes("36x42")
                  ) {
                    this.generated[i].imgs_42.push(img);
                  }
                }
              }
            }
          });
      });
    });
    console.log(this.generated);
  }

  downloadImage(imagePath, imageName) {
    let data = { imagePath: imagePath, imageName: imageName };
    window.location.href =
      "fabrics/downloadImage/" +
      JSON.stringify(data).split("/").join("alahalahaalykabidi");
  }

  zipAndDownload(fabricName) {
    if (this.generatedCount == 0) {
      this.showNotification(
        "top",
        "right",
        "danger",
        "You haven't generated any variation, please generate first"
      );
    } else {
      this.showNotification(
        "top",
        "right",
        "info",
        "Generating zip file to download, please wait"
      );

      const data = { directoryName: fabricName.split(" ").join("_") };
      window.location.href =
        "fabrics/zipImages/" +
        JSON.stringify(data).split("/").join("alahalahaalykabidi");
    }
  }

  isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
      navigator.platform.toUpperCase().indexOf("IPAD") >= 0
    ) {
      bool = true;
    }
    return bool;
  }

  showNotification(from: any, align: any, color: string, message: string) {
    const type = [
      "",
      "info",
      "success",
      "warning",
      "danger",
      "rose",
      "primary",
    ];

    $.notify(
      {
        icon: "notifications",
        message: message,
      },
      {
        type: color,
        timer: 1500,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  }

  cleanup(message) {
    return message.replace(/\s/g, "");
  }

  generateFabrics() {
    this.http
      .post("/fabrics/generateFabricsV2", { fabricId: this.id })
      .subscribe(
        (result) => {
          if (result["message"] === "success") {
            this.showNotification(
              "top",
              "right",
              "info",
              "Generation started successfully"
            );
            this.router.navigate(["/fabrics"]);
          }
        },
        (error) => {
          console.log(error);
          this.showNotification(
            "top",
            "right",
            "danger",
            "Error in generating, try again later"
          );
        }
      );
  }

  generateSpecificFabric(groupIndex, imageIndex, image) {
    let size = image.size;
    let cut_type = image.cut_type;
    let fabric_type = image.fabric_type;

    this.showNotification(
      "top",
      "right",
      "info",
      "Generation started, don't navigate for auto download."
    );
    if (size == 42) {
      this.generated[groupIndex].imgs_42[imageIndex].generating = true;
    } else {
      this.generated[groupIndex].imgs_56[imageIndex].generating = true;
    }
    this.http
      .post("/fabrics/generateSpecific", {
        fabricId: this.id,
        size: size,
        cut_type: cut_type,
        fabric_type: fabric_type,
      })
      .subscribe(
        (result) => {
          if (result["message"] === "success") {
            this.showNotification(
              "top",
              "right",
              "success",
              "Generation finished successfully"
            );
            if (size == 42) {
              this.generated[groupIndex].imgs_42[imageIndex].generated = true;
              this.generated[groupIndex].imgs_42[imageIndex].generating = false;
            } else {
              this.generated[groupIndex].imgs_56[imageIndex].generated = true;
              this.generated[groupIndex].imgs_56[imageIndex].generating = true;
            }
            this.downloadImage(image.path, image.filename);
            this.generatedCount++;

            //this.router.navigate(["/fabrics"]);
          }
        },
        (error) => {
          console.log(error);
          this.showNotification(
            "top",
            "right",
            "danger",
            "Error in generating, please try again later"
          );
        }
      );
  }

  deleteGeneratedFiles() {
    this.http
      .delete("/fabrics/deleteGenerated/" + this.id)
      .subscribe((result) => {
        if (result) {
          this.showNotification(
            "top",
            "right",
            "success",
            "All generated files deleted!"
          );
          this.generated = [];
          this.generatedCount = 0;
          this.folderSize = "0 Kb";
        }
      });
  }
}
