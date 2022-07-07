import { Routes } from "@angular/router";

import { PricingsComponent } from "./pricings/pricings.component";
import { CategoriesComponent } from "./categories/categories.component";
import { CustomersComponent } from "./customers/customers.component";

import { AdminAuthGuardService as AuthGuard } from "../services/auth/admin-auth-guard.service";
import { RequestsComponent } from "./requests/requests.component";
import { OrdersComponent } from "./orders/orders.component";
import { ViewOrderComponent } from "./orders/view-order/view-order.component";

export const UtilitiesRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "pricings",
        component: PricingsComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "categories",
        component: CategoriesComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "customers",
        component: CustomersComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "orders",
        component: OrdersComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "orders/view/:orderId",
        component: ViewOrderComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "requests",
        component: RequestsComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];
