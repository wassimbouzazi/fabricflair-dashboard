import { Routes } from "@angular/router";

import { FabricsComponent } from "./fabrics.component";
import { AddFabricComponent } from "./addfabric/addfabric.component";
import { EditFabricComponent } from "./editfabric/editfabric.component";
import { ViewFabricComponent } from "./viewfabric/viewfabric.component";
import { GenerateFabricsComponent } from "./generatefabrics/generatefabrics.component";
import { AuthGuardService as AuthGuard } from "../services/auth/auth-guard.service";

import { AdminAuthGuardService as AdminAuthGuard } from "../services/auth/admin-auth-guard.service";

import { ViewimagesComponent } from "./viewimages/viewimages.component";
import { OrderFabricComponent } from "./orderfabric/orderfabric.component";
import { CartComponent } from "./cart/cart.component";
import { StripePaymentComponent } from "./stripe-payment/stripe-payment.component";
import { UserOrdersComponent } from "./user-orders/user-orders.component";
import { UserFabricsInfoComponent } from "./user-fabrics-info/user-fabrics-info.component";

export const FabricsRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "fabrics",
        component: FabricsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "fabrics/addfabric",
        component: AddFabricComponent,
        canActivate: [AdminAuthGuard],
      },
      {
        path: "fabrics/cart",
        component: CartComponent,
      },
      {
        path: "fabrics/previousorders",
        component: UserOrdersComponent,
      },
      {
        path: "fabrics/editfabric/:fabricId",
        component: EditFabricComponent,
        canActivate: [AdminAuthGuard],
      },
      {
        path: "fabrics/orderfabric/:fabricId",
        component: OrderFabricComponent,
      },
      {
        path: "fabrics/user-fabrics/fabrics/:id",
        component: UserFabricsInfoComponent,
      },
      {
        path: "fabrics/viewfabric/:fabricId",
        component: ViewFabricComponent,
      },
      {
        path: "fabrics/pay",
        component: StripePaymentComponent,
      },
      {
        path: "fabrics/generate/:fabricId",
        component: GenerateFabricsComponent,
      },
      {
        path: "fabrics/viewimages/:fabricTitle",
        component: ViewimagesComponent,
      },
    ],
  },
];
