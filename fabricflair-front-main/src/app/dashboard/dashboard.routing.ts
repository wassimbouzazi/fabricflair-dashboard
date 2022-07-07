import { Routes } from "@angular/router";
import { AdminAuthGuardService as AdminAuthGuard } from "../services/auth/admin-auth-guard.service";
import { BackupComponent } from "./backup/backup.component";
import { OverviewComponent } from "./overview/overview.component";

export const DashboardRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: OverviewComponent,
        canActivate: [AdminAuthGuard],
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "backup",
        component: BackupComponent,
        canActivate: [AdminAuthGuard],
      },
    ],
  },
];
