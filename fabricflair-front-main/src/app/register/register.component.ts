import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from "app/services/auth/auth.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FieldErrorDisplayComponent } from "app/field-error-display/field-error-display.component";

declare var $: any;

@Component({
  selector: "app-register-cmp",
  templateUrl: "./register.component.html",
})
export class RegisterComponent implements OnInit {
  email;
  password;

  registrationForm: FormGroup;
  conditionChecked = false;
  privacyChecked = false;
  registeredChecked = false;
  selectedClientType;

  cities = [
    {
      name: "qsdqsd",
      value: 0,
    },
    {
      name: "sdqs",
      value: 1,
    },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  onClientTypeChange(value) {
    this.selectedClientType = value;
  }

  ngOnInit() {
    if (this.auth.isAuthenticated()) return this.router.navigate(["fabrics"]);

    // Registration Logic

    this.registrationForm = new FormGroup({
      fullName: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
      companyName: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
      ]),
      companyAddressLine: new FormControl(null, [Validators.required]),
      companyAddressRegion: new FormControl(null, [Validators.required]),
      companyAddressPostcode: new FormControl(null, [Validators.required]),
      companyAddressCountry: new FormControl(null, [Validators.required]),
      companyPhone: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
      companyWebsite: new FormControl(null, [Validators.required]),
      companyEIN: new FormControl(null, [Validators.required]),
    });
  }

  checkValue(a) {
    console.log(a);
  }

  showNotification(from: any, align: any, text: any, color: any) {
    $.notify(
      {
        icon: "notifications",
        message: text,
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

  onRegister() {
    console.log(this.conditionChecked);

    if (!this.selectedClientType) {
      this.showNotification(
        "top",
        "right",
        "Please make sure you select a type (Designer/Retailer/Both).",
        "warning"
      );
      return;
    }

    if (!this.conditionChecked) {
      this.showNotification(
        "top",
        "right",
        "Please make sure you agree to Terms and Conditions.",
        "warning"
      );
      return;
    }

    if (!this.privacyChecked) {
      this.showNotification(
        "top",
        "right",
        "Please make sure you agree to Privacy Policy.",
        "warning"
      );
      return;
    }

    if (!this.registeredChecked) {
      this.showNotification(
        "top",
        "right",
        "Please make sure you agree that you are registered.",
        "warning"
      );
      return;
    }

    this.validateAllFormFields(this.registrationForm);
    if (this.registrationForm.invalid) {
      this.showNotification(
        "top",
        "right",
        "Missing or incorrect field",
        "danger"
      );
      return;
    }

    const data = {
      fullName: this.registrationForm.value.fullName,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value.password,
      companyName: this.registrationForm.value.companyName,
      companyAddressLine: this.registrationForm.value.companyAddressLine,
      companyAddressRegion: this.registrationForm.value.companyAddressRegion,
      companyAddressPostcode:
        this.registrationForm.value.companyAddressPostcode,
      companyAddressCountry: this.registrationForm.value.companyAddressCountry,
      companyPhone: this.registrationForm.value.companyPhone,
      companyWebsite: this.registrationForm.value.companyWebsite,
      companyEIN: this.registrationForm.value.companyEIN,
      clientType: this.selectedClientType,
    };

    this.http.post("user/requestAccount", data).subscribe(
      (result) => {
        console.log(result);

        this.showNotification(
          "top",
          "right",
          "You've successfully requested an account, check your email",
          "success"
        );
        this.registrationForm.reset();
      },
      (error) => {
        if (error.error.error.errmsg.includes("email")) {
          this.showNotification(
            "top",
            "right",
            "This email is already registered, try another one",
            "danger"
          );
        }
      }
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
}
