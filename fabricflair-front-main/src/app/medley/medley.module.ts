import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MdModule } from "../md/md.module";
import { MaterialModule } from "../app.module";

import { MedleyComponent } from "./medley.component";
import { MedleyRoutes } from "./medley.routing";
import { TagInputModule } from "ngx-chips";
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
  MatSelectModule,
} from "@angular/material";
import { HttpClientModule } from "@angular/common/http";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { NgSelectModule } from "@ng-select/ng-select";
import { MatListModule } from "@angular/material/list";

import { ColorChromeModule } from "ngx-color/chrome"; //

import { DragulaModule } from "ng2-dragula";

import { AuthGuardService as AuthGuard } from "../services/auth/auth-guard.service";
import { CreateMedleyComponent } from "./createmedley/createmedley.component";
import { NgxSortableModule } from "ngx-sortable";
import { MedleyFilterPipe } from "app/Pipes/medley_filter.pipe";

@NgModule({
  imports: [
    NgSelectModule,
    ColorChromeModule,
    CommonModule,
    RouterModule.forChild(MedleyRoutes),
    DragulaModule.forRoot(),
    ReactiveFormsModule,
    MdModule,
    MaterialModule,
    TagInputModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatProgressBarModule,
    MatSelectModule,
    NgxSortableModule,
    MatListModule,
  ],
  declarations: [MedleyComponent, CreateMedleyComponent, MedleyFilterPipe],
  providers: [
    AuthGuard,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
  ],
})
export class MedleyModule {}
