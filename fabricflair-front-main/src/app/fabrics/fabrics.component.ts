import { Component, OnInit } from "@angular/core";

import swal from "sweetalert2";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import * as jwt_decode from "jwt-decode";
import { SearchService } from "app/services/SearchService.service";
import { FormControl } from "@angular/forms";

declare const $: any;

@Component({
  selector: "app-fabrics",
  templateUrl: "./fabrics.component.html",
  styleUrls: ["./fabrics.component.css"],
})
export class FabricsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private search: SearchService
  ) {}

  fabrics;
  exclusive_customers = ["All", "General Release"];
  exclusive = new FormControl();

  user_fabrics;
  account_type;
  fabric_owner;
  message;
  filterargs;
  root_p: number = 1;
  all_p: number = 1;
  general_p: number = 1;
  exclusive_p: number = 1;
  searchValue = "";
  categories;
  loaded = false;

  ngOnInit() {
    this.search.currentMessage.subscribe((message) => {
      this.searchValue = message;
      console.log("1:");

      this.filterargs = {
        title: this.searchValue,
        exclusive: this.exclusive.value,
      };
      console.log(this.filterargs);

      this.root_p = 1;
    });

    this.filterargs = null;

    this.account_type = jwt_decode(localStorage.getItem("access_token")).type;
    this.fabric_owner = jwt_decode(localStorage.getItem("access_token")).email;

    this.initializeFabrics();
    this.initializeUserFabrics();
  }

  getCategories() {
    this.http.get("/categories/getCategories").subscribe((result) => {
      this.categories = result["data"];
      console.log(this.categories);
    });
  }

  onExclusiveChange() {
    console.log("2:");

    this.filterargs = {
      title: this.searchValue,
      exclusive: this.exclusive.value,
    };
    console.log(this.filterargs);

    this.root_p = 1;
  }

  deleteFabric(fabricId: string, filePath: string, fabricName: string) {
    this.showAler(fabricId, filePath, fabricName.split(" ").join("_"));
    console.log(fabricId);
  }

  initializeFabrics() {
    this.exclusive.setValue("All");

    this.http.get("/fabrics/getFabrics").subscribe((result) => {
      this.fabrics = result["fabrics"];
      this.exclusive_customers = this.exclusive_customers.concat(
        result["exclusives"].map((exclusive) => exclusive.exclusive)
      );
      this.loaded = true;

      console.log(this.fabrics);
    });
  }

  initializeUserFabrics() {
    this.http
      .post("/fabrics/getAllFabrics/", {
        userId: jwt_decode(localStorage.getItem("access_token")).id,
      })
      .subscribe((result) => {
        this.user_fabrics = result["data"];
        this.loaded = true;

        console.log(this.user_fabrics);
      });
  }

  showAler(fabridId, fabricFile, folderName) {
    swal({
      title: "Are you sure?",
      text: "You will not be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: "Yes, delete it!",
      buttonsStyling: false,
    })
      .then(() => {
        console.log(fabricFile);
        this.http.delete("/fabrics/" + fabridId).subscribe((result) => {
          swal({
            title: "Deleted!",
            text: "Your fabric design data has been deleted.",
            type: "success",
            confirmButtonClass: "btn btn-success",
            buttonsStyling: false,
          });
          this.initializeFabrics();
        });
      })
      .catch(swal.noop);
  }

  gotoEdit(fabricId) {
    this.router.navigate(["/fabrics/editfabric/" + fabricId]);
  }

  postToBigCommerce(fabric) {
    swal({
      title: "Are you sure you want to post this product to FabricFlair?",
      text: "You will not be able to delete the product unless you have access to BigCommerce FabricFlair",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: "Post",
      buttonsStyling: false,
    })
      .then(() => {
        this.http
          .post("/fabrics/createFabricFlairProduct", { fabric: fabric })
          .subscribe((result) => {
            if (result["status"] == "success") {
              swal({
                title: "Added!",
                text: "Your fabric is now live on FabricFlair.com",
                type: "success",
                confirmButtonClass: "btn btn-success",
                buttonsStyling: false,
              });
            }
          });
      })
      .catch(swal.noop);
  }

  fileName(fullname) {
    return fullname.replace("masterfiles/", "").split(":").join("_");
  }

  downloadPreview(fabric_masterfile) {
    console.log("Double Clicked");

    let data = { imageName: this.fileName(fabric_masterfile) };
    window.location.href =
      "fabrics/downloadPreview/" +
      JSON.stringify(data).split("/").join("alahalahaalykabidi");
  }
}
