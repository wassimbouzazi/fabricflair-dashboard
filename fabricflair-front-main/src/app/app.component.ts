import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";

declare var $: any;
declare let gtag: Function;

@Component({
  selector: "app-my-app",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  constructor(public router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag("config", "G-C3MCYXWSB8", {
          page_path: event.urlAfterRedirects,
        });
      }
    });
  }

  ngOnInit() {
    $.material.init();
  }
}
