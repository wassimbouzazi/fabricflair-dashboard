import { Routes } from "@angular/router";

import { AdminLayoutComponent } from "./layouts/admin/admin-layout.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";

export const AppRoutes: Routes = [
  {
    path: "",
    redirectTo: "fabrics",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "",
    component: AdminLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: "./fabrics/fabrics.module#FabricsModule",
      },
      {
        path: "",
        loadChildren: "./designs/designs.module#DesignsModule",
      },
      {
        path: "",
        loadChildren: "./medley/medley.module#MedleyModule",
      },
      {
        path: "utilities",
        loadChildren: "./utilities/utilities.module#UtilitiesModule",
      },
      {
        path: "dashboard",
        loadChildren: "./dashboard/dashboard.module#DashboardModule",
      },
    ],
  },
];
