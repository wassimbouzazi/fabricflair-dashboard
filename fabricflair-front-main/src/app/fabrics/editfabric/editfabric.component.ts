import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { ColorEvent } from "ngx-color";

declare const $: any;

@Component({
  selector: "app-editfabric-cmp",
  templateUrl: "editfabric.component.html",
  styleUrls: ["./editfabric.component.css"],
})
export class EditFabricComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  form: FormGroup;
  fabric;
  id;
  pricings = [];
  exclusives = ["General Release"];
  initialHex;

  ngOnInit() {
    // Pricing names
    this.http.get("/pricing/getPricingNames").subscribe(
      (result) => {
        result["pricings"].forEach((element) => {
          this.pricings.push(element["groupName"]);
        });
        console.log(this.pricings);
      },
      (error) => {
        console.log(error);
      }
    );

    // Exclusive customers

    this.http.get("/customers/getExclusiveCustomers").subscribe((result) => {
      this.exclusives = this.exclusives.concat(result["exclusives"]);
      console.log(this.exclusives);
    });

    this.form = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      videoURL: new FormControl(null),
      notes: new FormControl(null),
      shelfLocation: new FormControl(null),
      price: new FormControl(null, [Validators.required]),
      seamless: new FormControl(null),
      hashtags: new FormControl(null, [Validators.required]),
      inches: new FormControl(null, [Validators.required]),
      exclusive: new FormControl(null, [Validators.required]),
      backgroundColor: new FormControl(null, [Validators.required]),
      keep_ratio: new FormControl(null, [Validators.required]),
      landscape: new FormControl(null, [Validators.required]),
    });

    this.activatedRoute.paramMap.subscribe((x) => {
      this.id = x.get("fabricId");
      this.http.get("/fabrics/" + this.id).subscribe((result) => {
        console.log(result["fabric"][0]);
        this.fabric = result["fabric"][0];
        console.log(this.fabric.title);
        this.form.controls["title"].setValue(this.fabric.title);
        this.form.controls["description"].setValue(this.fabric.description);

        if (this.fabric.videoUrl == "null") {
          this.form.controls["videoURL"].setValue("");
        } else {
          this.form.controls["videoURL"].setValue(this.fabric.videoUrl);
        }

        if (this.fabric.notes == "null") {
          this.form.controls["notes"].setValue("");
        } else {
          this.form.controls["notes"].setValue(this.fabric.notes);
        }

        if (this.fabric.shelfLocation == "null") {
          this.form.controls["shelfLocation"].setValue("");
        } else {
          this.form.controls["shelfLocation"].setValue(
            this.fabric.shelfLocation
          );
        }

        this.form.controls["price"].setValue(this.fabric.price);
        this.form.controls["exclusive"].setValue(this.fabric.exclusive);

        this.form.controls["seamless"].setValue(this.fabric.seamless);

        let hashtags = [];
        JSON.parse(this.fabric.hashtags[0]).forEach((hashtag) => {
          hashtags.push({ display: hashtag, value: hashtag });
        });
        this.form.controls["hashtags"].setValue(hashtags);
        console.log(this.fabric.hashtags[0]);
        this.form.controls["inches"].setValue(this.fabric.inches);

        this.form.controls["backgroundColor"].setValue(this.fabric.hex);
        this.initialHex = this.fabric.hex;
        console.log(this.initialHex);
        console.log(this.fabric.ratio);

        if (this.fabric.ratio == "1") {
          this.form.controls["keep_ratio"].setValue(true);
        } else {
          this.form.controls["keep_ratio"].setValue(false);
        }

        console.log("LANDSCAPE == ", this.fabric.landscape);

        this.form.controls["landscape"].setValue(this.fabric.landscape);
      });
    });
  }

  handleChangeComplete($event: ColorEvent) {
    this.form.get("backgroundColor").setValue($event.color.hex);
    this.form.updateValueAndValidity();

    console.log(this.form.get("backgroundColor").value);
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

  onFabricDataSubmit() {
    this.form.updateValueAndValidity();

    this.validateAllFormFields(this.form);
    if (this.form.invalid) return;

    // const fabricData = new FormData();
    // fabricData.append("fabricId",this.id);
    // fabricData.append("title",this.form.value.title);
    // fabricData.append("description",this.form.value.description);
    // fabricData.append("videoUrl",this.form.value.videoURL);
    // fabricData.append("price",this.form.value.price);

    // if (this.form.value.seamless == null) {
    //     fabricData.append("seamless","false");
    // } else {
    //     fabricData.append("seamless",this.form.value.seamless);
    // }

    let hashtags = [];
    if (
      this.form.value.hashtags != null &&
      this.form.value.hashtags.length > 0
    ) {
      this.form.value.hashtags.forEach((hashtag) => {
        console.log(hashtag.value);
        hashtags.push(hashtag.value);
      });
      // fabricData.append("hashtags",JSON.stringify(hashtags));
      console.log(JSON.stringify(hashtags));
    } else {
      return;
    }

    var data = {
      new: {
        fabricId: this.id,
        title: this.form.value.title,
        description: this.form.value.description,
        videoUrl: this.form.value.videoURL,
        notes: this.form.value.notes,
        shelfLocation: this.form.value.shelfLocation,
        price: this.form.value.price,
        hashtags: JSON.stringify(hashtags),
        inches: this.form.value.inches,
        exclusive: this.form.value.exclusive,
        bgColor: this.form.value.backgroundColor,
        seamless: this.form.value.seamless,
        keep_ratio: this.form.value.keep_ratio,
        landscape: this.form.value.landscape,
      },
      old: this.fabric,
    };

    console.log(data);

    this.http.patch("/fabrics/editFabric", data).subscribe((response) => {
      console.log(response);

      this.showNotification("top", "right", response["message"]);
      this.router.navigate(["/fabrics"]);

      // console.log(result['message']);
      // if (result['status'] === 'success') {
      //     this.showNotification('top','right')
      // }
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

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      "has-error": this.isFieldValid(form, field),
      "has-feedback": this.isFieldValid(form, field),
    };
  }

  showNotification(from: any, align: any, text: any) {
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
        message: text,
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
