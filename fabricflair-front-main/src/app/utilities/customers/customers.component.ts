import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormGroup } from "@angular/forms";

import swal from "sweetalert2";

@Component({
  selector: "app-customers-cmp",
  templateUrl: "customers.component.html",
})
export class CustomersComponent implements OnInit {
  customers;
  exclusives = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get("/customers/getCustomers").subscribe(
      (result) => {
        this.customers = result["customers"];
        this.customers.forEach((customer) => {
          this.exclusives.push(customer.exclusive);
        });
        console.log(this.customers);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  updateCustomers() {
    let hasError = false;
    for (let i = 0; i < this.customers.length; i++) {
      const customer = this.customers[i];
      if (customer.exclusive.length == 0) {
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      console.log(this.customers);

      this.http
        .post("/customers/updateCustomers", { customers: this.customers })
        .subscribe((result) => {
          console.log(result);
          if ((result["message"] = "success")) {
            swal({
              title: "Updated!",
              text: "Customers data have been updated",
              type: "success",
              confirmButtonClass: "btn btn-success",
              buttonsStyling: false,
            });
          }
        });
    }
  }

  isFieldValid(exclusive: any) {
    return exclusive.length == 0;
  }

  displayFieldCss(exclusive: any) {
    return {
      "has-error": this.isFieldValid(exclusive),
      "has-feedback": this.isFieldValid(exclusive),
    };
  }
}
