import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { AccountService } from '../../services/account.service';
import { environment } from '../../../environments/environment';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, NgOptimizedImage,
    MatIconModule, MatToolbarModule, MatTabsModule, MatMenuModule,
    MatButtonModule, MatListModule, MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private accountService = inject(AccountService);

  basePhotoUrl = environment.apiPhotoUrl;

  user$!: Observable<User | null>;

  links = ['members', 'lists', 'messages'];

  ngOnInit(): void {
    this.user$ = this.accountService.currentUser$;
  }

  logout() {
    this.accountService.logout();
  }
}
