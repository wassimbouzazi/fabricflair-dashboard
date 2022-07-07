import { Routes } from "@angular/router";

import { DesignsComponent } from "./designs.component";
import { AuthGuardService as AuthGuard } from "../services/auth/auth-guard.service";
import { AddDesignComponent } from "./adddesign/adddesign.component";
import { ViewOnFabricDesign } from "./view-on-fabric/view-on-fabric.component";
export const DesignsRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "designs",
        component: DesignsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "designs/adddesign",
        component: AddDesignComponent,
      },
      {
        path: "designs/viewonfabric/:designId",
        component: ViewOnFabricDesign,
      },
    ],
  },
];
