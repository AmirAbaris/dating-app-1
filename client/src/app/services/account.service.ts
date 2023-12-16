import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { UserLogin } from '../models/account/user-login.model';
import { UserRegister } from '../models/account/user-register.model';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private baseUrl = environment.apiUrl + "account/";

  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  register(userInput: UserRegister): Observable<User | null> {
    return this.http.post<User>(this.baseUrl + 'register', userInput)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setCurrentUser(user);
            return user;
          }
          return null;
        })
      );
  }

  login(userInput: UserLogin): Observable<User | null> {
    return this.http.post<User>(this.baseUrl + 'login', userInput)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setCurrentUser(user);

            this.setGetReturnUrl();

            return user;
          }
          return null;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSource.next(null);
    this.router.navigate(['login'])
  }

  // used in app-component to set currentUserSource from the stored brwoser's localStorage key
  // now user can refresh the page or relaunch the browser without losing authentication or returnUrl
  setCurrentUser(user: User): void {
    localStorage.setItem('token', user.token);

    this.currentUserSource.next(user);
  }

  setGetReturnUrl(): void {
    const returnUrl: string | null = localStorage.getItem('returnUrl');

    returnUrl
      ? this.router.navigate([returnUrl])
      : this.router.navigate(['members']);

    localStorage.removeItem('returnUrl');
  }
}
