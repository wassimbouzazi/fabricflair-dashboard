import { Component, OnInit } from "@angular/core";
import PerfectScrollbar from "perfect-scrollbar";

import * as jwt_decode from "jwt-decode";
import { Router } from "@angular/router";

declare const $: any;

//Metadata
export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

//Menu Items
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    type: "sub",
    icontype: "apps",
    collapse: "Dashboard",
    children: [
      { path: "overview", title: "Overview", ab: "O" },
      { path: "backup", title: "Backup", ab: "B" },
    ],
  },
  {
    path: "/fabrics",
    title: "Fabrics",
    type: "link",
    icontype: "dashboard",
  },
  {
    path: "/designs",
    title: "Designs",
    type: "link",
    icontype: "view_carousel",
  },
  {
    path: "/medley",
    title: "Medley",
    type: "link",
    icontype: "dashboard_customize",
  },
  {
    path: "/utilities",
    title: "Utilities",
    type: "sub",
    icontype: "view_module",
    collapse: "Utilities",
    children: [
      { path: "orders", title: "Orders", ab: "O" },
      { path: "pricings", title: "Pricings", ab: "P" },
      { path: "categories", title: "Categories", ab: "C" },
      { path: "customers", title: "Customers", ab: "C" },
      { path: "requests", title: "Requests", ab: "R" },
    ],
  },
];
@Component({
  selector: "app-sidebar-cmp",
  templateUrl: "sidebar.component.html",
})
export class SidebarComponent implements OnInit {
  email;
  type;

  public menuItems: any[];

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.email = jwt_decode(
      localStorage.getItem("access_token")
    ).email.substring(
      0,
      jwt_decode(localStorage.getItem("access_token")).email.indexOf("@")
    );
    this.type = jwt_decode(localStorage.getItem("access_token")).type;

    this.menuItems = ROUTES.filter((menuItem) => menuItem);

    if (this.type != "root") {
      // Hide Utilities
      this.menuItems = this.menuItems.filter(function (item) {
        return item.title !== "Utilities";
      });

      // Hide Dashboard
      this.menuItems = this.menuItems.filter(function (item) {
        return item.title !== "Dashboard";
      });

      console.log(this.menuItems);
    }
  }
  updatePS(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>(
        document.querySelector(".sidebar .sidebar-wrapper")
      );
      let ps = new PerfectScrollbar(elemSidebar, {
        wheelSpeed: 2,
        suppressScrollX: true,
      });
    }
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

  logout() {
    localStorage.clear();
    this.router.navigate(["/login/"]);
  }
}
