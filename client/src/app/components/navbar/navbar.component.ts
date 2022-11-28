import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from 'src/app/_models/user.model';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private authService: AuthService) { }

  user$!: Observable<UserProfile | null>;

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.user$ = this.authService.currentUser$;
  }

  logout() {
    this.authService.logout();
  }
}
