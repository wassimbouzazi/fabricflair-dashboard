import { HttpClient } from "@angular/common/http";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { OrderDataService } from "app/services/order_data.service";
import * as jwt_decode from "jwt-decode";
declare var paypal;

declare const $: any;

@Component({
  selector: "app-stripe-payment",
  templateUrl: "./stripe-payment.component.html",
  styleUrls: ["./stripe-payment.component.css"],
})
export class StripePaymentComponent implements OnInit {
  @ViewChild("paypal") paypalElement: ElementRef;

  purchase_unit_items = [];

  orders = {
    headerRow: ["", "PRODUCT", "TYPE", "SIZE", "PRICE", "QTY", "AMOUNT"],
    dataRows: [],
  };

  amount = 0;
  reference = "";
  customerReference = "";
  otherPayment = false;
  serviceData;
  discount = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private orderService: OrderDataService
  ) {}

  ngOnInit() {
    this.orderService.currentData.subscribe((data) => {
      this.serviceData = data;
      if (data["cart"] == null) {
        this.router.navigateByUrl("/fabrics");
      }

      console.log(data);

      this.discount = data["discount"];

      for (let i = 0; i < data["cart"].length; i++) {
        const order = data["cart"][i];
        this.orders.dataRows.push([
          data["masterFiles"][i]["masterFile"],
          "",
          order.fabric_name,
          "By FabricFlair",
          order.type,
          "",
          data["prices"][i],
          order.quantity,
          order.quantity * data["prices"][i],
        ]);
        this.amount = this.amount + order.quantity * data["prices"][i];
        // Fill purcahse units array;
        this.purchase_unit_items.push({
          name: order.fabric_name,
          quantity: order.quantity,
          category: "PHYSICAL_GOODS",
          unit_amount: {
            currency_code: "USD",
            value: data["prices"][i],
          },
        });
      }

      this.amount = this.amount - this.discount;

      paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: (Math.round(this.amount * 100) / 100).toFixed(2),
                    breakdown: {
                      item_total: {
                        currency_code: "USD",
                        value: (Math.round(this.amount * 100) / 100).toFixed(2),
                      },
                    },
                  },
                  items: this.purchase_unit_items,
                },
              ],
            });
          },
          onApprove: async (d, actions) => {
            const order = await actions.order.capture();

            let items = [];
            for (let i = 0; i < data["cart"].length; i++) {
              let item = data["cart"][i];
              item.price = data["prices"][i];
              items.push(item);
            }

            let info = {
              payment_method: "Paypal",
              user_id: jwt_decode(localStorage.getItem("access_token")).id,
              total: this.amount,
              payee_email: order.payer.email_address,
              items: items,
              shipping: order.purchase_units[0].shipping,
            };

            this.http.post("/orders/createOrder", { data: info }).subscribe(
              (result) => {
                if (result["message"] === "success") {
                  this.showNotification(
                    "top",
                    "right",
                    "Transaction is successfully proceeded."
                  );
                  this.router.navigate(["/fabrics"]);
                }
              },
              (error) => {
                console.log(error);
              }
            );
          },
          onError: (err) => {
            console.log(err);
          },
        })
        .render(this.paypalElement.nativeElement);
    });
  }

  fileName(fullname) {
    return fullname.replace("masterfiles/", "").split(":").join("_");
  }

  showNotification(from: any, align: any, message: any) {
    const type = [
      "",
      "info",
      "success",
      "warning",
      "danger",
      "rose",
      "primary",
    ];

    const color = "success";

    $.notify(
      {
        icon: "notifications",
        message: message,
      },
      {
        type: type[color],
        timer: 1500,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  }

  isFieldValid(field: string) {
    return this.reference.length == 0;
  }

  otherPaymentCheckout() {
    if (this.reference.length == 0) {
      this.showNotification("top", "right", "Reference is required.");
    } else {
      let items = [];
      for (let i = 0; i < this.serviceData["cart"].length; i++) {
        let item = this.serviceData["cart"][i];
        item.price = this.serviceData["prices"][i];
        items.push(item);
      }

      let info = {
        reference: this.reference,
        customerReference: this.customerReference,
        payment_method: "Check",
        user_id: jwt_decode(localStorage.getItem("access_token")).id,
        total: this.amount,
        discount: this.discount,
        payee_email: jwt_decode(localStorage.getItem("access_token")).email,
        items: items,
      };

      this.http.post("/orders/createOrder", { data: info }).subscribe(
        (result) => {
          if (result["message"] === "success") {
            this.showNotification(
              "top",
              "right",
              "Transaction is successfully proceeded."
            );
            this.router.navigate(["/fabrics"]);
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }
}
