import { Component, OnInit, ElementRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from "app/services/auth/auth.service";

declare var $: any;

@Component({
  selector: "app-login-cmp",
  templateUrl: "./login.component.html",
  styleUrls: [
    "./login.component.css",
    "./css/responsive.css",
    "./css/bootstrap.css",
  ],
})
export class LoginComponent implements OnInit {
  email;
  password;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    if (this.auth.isAuthenticated()) return this.router.navigate(["fabrics"]);

    setTimeout(function () {
      // after 1000 ms we add the class animated to the login/register card
      $(".card").removeClass("card-hidden");
    }, 700);
  }

  login() {
    this.http
      .post("/user/login", { email: this.email, password: this.password })
      .subscribe(
        (result) => {
          localStorage.setItem("access_token", result["jwt"]);
          console.log(result["jwt"]);
          this.router.navigate(["fabrics"]);
        },
        (err) => {
          console.log(err.error);
          this.showNotification(
            "top",
            "right",
            "Credentials are not correct, try again..."
          );
        }
      );
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

    const color = "warning";

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
