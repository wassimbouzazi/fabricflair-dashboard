import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";

import { HttpClient } from "@angular/common/http";
import swal from "sweetalert2";

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

declare const $: any;

@Component({
  selector: "app-orders-cmp",
  templateUrl: "orders.component.html",
  styleUrls: ["./orders.component.css"],
})
export class OrdersComponent implements AfterViewInit, OnInit {
  public dataTable: DataTable;
  orders;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get("/orders/getOrders").subscribe(
      (result) => {
        this.dataTable = {
          headerRow: [
            "Status",
            "Date",
            "Number",
            "Customer",
            "Total",
            "Actions",
          ],
          footerRow: [
            "Status",
            "Date",
            "Number",
            "Customer",
            "Total",
            "Actions",
          ],
          dataRows: [],
        };

        console.log(this.dataTable.footerRow);

        this.orders = result["orders"];
        this.orders.forEach((order) => {
          this.dataTable.dataRows.push([
            order.status,
            new Date(order.order_date).toLocaleDateString(),
            order.invoice_number,
            order.customer,
            order.total.toString(),
            "btn-round",
            order._id,
          ]);
        });

        console.log(this.dataTable.dataRows);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ViewOrder(id) {
    this.router.navigate(["utilities/orders/view/" + id]);
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

  isFieldValid(exclusive: any) {
    return exclusive.length == 0;
  }

  displayFieldCss(exclusive: any) {
    return {
      "has-error": this.isFieldValid(exclusive),
      "has-feedback": this.isFieldValid(exclusive),
    };
  }

  changeStatus(orderId, status) {
    console.log(orderId);
    console.log(status);

    if (status == "Shipped") {
      swal({
        title: "Tracking number",
        html:
          '<div class="form-group">' +
          '<input id="input-field" type="number" class="form-control" />' +
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
              text: "Tracking number must not be empty, try again",
              type: "warning",
              confirmButtonClass: "btn btn-success",
              buttonsStyling: false,
            });
            return;
          }

          this.http
            .post("/orders/changeOrderStatus", {
              orderId: orderId,
              status: status,
              tracking_number: $("#input-field").val(),
            })
            .subscribe(
              (result) => {
                console.log(result);
                if (result["message"] == "success") {
                  this.showNotification(
                    "success",
                    "top",
                    "right",
                    "Updated order status successfully"
                  );
                  this.ngOnInit();
                }
              },
              (error) => {
                console.log(error);
              }
            );
        })
        .catch(swal.noop);
    } else {
      this.http
        .post("/orders/changeOrderStatus", {
          orderId: orderId,
          status: status,
          tracking_number: null,
        })
        .subscribe(
          (result) => {
            console.log(result);
            if (result["message"] == "success") {
              this.showNotification(
                "success",

                "top",
                "right",
                "Updated order status successfully"
              );
              this.ngOnInit();
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  downloadInvoice(orderId) {
    this.showNotification(
      "success",
      "top",
      "right",
      "Generating invoice, please wait"
    );

    this.http.post("/orders/generateInvoice", { orderId: orderId }).subscribe(
      (result) => {
        console.log(result);
        if (result["message"] == "success") {
          window.open(`invoices/${result["invoicePath"]}`, "_blank");
          //window.location.href = `invoices/${result["invoicePath"]}`;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  showNotification(type: any, from: any, align: any, message: any) {
    $.notify(
      {
        icon: "add_alert",
        message: message,
      },
      {
        type: type,
        timer: 1500,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  }
}
