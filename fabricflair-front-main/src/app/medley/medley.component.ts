import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import * as jwt_decode from "jwt-decode";

import { SearchService } from "app/services/SearchService.service";
declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}
import swal from "sweetalert2";

declare const $: any;

@Component({
  selector: "app-medley",
  templateUrl: "./medley.component.html",
  styleUrls: ["./medley.component.css"],
})
export class MedleyComponent implements AfterViewInit, OnInit {
  public dataTable: DataTable;
  public account_type;
  medleys;

  constructor(
    private http: HttpClient,
    private router: Router,
    private search: SearchService
  ) {}

  ngOnInit() {
    this.account_type = jwt_decode(localStorage.getItem("access_token")).type;
    console.log(this.account_type);

    this.http.get("/medley/getMedleys").subscribe((result) => {
      this.medleys = result["medleys"];
      this.dataTable = {
        headerRow: ["Preview", "Title", "Productions Files", "Actions"],
        footerRow: ["Preview", "Title", "Productions Files", "Actions"],
        dataRows: [],
      };

      this.medleys.forEach((medley) => {
        this.dataTable.dataRows.push([medley.title, medley._id]);
      });
    });
  }

  deleteMedley(medleyId) {
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
        this.http.delete("/medley/" + medleyId).subscribe((result) => {
          swal({
            title: "Deleted!",
            text: "Your medley design data has been deleted.",
            type: "success",
            confirmButtonClass: "btn btn-success",
            buttonsStyling: false,
          });
          this.ngOnInit();
        });
      })
      .catch(swal.noop);
  }

  fileName(fullname) {
    if (fullname != null) return fullname.split(" ").join("_");
  }

  cleanup(message) {
    return message.replace(/\s/g, "");
  }

  downloadImage(imageType, title) {
    console.log(imageType);
    console.log(title.split(" ").join("_"));

    let data = { imageType: imageType, title: title };
    window.location.href =
      "medley/downloadImage/" +
      JSON.stringify(data).split("/").join("alahalahaalykabidi");

    /* 
        let data = {imagePath: imagePath, imageName: imageName}
        window.location.href = "fabrics/downloadImage/"+JSON.stringify(data).split('/').join('alahalahaalykabidi')     
 */
  }

  ngAfterViewInit() {
    console.log("after view init");

    $("#datatables").DataTable({
      pagingType: "full_numbers",
      lengthMenu: [
        [10, 25, 50, -1],
        [10, 25, 50, "All"],
      ],
      responsive: true,
      language: {
        search: "_INPUT_",
        searchPlaceholder: "Search records",
      },
    });

    const table = $("#datatables").DataTable();

    // Edit record
    /*   table.on("click", ".edit", function () {
      const $tr = $(this).closest("tr");

      const data = table.row($tr).data();
      console.log(data[1].match(">(.*)</p>")[1]);
      this.router.navigate(['/order/view/'+data[1].match(">(.*)</p>")[1]]);

    }); */

    // Delete a record
    table.on("click", ".remove", function (e: any) {
      const $tr = $(this).closest("tr");
      table.row($tr).remove().draw();
      e.preventDefault();
    });

    // Like record
    table.on("click", ".like", function () {
      alert("You clicked on Like button");
    });
  }
}
