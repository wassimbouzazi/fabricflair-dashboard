import { AfterViewInit, Component, OnInit } from "@angular/core";
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
import swal from "sweetalert2";

import * as jwt_decode from "jwt-decode";

declare const $: any;

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}
@Component({
  selector: "app-user-orders-cmp",
  templateUrl: "user-orders.component.html",
})
export class UserOrdersComponent implements AfterViewInit, OnInit {
  public dataTable: DataTable;
  prevorders;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.http
      .post("/orders/getUserPrevOrders", {
        user_email: jwt_decode(localStorage.getItem("access_token")).email,
      })
      .subscribe(
        (result) => {
          this.prevorders = result["prevorders"];

          this.dataTable = {
            headerRow: ["Date", "Number of Fabrics", "Total", "Actions"],
            footerRow: ["Date", "Number of Fabrics", "Total", "Actions"],
            dataRows: [],
          };

          this.prevorders.forEach((order) => {
            this.dataTable.dataRows.push([
              new Date(order.order_date).toLocaleDateString(),
              order.items.length,
              order.total,
              "btn-round",
              order._id,
              order.items,
            ]);
          });
        },
        (error) => {
          console.log(error);
        }
      );
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

  cleanup(message) {
    return message.replace(/\s/g, "");
  }
}
