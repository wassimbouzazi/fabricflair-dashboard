import {
  Component,
  OnInit,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
} from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
declare const $: any;
import * as jwt_decode from "jwt-decode";

@Component({
  selector: "app-fabrics",
  templateUrl: "./orderfabric.component.html",
  styleUrls: ["./orderfabric.component.css"],
})
export class OrderFabricComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  selectedProduct = "euro";
  selectedOption;
  selectedType;
  hasSilver = false;
  quantity = 1;
  id;
  fabric;
  fabricTitle;
  previewImages = {};

  getMeasurements = (inches, cutType) => {
    let h,
      w = 0;
    const allowence = parseInt(inches);

    if (this.selectedProduct == "us") {
      switch (cutType) {
        case "fat-16":
          h = 13.5;
          w = 9;
          break;

        case "fat-12":
          h = 13.5;
          w = 12;
          break;

        case "fat-9":
          h = 18;
          w = 12;
          break;

        case "fat-8":
          h = 13.5;
          w = 18;
          break;

        case "fat-quarter":
          h = 27;
          w = 18;
          break;

        case "fat-half":
          h = 36;
          w = 27;
          break;

        case "54-panel":
          h = 54;
          w = 36;
          break;

        default:
          break;
      }
    } else {
      switch (cutType) {
        case "fat-16":
          h = 10;
          w = 9;
          break;

        case "fat-12":
          h = 10;
          w = 12;
          break;

        case "fat-9":
          h = 13.4;
          w = 12;
          break;

        case "fat-8":
          h = 10;
          w = 18;
          break;

        case "quarter-cut":
          h = 20;
          w = 18;
          break;

        case "fat-half":
          h = 20;
          w = 36;
          break;

        case "40-panel":
          h = 40;
          w = 36;
          break;

        default:
          break;
      }
    }

    return `${w - allowence * 2}x${h - allowence * 2}`;
  };

  selectionLogic = () => {
    if (this.selectedProduct == "bagged") {
      this.selectedOption = "fat-quarter";
    } else {
      if (this.fabric.seamless == true) {
        if (this.selectedProduct == "us") {
          this.selectedOption = "54-panel";
        } else if (this.selectedProduct == "euro") {
          this.selectedOption = "40-full-panel";
        }
      } else {
        this.selectedOption = "fat-16";
      }
    }
  };

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((x) => {
      this.id = x.get("fabricId");

      this.http.get("/fabrics/" + this.id).subscribe((result) => {
        this.fabric = result["fabric"][0];
        this.fabricTitle = this.fabric.title.split(" ").join("_");

        this.previewImages[
          "fat16"
        ] = `${this.fabricTitle}/${this.fabricTitle}-fat-16-14-Aida-36x56.jpg`;
        this.previewImages[
          "fat12"
        ] = `${this.fabricTitle}/${this.fabricTitle}-fat-12-14-Aida-36x56.jpg`;
        this.previewImages[
          "fat9"
        ] = `${this.fabricTitle}/${this.fabricTitle}-fat-9-14-Aida-36x56.jpg`;
        this.previewImages[
          "fat8"
        ] = `${this.fabricTitle}/${this.fabricTitle}-fat-8-14-Aida-36x56.jpg`;
        this.previewImages[
          "quarter"
        ] = `${this.fabricTitle}/${this.fabricTitle}-fat-quarter-14-Aida-36x56.jpg`;
        this.previewImages[
          "half"
        ] = `${this.fabricTitle}/${this.fabricTitle}-fat-half-14-Aida-36x56.jpg`;
        this.previewImages[
          "full"
        ] = `${this.fabricTitle}/${this.fabricTitle}-full-panel-14-Aida-36x56.jpg`;

        this.selectionLogic();
      });
    });

    // Wizard Initialization
    $(".wizard-card").bootstrapWizard({
      tabClass: "nav nav-pills",
      nextSelector: ".btn-next",
      previousSelector: ".btn-previous",

      onNext: function (tab, navigation, index) {},

      onInit: function (tab: any, navigation: any, index: any) {
        // check number of tabs and fill the entire row
        let $total = navigation.find("li").length;
        let $wizard = navigation.closest(".wizard-card");

        let $first_li = navigation.find("li:first-child a").html();
        let $moving_div = $('<div class="moving-tab">' + $first_li + "</div>");
        $(".wizard-card .wizard-navigation").append($moving_div);

        $total = $wizard.find(".nav li").length;
        let $li_width = 100 / $total;

        let total_steps = $wizard.find(".nav li").length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find(".nav li").css("width", $li_width + "%");

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        let $current = index + 1;

        if ($current == 1 || (mobile_device == true && index % 2 == 0)) {
          move_distance -= 8;
        } else if (
          $current == total_steps ||
          (mobile_device == true && index % 2 == 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
          vertical_level = vertical_level * 38;
        }

        $wizard.find(".moving-tab").css("width", step_width);
        $(".moving-tab").css({
          transform:
            "translate3d(" + move_distance + "px, " + vertical_level + "px, 0)",
          transition: "all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)",
        });
        $(".moving-tab").css("transition", "transform 0s");
      },

      onTabClick: function (tab: any, navigation: any, index: any) {
        // TEST
      },

      onTabShow: function (tab: any, navigation: any, index: any) {
        let $total = navigation.find("li").length;
        let $current = index + 1;

        const $wizard = navigation.closest(".wizard-card");

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          $($wizard).find(".btn-next").hide();
          $($wizard).find(".btn-finish").show();
        } else {
          $($wizard).find(".btn-next").show();
          $($wizard).find(".btn-finish").hide();
        }

        const button_text = navigation
          .find("li:nth-child(" + $current + ") a")
          .html();

        setTimeout(function () {
          $(".moving-tab").text(button_text);
        }, 150);

        const checkbox = $(".footer-checkbox");

        if (index !== 0) {
          $(checkbox).css({
            opacity: "0",
            visibility: "hidden",
            position: "absolute",
          });
        } else {
          $(checkbox).css({
            opacity: "1",
            visibility: "visible",
          });
        }
        $total = $wizard.find(".nav li").length;
        let $li_width = 100 / $total;

        let total_steps = $wizard.find(".nav li").length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find(".nav li").css("width", $li_width + "%");

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        $current = index + 1;

        if ($current == 1 || (mobile_device == true && index % 2 == 0)) {
          move_distance -= 8;
        } else if (
          $current == total_steps ||
          (mobile_device == true && index % 2 == 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
          vertical_level = vertical_level * 38;
        }

        $wizard.find(".moving-tab").css("width", step_width);
        $(".moving-tab").css({
          transform:
            "translate3d(" + move_distance + "px, " + vertical_level + "px, 0)",
          transition: "all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)",
        });
      },
    });
  }

  onProductItemChange(value) {
    this.selectedProduct = value;

    this.selectionLogic();
  }

  onOptionItemChange(value) {
    this.selectedOption = value;
  }

  addToCart() {
    if (this.selectedType == undefined) {
      this.showNotification("top", "right", "Choose a Fabric Type");
      return;
    }

    if (this.quantity <= 0 || this.quantity > 200) {
      this.showNotification(
        "top",
        "right",
        "Quantity must be between 1 and 200"
      );
      return;
    }

    let user_id = jwt_decode(localStorage.getItem("access_token")).id;

    let order_data = {
      fabric_id: this.id,
      fabric_name: this.fabric.title,
      product: this.selectedProduct,
      option: this.selectedOption,
      type: this.selectedType,
      hasSilver: this.hasSilver,
      quantity: this.quantity,
    };

    this.http
      .post("/fabrics/orderfabric", {
        user_id: user_id,
        order_data: order_data,
      })
      .subscribe(
        (result) => {
          if (result["message"] === "success") {
            this.showNotification(
              "top",
              "right",
              "Order created successfully. Check your cart..."
            );
            this.router.navigate(["/fabrics"]);
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  ngAfterViewInit() {
    $(".wizard-card").each(function () {
      const $wizard = $(this);
      const index = $wizard.bootstrapWizard("currentIndex");
      let $total = $wizard.find(".nav li").length;
      let $li_width = 100 / $total;

      let total_steps = $wizard.find(".nav li").length;
      let move_distance = $wizard.width() / total_steps;
      let index_temp = index;
      let vertical_level = 0;

      let mobile_device = $(document).width() < 600 && $total > 3;

      if (mobile_device) {
        move_distance = $wizard.width() / 2;
        index_temp = index % 2;
        $li_width = 50;
      }

      $wizard.find(".nav li").css("width", $li_width + "%");

      let step_width = move_distance;
      move_distance = move_distance * index_temp;

      let $current = index + 1;

      if ($current == 1 || (mobile_device == true && index % 2 == 0)) {
        move_distance -= 8;
      } else if (
        $current == total_steps ||
        (mobile_device == true && index % 2 == 1)
      ) {
        move_distance += 8;
      }

      if (mobile_device) {
        let x: any = index / 2;
        vertical_level = parseInt(x);
        vertical_level = vertical_level * 38;
      }

      $wizard.find(".moving-tab").css("width", step_width);
      $(".moving-tab").css({
        transform:
          "translate3d(" + move_distance + "px, " + vertical_level + "px, 0)",
        transition: "all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)",
      });

      $(".moving-tab").css({
        transition: "transform 0s",
      });
    });
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
}
