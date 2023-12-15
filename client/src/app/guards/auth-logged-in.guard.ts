import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthLoggedInGuard {
  constructor(private accountService: AccountService, private router: Router, private matSnack: MatSnackBar) { }
 
  //TODO upgrade guards
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.accountService.currentUser$.pipe(
      map((user: User | null | boolean) => {
        if (user) {
          this.router.navigate(['/users']);
          this.matSnack.open('You are already logged in', 'Close', { horizontalPosition: 'center', duration: 7000 })
          return false;
        }
        return true;
      })
    );
  }
}
