import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"; // this is needed!
import { RouterModule } from "@angular/router";
import { HttpModule } from "@angular/http";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from "@angular/material";

import { JwtModule } from "@auth0/angular-jwt";

import { AppComponent } from "./app.component";

import { SidebarModule } from "./sidebar/sidebar.module";
import { FooterModule } from "./shared/footer/footer.module";
import { NavbarModule } from "./shared/navbar/navbar.module";
import { AdminLayoutComponent } from "./layouts/admin/admin-layout.component";
import { LoginComponent } from "./login/login.component";

import { AppRoutes } from "./app.routing";
import { HttpClientModule } from "@angular/common/http";
import { AuthService } from "./services/auth/auth.service";
import { SearchService } from "./services/SearchService.service";
import { DesignSearchService } from "./services/DesignSearchService";
import { RegisterComponent } from "./register/register.component";
import { FieldErrorDisplayComponent } from "./field-error-display/field-error-display.component";
import { MedleyFabricService } from "./services/medley_fabric.service";
import { OrderDataService } from "./services/order_data.service";

export function TokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
})
export class MaterialModule {}

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(AppRoutes, { useHash: true }),
    HttpModule,
    MatNativeDateModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        // ...
        tokenGetter: TokenGetter,
      },
    }),
  ],
  declarations: [
    RegisterComponent,
    FieldErrorDisplayComponent,
    AppComponent,
    AdminLayoutComponent,
    LoginComponent,
  ],
  providers: [
    AuthService,
    SearchService,
    DesignSearchService,
    MedleyFabricService,
    MedleyFabricService,
    OrderDataService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
