import { Component, OnInit, AfterViewInit } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { saveAs } from "file-saver";

declare const $: any;

@Component({
  selector: "app-fabrics",
  templateUrl: "./viewimages.component.html",
  styleUrls: ["./viewimages.component.css"],
})
export class ViewimagesComponent implements OnInit {
  title;
  paths;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe((x) => {
      this.title = x.get("fabricTitle").replace(/ /g, "_");
      console.log(this.title);
    });
  }

  ngOnInit() {
    this.http
      .post("/fabrics/getFabricImagesPaths", { fabricName: this.title })
      .subscribe(
        (result) => {
          this.paths = result["files"];
          console.log(this.paths);
        },
        (error) => {
          this.paths = null;
        }
      );
  }

  zipAndDownload(fabricName) {
    console.log(fabricName);
    this.showNotification(
      "top",
      "right",
      "info",
      "Generating zip file to download, please wait"
    );

    this.http
      .post(
        "/fabrics/zipImages",
        { directoryName: fabricName },
        { responseType: "blob" }
      ) //set response Type properly (it is not part of headers)
      .toPromise()
      .then((blob) => {
        saveAs(blob, fabricName + ".zip");
        this.showNotification("top", "right", "success", "Downloading...");
      })
      .catch((err) => console.error("download error = ", err));
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
}
