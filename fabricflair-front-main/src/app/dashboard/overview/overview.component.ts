import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";

declare const $: any;

@Component({
  selector: "app-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.css"],
})
export class OverviewComponent {
  constructor(private http: HttpClient) {}

  databaseInfo: any;

  getDatabaseInfo() {
    this.http.get("/dashboard/getDatabaseInfo").subscribe((result) => {
      this.databaseInfo = result;
    });
  }

  ngOnInit() {
    this.getDatabaseInfo();
  }
}
