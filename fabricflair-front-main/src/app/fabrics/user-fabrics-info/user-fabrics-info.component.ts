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
import { saveAs } from "file-saver";

declare const $: any;

@Component({
  selector: "app-user-fabrics-info-cmp",
  templateUrl: "user-fabrics-info.component.html",
})
export class UserFabricsInfoComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  fabrics;
  id;

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((x) => {
      this.id = x.get("id");

      // GET FABRIC DATA
      this.http
        .post("/orders/getUserOrderFabrics", { id: this.id })
        .subscribe((result) => {
          this.fabrics = result["fabrics"]["items"];
          console.log(this.fabrics);
        });
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
}
