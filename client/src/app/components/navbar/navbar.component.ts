import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AccountService } from 'src/app/services/account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  basePhotoUrl = environment.apiPhotoUrl;

  constructor(public accountService: AccountService) { }

  user$!: Observable<User | null>;

  links = ['members', 'lists', 'messages'];

  ngOnInit(): void {
    this.user$ = this.accountService.currentUser$;
  }

  logout() {
    this.accountService.logout();
  }
}
