import { Component, OnInit } from "@angular/core";

import swal from "sweetalert2";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { SearchService } from "app/services/SearchService.service";

declare const $: any;

@Component({
  selector: "app-designs",
  templateUrl: "./designs.component.html",
  styleUrls: ["./designs.component.css"],
})
export class DesignsComponent implements OnInit {
  designs;
  filterargs;

  constructor(
    private http: HttpClient,
    private router: Router,
    private search: SearchService
  ) {}

  ngOnInit() {
    this.search.currentMessage.subscribe((message) => {
      console.log(message);
      this.filterargs = { pattern_name: message };
    });

    this.filterargs = null;

    this.initializeDesigns();
  }

  initializeDesigns() {
    this.http.get("/designs/getDesigns").subscribe((result) => {
      this.designs = result["designs"];
      console.log(this.designs);
    });
  }

  deleteDesign(designId: string, filePath: string) {
    this.showDeletionAlert(designId, filePath);
    console.log(designId);
  }

  showDeletionAlert(designId, designFile) {
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
        console.log(designFile);
        this.http.delete("/designs/" + designId).subscribe((result) => {
          this.http
            .patch("/designs/deleteFile", { filePath: designFile })
            .subscribe((result) => {
              swal({
                title: "Deleted!",
                text: "Your design data has been deleted.",
                type: "success",
                confirmButtonClass: "btn btn-success",
                buttonsStyling: false,
              });
              this.initializeDesigns();
            });
        });
      })
      .catch(swal.noop);
  }
}
