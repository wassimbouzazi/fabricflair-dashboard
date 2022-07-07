import { Routes } from "@angular/router";

import { MedleyComponent } from "./medley.component";
import { AuthGuardService as AuthGuard } from "../services/auth/auth-guard.service";
import { CreateMedleyComponent } from "./createmedley/createmedley.component";
export const MedleyRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "medley",
        component: MedleyComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "medley/createmedley",
        component: CreateMedleyComponent,
      },
    ],
  },
];
