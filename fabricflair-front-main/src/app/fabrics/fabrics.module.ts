import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MdModule } from "../md/md.module";
import { MaterialModule } from "../app.module";

import { FabricsComponent } from "./fabrics.component";
import { FabricsRoutes } from "./fabrics.routing";
import { AddFabricComponent } from "./addfabric/addfabric.component";
import { TagInputModule } from "ngx-chips";
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
  MatSelectModule,
} from "@angular/material";
import { HttpClientModule } from "@angular/common/http";
import { FieldErrorDisplayComponent } from "./field-error-display/field-error-display.component";
import { EditFabricComponent } from "./editfabric/editfabric.component";
import { ViewFabricComponent } from "./viewfabric/viewfabric.component";
import { GenerateFabricsComponent } from "./generatefabrics/generatefabrics.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";

import { ColorChromeModule } from "ngx-color/chrome"; //

import { AuthGuardService as AuthGuard } from "../services/auth/auth-guard.service";

import { AdminAuthGuardService as AdminAuthGuard } from "../services/auth/admin-auth-guard.service";

import { ViewimagesComponent } from "./viewimages/viewimages.component";
import { FabricFilterPipe } from "app/Pipes/fabricfilter.pipe";

import { NgxPaginationModule } from "ngx-pagination";

import { OrderFabricComponent } from "./orderfabric/orderfabric.component";
import { CartComponent } from "./cart/cart.component";
import { StripePaymentComponent } from "./stripe-payment/stripe-payment.component";
import { UserOrdersComponent } from "./user-orders/user-orders.component";
import { UserFabricsInfoComponent } from "./user-fabrics-info/user-fabrics-info.component";

@NgModule({
  imports: [
    AngularMultiSelectModule,
    ColorChromeModule,
    CommonModule,
    RouterModule.forChild(FabricsRoutes),
    ReactiveFormsModule,
    MdModule,
    MaterialModule,
    TagInputModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatProgressBarModule,
    MatSelectModule,
    NgxPaginationModule,
  ],
  declarations: [
    FabricsComponent,
    AddFabricComponent,
    FieldErrorDisplayComponent,
    EditFabricComponent,
    ViewFabricComponent,
    ViewimagesComponent,
    GenerateFabricsComponent,
    OrderFabricComponent,
    CartComponent,
    StripePaymentComponent,
    UserOrdersComponent,
    UserFabricsInfoComponent,
    FabricFilterPipe,
  ],
  providers: [
    AuthGuard,
    AdminAuthGuard,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
})
export class FabricsModule {}
