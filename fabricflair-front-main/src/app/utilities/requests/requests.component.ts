import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-buttons",
  templateUrl: "./requests.component.html",
  styleUrls: ["./requests.component.css"],
})
export class RequestsComponent implements OnInit {
  requests;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get("/user/requests").subscribe((result) => {
      this.requests = result["result"];
    });
  }

  getStatusColor(status) {
    if (status == "Pending") return "orange";
    if (status == "Approved") return "green";
    return "red";
  }

  ApproveRequest(request) {
    swal({
      title: "Store name",
      html:
        '<div class="form-group">' +
        '<input id="input-field" type="text" class="form-control" />' +
        "</div>",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      confirmButtonText: "Add",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false,
    })
      .then(() => {
        console.log($("#input-field").val());
        if ($("#input-field").val() == "") {
          swal({
            title: "Error",
            text: "Store name must not be empty, try again",
            type: "warning",
            confirmButtonClass: "btn btn-success",
            buttonsStyling: false,
          });
          return;
        }
        this.http
          .post("/user/approveRequest", {
            storeName: $("#input-field").val(),
            request: request,
          })
          .subscribe(
            (result) => {
              console.log(result);
              swal({
                title: "User added",
                text: "User account successfully created",
                type: "warning",
                confirmButtonClass: "btn btn-success",
                buttonsStyling: false,
              });
              this.ngOnInit();
              console.log("Refreshed");
            },
            (error) => {
              console.log(error);

              swal({
                title: "Error",
                text: "Couldn't add store name to user, try with another store name",
                type: "warning",
                confirmButtonClass: "btn btn-danger",
                buttonsStyling: false,
              });
            }
          );
      })
      .catch(swal.noop);
  }

  RejectRequest(request) {
    swal({
      title: "Are you sure?",
      text: "You will not be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: "Yes, reject it!",
      buttonsStyling: false,
    })
      .then(() => {
        this.http.post("/user/rejectRequest", request).subscribe((result) => {
          console.log(result);

          swal({
            title: "Rejected!",
            text: "Account request has been rejected successfully",
            type: "success",
            confirmButtonClass: "btn btn-success",
            buttonsStyling: false,
          });
          this.ngOnInit();
          console.log("Refreshed");
        });
      })
      .catch(swal.noop);
  }
}
