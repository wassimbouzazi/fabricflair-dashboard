import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { HttpClient } from "@angular/common/http";

declare const $: any;

@Component({
  selector: "app-view-orders-cmp",
  templateUrl: "view-order.component.html",
})
export class ViewOrderComponent implements OnInit {
  orderId;
  order;
  orderItems;
  imagePaths;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((x) => {
      this.orderId = x.get("orderId");

      // GET FABRIC DATA
      this.http.get("/orders/" + this.orderId).subscribe((result) => {
        this.order = result["order"];
        this.imagePaths = result["order_images"];
        this.orderItems = this.order.items;
        console.log(this.order);
      });
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

  downloadImage(imagePath, imageName) {
    let data = { imagePath: imagePath, imageName: imageName };
    window.location.href =
      "orders/downloadImage/" +
      JSON.stringify(data).split("/").join("alahalahaalykabidi");
  }
}
