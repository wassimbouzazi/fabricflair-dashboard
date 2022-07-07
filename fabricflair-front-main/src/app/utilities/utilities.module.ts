import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { PricingsComponent } from "./pricings/pricings.component";
import { UtilitiesRoutes } from "./utilities.routing";
import { FieldErrorDisplayComponent } from "./field-error-display/field-error-display.component";
import { CategoriesComponent } from "./categories/categories.component";
import { RemovewhitespacesPipe } from "app/Pipes/remove_spaces.pipe";
import { CustomersComponent } from "./customers/customers.component";

import { AdminAuthGuardService as AuthGuard } from "../services/auth/admin-auth-guard.service";
import { RequestsComponent } from "./requests/requests.component";
import { OrdersComponent } from "./orders/orders.component";
import { ViewOrderComponent } from "./orders/view-order/view-order.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UtilitiesRoutes),
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PricingsComponent,
    FieldErrorDisplayComponent,
    CategoriesComponent,
    RemovewhitespacesPipe,
    CustomersComponent,
    RequestsComponent,
    OrdersComponent,
    ViewOrderComponent,
  ],
  providers: [AuthGuard],
})
export class UtilitiesModule {}
