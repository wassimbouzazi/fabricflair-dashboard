import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MdModule } from "../md/md.module";
import { MaterialModule } from "../app.module";

import { DesignsComponent } from "./designs.component";
import { DesignsRoutes } from "./designs.routing";
import { TagInputModule } from "ngx-chips";
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
  MatSelectModule,
} from "@angular/material";
import { HttpClientModule } from "@angular/common/http";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { NgSelectModule } from "@ng-select/ng-select";

import { ColorChromeModule } from "ngx-color/chrome"; //

import { AuthGuardService as AuthGuard } from "../services/auth/auth-guard.service";
import { AddDesignComponent } from "./adddesign/adddesign.component";
import { FieldErrorDisplayComponent } from "app/designs/field-error-display/field-error-display.component";
import { ViewOnFabricDesign } from "./view-on-fabric/view-on-fabric.component";
import { DesignFilterPipe } from "app/Pipes/designfilter.pipe";
import { DesignOverFabricFilter } from "app/Pipes/designoverfabric.pipe";

@NgModule({
  imports: [
    NgSelectModule,
    ColorChromeModule,
    CommonModule,
    RouterModule.forChild(DesignsRoutes),
    ReactiveFormsModule,
    MdModule,
    MaterialModule,
    TagInputModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  declarations: [
    DesignsComponent,
    AddDesignComponent,
    FieldErrorDisplayComponent,
    ViewOnFabricDesign,
    DesignFilterPipe,
    DesignOverFabricFilter,
  ],
  providers: [
    AuthGuard,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
})
export class DesignsModule {}
