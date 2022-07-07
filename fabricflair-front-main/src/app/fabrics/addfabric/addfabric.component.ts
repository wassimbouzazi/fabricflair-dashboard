import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { ColorEvent } from "ngx-color";
import * as jwt_decode from "jwt-decode";
import { MedleyFabricService } from "app/services/medley_fabric.service";
import { forEach } from "@angular/router/src/utils/collection";

declare const $: any;

@Component({
  selector: "app-addfabric-cmp",
  templateUrl: "addfabric.component.html",
  styleUrls: ["./addfabric.component.css"],
})
export class AddFabricComponent implements OnInit, OnDestroy {
  constructor(
    private http: HttpClient,
    private router: Router,
    private service: MedleyFabricService
  ) {}

  form: FormGroup;
  pricings = [];
  defaultPricing;
  categories: any;
  exclusives = ["General Release"];
  item_code;
  uploading = false;

  selectedCategories = [
    {
      id: 176,
      itemName: "Fabrics",
    },
  ];
  dropdownSettings = {};

  // Variable check whether redirected from medley or not.
  fromMedley = false;
  imgPathMedly = null;

  ngOnInit() {
    // Required function to retrive base64 data from img
    const toDataURL = (url) =>
      fetch(url)
        .then((response) => response.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );
    // End

    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Categories",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      classes: "myclass custom-class",
    };

    this.form = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      videoURL: new FormControl(null),
      price: new FormControl("null", [Validators.required]),
      seamless: new FormControl(false),
      hashtags: new FormControl(null, [Validators.required]),
      masterfile: new FormControl(null, [Validators.required]),
      backgroundColor: new FormControl("#FFFFFF", [Validators.required]),
      inches: new FormControl(2, [Validators.required]),
      exclusive: new FormControl(null, [Validators.required]),
      keep_ratio: new FormControl(false),
      categories: new FormControl(null, [Validators.required]),
      landscape: new FormControl(false, [Validators.required]),
    });

    this.form.controls["price"].setValue("Green Pricing");
    this.form.controls["exclusive"].setValue("General Release");
    let hashtags = [{ display: "fabricflair", value: "fabricflair" }];
    this.form.controls["hashtags"].setValue(hashtags);

    // Check if redirected from medley if data is full.
    this.service.currentData.subscribe((data) => {
      console.log("MEDLEY DATA", data);
      if (data != "") {
        console.log(data["imagePath"]);
        this.imgPathMedly = data["imagePath"];

        this.fromMedley = true;
        fetch(data["imagePath"])
          .then((res) => res.blob())
          .then((blob) => {
            toDataURL(data["imagePath"]).then((dataUrl) => {
              const file = new File([blob], data["title"] + ".jpg", blob);
              file["result"] = dataUrl;
              console.log(file);
              this.form.controls["masterfile"].setValue(file);
            });
          });

        let title = "";
        data["titles"].forEach((t) => {
          title = title + t + " | ";
        });

        this.form.controls["title"].setValue(title);
        this.form.controls["description"].setValue(title);
        this.selectedCategories = data["categories"];
        console.log(data["categories"]);
        console.log(data["hashtags"]);

        let hashtags = [];
        data["hashtags"].forEach((hashtagStr) => {
          hashtags.push({ display: hashtagStr, value: hashtagStr });
        });
        this.form.controls["hashtags"].setValue(hashtags);
        this.form.updateValueAndValidity();
      }
    });

    // Pricing names
    this.http.get("/pricing/getPricingNames").subscribe(
      (result) => {
        result["pricings"].forEach((element) => {
          this.pricings.push(element["groupName"]);
        });
        this.defaultPricing = this.pricings[0];
        console.log(this.pricings);
      },
      (error) => {
        console.log(error);
      }
    );

    // Item code
    this.http.get("/fabrics/getItemCode").subscribe((result) => {
      this.item_code = result["code"];
      console.log(this.item_code);
    });

    this.http.get("/categories/getCategories").subscribe((result) => {
      this.categories = result["data"];
      console.log(this.categories);
    });

    this.http.get("/customers/getExclusiveCustomers").subscribe((result) => {
      this.exclusives = this.exclusives.concat(result["exclusives"]);
      console.log(this.exclusives);
    });
  }

  seamlessChange(evt) {
    var target = evt.target;
    if (target.checked) {
      console.log("checked");
      this.form.get("inches").setValue(0);
    } else {
      console.log("unchecked");
      this.form.get("inches").setValue(2);
    }
    this.form.updateValueAndValidity();
  }

  onImagePicked(event: Event) {
    const masterfile = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ masterfile: masterfile });
    this.form.get("masterfile").updateValueAndValidity();
    console.log(masterfile);
    this.form.controls["title"].setValue(
      masterfile.name.split(".").slice(0, -1).join(".")
    );
    this.form.controls["description"].setValue(
      masterfile.name.split(".").slice(0, -1).join(".")
    );
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  handleChangeComplete($event: ColorEvent) {
    this.form.get("backgroundColor").setValue($event.color.hex);
    this.form.updateValueAndValidity();

    console.log(this.form.get("backgroundColor").value);
  }

  onFabricDataSubmit() {
    if (this.selectedCategories.length > 0) {
      this.form.controls["categories"].setValue(this.selectedCategories);
    } else {
      this.form.controls["categories"].setValue(null);
    }

    this.form.updateValueAndValidity();

    this.validateAllFormFields(this.form);
    if (this.form.invalid) return;

    console.log(this.form.value.title);
    console.log(this.form.value.description);
    console.log(this.form.value.videoURL);
    console.log(this.form.value.price);
    console.log(this.form.value.seamless);
    console.log(this.form.value.masterfile);
    console.log(this.form.value.inches);
    console.log(this.form.value.exclusive);
    console.log(this.form.value.keep_ratio);
    console.log(this.form.value.categories);

    const fabricData = new FormData();
    fabricData.append("title", this.form.value.title);
    fabricData.append("description", this.form.value.description);

    if (this.form.value.videoURL == "") {
      fabricData.append("videoUrl", null);
    } else {
      fabricData.append("videoUrl", this.form.value.videoURL);
    }
    fabricData.append("price", this.form.value.price);
    fabricData.append("item_code", this.item_code);

    if (this.form.value.seamless == null) {
      fabricData.append("seamless", "false");
    } else {
      fabricData.append("seamless", this.form.value.seamless);
    }

    let hashtags = [];

    if (
      this.form.value.hashtags != null &&
      this.form.value.hashtags.length > 0
    ) {
      this.form.value.hashtags.forEach((hashtag) => {
        console.log(this.form.value.hashtag);

        console.log(hashtag.value);
        hashtags.push(hashtag.value);
      });
      fabricData.append("hashtags", JSON.stringify(hashtags));
      console.log(JSON.stringify(hashtags));
    } else {
      return;
    }

    fabricData.append("masterfile", this.form.value.masterfile);

    // Change category object name attribute back to "name".
    this.form.controls["categories"].setValue(
      this.form.value.categories.map(({ id, itemName }) => ({
        id: id,
        name: itemName,
      }))
    );
    this.form.updateValueAndValidity();
    //

    fabricData.append("categories", JSON.stringify(this.form.value.categories));
    fabricData.append(
      "added_by",
      jwt_decode(localStorage.getItem("access_token")).email
    );

    let state;
    if (this.form.value.seamless == true) {
      state = 1;
    } else {
      state = 0;
    }

    fabricData.append("state", state);

    // Seamless . Ratio. Landscape

    let seamless;
    let ratio;
    let landscape;

    if (this.form.value.seamless == true) {
      seamless = 1;
    } else {
      seamless = 0;
    }

    if (this.form.value.keep_ratio == true) {
      ratio = 1;
    } else {
      ratio = 0;
    }

    if (this.form.value.landscape == true) {
      landscape = 1;
    } else {
      landscape = 0;
    }

    fabricData.append("fabricName", this.form.value.title);
    fabricData.append(
      "extension",
      this.form.value.masterfile.name.substring(
        this.form.value.masterfile.name.lastIndexOf(".") + 1
      )
    );
    fabricData.append("seamlessValue", seamless);
    fabricData.append("inches", this.form.value.inches);
    fabricData.append("ratio", ratio);
    fabricData.append(
      "hex",
      ("" + this.form.get("backgroundColor").value).substr(1)
    );
    fabricData.append("exclusive", this.form.value.exclusive);
    fabricData.append("landscape", landscape);

    this.showNotification(
      "top",
      "right",
      "info",
      "Starting fabric addition, please wait..."
    );

    this.uploading = true;
    this.http.post("/fabrics/postFabric", fabricData).subscribe(
      (result) => {
        console.log(result["message"]);
        if (result["message"] === "success") {
          this.showNotification(
            "top",
            "right",
            "success",
            "Successfully <b>added</b> the fabric (" +
              this.form.value.title +
              ")"
          );

          this.form.reset();
          this.uploading = false;
          if (this.fromMedley == false) {
            $(".fileinput").fileinput("clear");
          }
          this.router.navigate(["/fabrics"]);
        }
      },
      (error) => {
        console.log(error);
        this.uploading = false;
        if (error.error) {
          this.showNotification(
            "top",
            "right",
            "danger",
            `${error.error.error}`
          );
        } else {
          this.showNotification(
            "top",
            "right",
            "danger",
            "ERROR IN ADDING (" + this.form.value.title + ")"
          );
        }
      }
    );
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

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      "has-error": this.isFieldValid(form, field),
      "has-feedback": this.isFieldValid(form, field),
    };
  }

  showNotification(from: any, align: any, color: string, message: string) {
    const type = [
      "",
      "info",
      "success",
      "warning",
      "danger",
      "rose",
      "primary",
    ];

    $.notify(
      {
        icon: "notifications",
        message: message,
      },
      {
        type: color,
        timer: 1500,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  }

  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedCategories);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedCategories);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }

  ngOnDestroy() {
    // Clean up Service Data
    this.service.changeData("");
  }
}
