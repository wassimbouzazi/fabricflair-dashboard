import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MdModule } from "../md/md.module";
import { MaterialModule } from "../app.module";

import { DashboardRoutes } from "./dashboard.routing";
import { OverviewComponent } from "./overview/overview.component";
import { AdminAuthGuardService as AuthGuard } from "../services/auth/admin-auth-guard.service";
import { BackupComponent } from "./backup/backup.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DashboardRoutes),
    FormsModule,
    MdModule,
    MaterialModule,
  ],
  declarations: [OverviewComponent, BackupComponent],
  providers: [AuthGuard],
})
export class DashboardModule {}
