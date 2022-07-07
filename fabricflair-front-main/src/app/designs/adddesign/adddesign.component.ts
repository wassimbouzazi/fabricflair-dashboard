import { Component, OnInit, ElementRef } from "@angular/core";
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

declare const $: any;

@Component({
  selector: "app-adddesign-cmp",
  templateUrl: "adddesign.component.html",
  styleUrls: ["./adddesign.component.css"],
})
export class AddDesignComponent implements OnInit {
  form: FormGroup;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.form = new FormGroup({
      patternName: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      stitchCountWidth: new FormControl(null, [Validators.required]),
      stitchCountHeight: new FormControl(null, [Validators.required]),
      defaultCount: new FormControl(null, [Validators.required]),
      designerName: new FormControl(null, [Validators.required]),
      design_masterfile: new FormControl(null, [Validators.required]),
    });
  }

  onDesignDataSubmit() {
    console.log("hey");

    this.validateAllFormFields(this.form);
    if (this.form.invalid) return;

    console.log(this.form);

    const designData = new FormData();
    designData.append("pattern_name", this.form.value.patternName);
    designData.append("description", this.form.value.description);
    designData.append("stitchount_width", this.form.value.stitchCountWidth);
    designData.append("stitchcount_height", this.form.value.stitchCountHeight);
    designData.append("default_count", this.form.value.defaultCount);
    designData.append("designer_name", this.form.value.designerName);
    designData.append("design_masterfile", this.form.value.design_masterfile);

    this.showNotification(
      "top",
      "right",
      "Starting design addition, please wait..."
    );

    this.http.post("/designs/postDesign", designData).subscribe((result) => {
      console.log(result["message"]);
      if (result["message"] === "success") {
        this.showNotification(
          "top",
          "right",
          "Successfully <b>added</b> the design..."
        );
        this.form.reset();
        $(".fileinput").fileinput("clear");
        this.router.navigate(["/designs"]);
      }
    });
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

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      "has-error": this.isFieldValid(form, field),
      "has-feedback": this.isFieldValid(form, field),
    };
  }

  onImagePicked(event: Event) {
    const design_masterfile = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ design_masterfile: design_masterfile });
    this.form.get("design_masterfile").updateValueAndValidity();
    console.log(design_masterfile);
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
