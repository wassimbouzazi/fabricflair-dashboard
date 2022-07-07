import { Component, OnInit, AfterViewInit } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import * as jwt_decode from "jwt-decode";
import { OrderDataService } from "app/services/order_data.service";

declare const $: any;

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"],
})
export class CartComponent implements OnInit {
  cart;

  ordersizes = [];
  orderprices = [];
  deletedFabrics = [];
  deletedCart = [];
  masterFiles;
  total = 0;
  discount = 0;
  discountPercentage = 0;
  loaded = false;

  prices = {
    "euro/aida/nos": 37,
    "euro/aida/s": 43,
    "euro/evenweave/nos": 60.75,
    "euro/evenweave/s": 66.75,
    "euro/linen/nos": 55,
    "euro/linen/s": 61,
    "us/aida/nos": 49.95,
    "us/aida/s": 56.95,
    "us/evenweave/nos": 45,
    "us/evenweave/s": 52,
    "us/linen/nos": 74.25,
    "us/linen/s": 81.25,
    "bagged/aida/nos/fat-quarter": 14.99,
    "bagged/aida/nos/regular-cut": 12.25,
    "bagged/aida/s/fat-quarter": 17.99,
    "bagged/aida/s/regular-cut": 15.25,
    "bagged/evenweave/nos/fat-quarter": 17.99,
    "bagged/evenweave/nos/regular-cut": 14.25,
    "bagged/evenweave/s/fat-quarter": 20.99,
    "bagged/evenweave/s/regular-cut": 17.25,
    "bagged/linen/nos/fat-quarter": 19.99,
    "bagged/linen/nos/regular-cut": 16.75,
    "bagged/linen/s/fat-quarter": 22.99,
    "bagged/linen/s/regular-cut": 19.75,
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private orderService: OrderDataService
  ) {}

  calculatePrice(i) {
    let order = this.cart[i];

    let type;
    switch (true) {
      case order.type.includes("aida"):
        type = "aida";
        break;
      case order.type.includes("evenweave"):
        type = "evenweave";
        break;
      case order.type.includes("linen"):
        type = "linen";
        break;

      default:
        break;
    }

    let key = order.product + "/" + type + "/";
    if (order.hasSilver) {
      key = key + "s";
    } else {
      key = key + "nos";
    }

    if (order.product == "bagged") {
      key = key + "/" + order.option;
    }

    return this.prices[key];
  }

  ngOnInit() {
    this.http
      .post("/fabrics/getCart", {
        user_id: jwt_decode(localStorage.getItem("access_token")).id,
      })
      .subscribe(
        (result) => {
          console.log(result);

          this.loaded = true;
          this.cart = result["orders"]["cart"];
          this.masterFiles = result["masterFiles"];
          this.deletedFabrics = result["deletedFabrics"];
          this.ordersizes = [];
          this.orderprices = [];
          this.total = 0;
          this.discountPercentage = result["discount"];

          let filteredCart = [];
          this.cart.forEach((element) => {
            if (!this.deletedFabrics.includes(element.fabric_id)) {
              filteredCart.push(element);
            } else {
              this.deletedCart.push(element);
            }
          });

          this.cart = [...filteredCart];

          // Sizes
          this.cart.forEach((order) => {
            this.ordersizes.push(order.product + "/" + order.option);
          });

          // Prices
          this.cart.forEach((order) => {
            let type;
            switch (true) {
              case order.type.includes("aida"):
                type = "aida";
                break;
              case order.type.includes("evenweave"):
                type = "evenweave";
                break;
              case order.type.includes("linen"):
                type = "linen";
                break;

              default:
                break;
            }

            let key = order.product + "/" + type + "/";

            if (order.hasSilver) {
              key = key + "s";
            } else {
              key = key + "nos";
            }

            if (order.product == "bagged") {
              key = key + "/" + order.option;
            }

            this.orderprices.push(this.prices[key]);
          });

          this.getTotal();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  deleteOrder(index, orderId, userId) {
    this.http
      .post("/fabrics/deleteOrder", {
        user_id: jwt_decode(localStorage.getItem("access_token")).id,
        orderId: orderId,
      })
      .subscribe(
        (result) => {
          if (result["message"] === "success") {
            this.showNotification(
              "top",
              "right",
              "Order is deleted successfully"
            );

            this.ngOnInit();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  editOrder(index, orderId) {
    this.http
      .post("/fabrics/updateOrder", { order: this.cart[index] })
      .subscribe(
        (result) => {
          if (result["message"] === "success") {
            this.showNotification("top", "right", "Updated order successfully");
            this.ngOnInit();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  changeOrderData(value, i) {
    this.cart[i].product = value.split("/")[0];
    this.cart[i].option = value.split("/")[1];

    this.orderprices[i] = this.calculatePrice(i);
    this.getTotal();
  }

  quantityChanged(e) {
    this.getTotal();
  }

  onSilverTick(checked, i) {
    this.orderprices[i] = this.calculatePrice(i);
    this.getTotal();
  }

  onTypeChange(value, i) {
    this.orderprices[i] = this.calculatePrice(i);
    this.getTotal();
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

  getTotal() {
    this.total = 0;
    for (let i = 0; i < this.orderprices.length; i++) {
      this.total = this.total + this.orderprices[i] * this.cart[i].quantity;
    }

    this.discount = (this.discountPercentage * this.total) / 100;
    this.total = this.total - this.discount;
  }

  pay() {
    let total = 0;
    for (let i = 0; i < this.orderprices.length; i++) {
      total = total + this.orderprices[i] * this.cart[i].quantity;
    }

    if (this.total == 0) {
      this.showNotification(
        "top",
        "right",
        "Please make sure that your cart is not empty."
      );
    } else {
      this.orderService.changeData({
        cart: this.cart,
        amount: total,
        masterFiles: this.masterFiles,
        prices: this.orderprices,
        discount: this.discount,
      });

      this.router.navigateByUrl("/fabrics/pay");
    }
  }

  openImage(name, option) {
    window.open(
      `previews/${name.replaceAll(" ", "_")}/${name.replaceAll(" ", "_")}-${
        option.includes("-panel")
          ? "full-panel"
          : option.includes("regular-cut")
          ? "fat-quarter"
          : option
      }-14-Aida-36x56.jpg`,
      "_blank"
    );
  }
}
