import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { SearchService } from "app/services/SearchService.service";

declare const $: any;

@Component({
  selector: "app-view-on-fabric-cmp",
  templateUrl: "view-on-fabric.component.html",
  styleUrls: ["./view-on-fabric.component.css"],
})
export class ViewOnFabricDesign implements OnInit {
  fabrics = [];
  design;
  designId;
  designHeight;
  designWidth;

  exclusive_customers = ["All", "General Release"];
  exclusive = new FormControl();
  filterargs;
  searchValue = "";

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private search: SearchService
  ) {}

  onExclusiveChange() {
    this.filterargs = {
      title: this.searchValue,
      exclusive: this.exclusive.value,
    };
  }

  ngOnInit() {
    this.exclusive.setValue("All");

    this.search.currentMessage.subscribe((message) => {
      this.searchValue = message;

      this.filterargs = {
        title: this.searchValue,
        exclusive: this.exclusive.value,
      };
    });

    this.activatedRoute.paramMap.subscribe((x) => {
      this.designId = x.get("designId");

      this.http.get("/designs/getdata/" + this.designId).subscribe((result) => {
        this.design = result["design"][0];

        this.designHeight =
          (this.design.stitchcount_height / this.design.default_count) * 15;
        this.designWidth =
          (this.design.stitchount_width / this.design.default_count) * 15;
      });
    });

    this.initializeFabrics();
  }

  initializeFabrics() {
    this.http.get("/fabrics/getFabrics").subscribe((result) => {
      this.fabrics = result["fabrics"];
      this.exclusive_customers = this.exclusive_customers.concat(
        result["exclusives"].map((exclusive) => exclusive.exclusive)
      );
    });
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

  fileName(fullname) {
    return fullname.replace("masterfiles/", "").split(":").join("_");
  }

  downloadSelected(fabric) {
    const fabricImg = fabric.masterFile.replace("masterfiles/", "");
    const designImg = this.design.design_masterfile.replace(
      "design_masterfiles/",
      ""
    );
    const height = Math.trunc(this.designHeight);
    const width = Math.trunc(this.designWidth);
    const overlayedName = this.overlayedName(
      fabric.title,
      this.design.pattern_name
    );

    const data = {
      fabricImg: fabricImg,
      designImg: designImg,
      height: height,
      width: width,
      overlayedName: overlayedName,
    };

    console.log(data);

    window.location.href =
      "designs/downloadOverlayed/" +
      JSON.stringify(data).split("/").join("alahalahaalykabidi");

    //  this.http.get('/designs/downloadOverlayed/'+fabricImg+'/'+designImg+'/'+height+'/'+width+'/'+overlayedName).subscribe(result => {
    //     console.log(result);
    //   })
  }

  overlayedName(fabricName, designName) {
    return fabricName + "-On-" + designName;
  }
}
