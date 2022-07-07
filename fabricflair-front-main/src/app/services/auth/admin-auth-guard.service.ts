import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import * as jwt_decode from "jwt-decode";


@Injectable()
export class AdminAuthGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router) {}
  canActivate(): boolean {

    if (!this.auth.isAuthenticated()) {
        console.log("mahouch logged in");
        
      this.router.navigate(['login']);
      return false;

    } else {

        let type = jwt_decode(localStorage.getItem('access_token')).type;
        if (type != "root") {
            this.router.navigate(['dashboard']);
            return false;
        }

        return true;

    }
  }
}