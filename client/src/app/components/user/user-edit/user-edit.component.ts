import { Component, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Subscription, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserUpdate } from '../../../models/user-update.model';
import { Member } from '../../../models/member.model';
import { AccountService } from '../../../services/account.service';
import { PhotoEditorComponent } from '../../user/photo-editor/photo-editor.component';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MemberService } from '../../../services/member.service';
import { UserService } from '../../../services/user.service';
import { IntlModule } from 'angular-ecmascript-intl';
import { ApiResponseMessage } from '../../../models/helpers/api-response-message';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule, NgOptimizedImage, FormsModule, ReactiveFormsModule,
    PhotoEditorComponent,
    MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    IntlModule
  ],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnDestroy {
  private accountService = inject(AccountService);
  private userService = inject(UserService);
  private memberService = inject(MemberService);
  private fb = inject(FormBuilder);
  private matSnak = inject(MatSnackBar);

  apiPhotoUrl = environment.apiPhotoUrl;
  subscribedMember: Subscription | undefined;
  member: Member | undefined;

  readonly minTextAreaChars: number = 10;
  readonly maxTextAreaChars: number = 500;
  readonly minInputChars: number = 3;
  readonly maxInputChars: number = 30;

  ngOnInit(): void {
    this.getMember();
  }

  ngOnDestroy(): void {
    this.subscribedMember?.unsubscribe();
  }

  getMember(): void {
    this.accountService.getLoggedInUser().pipe(take(1)).subscribe(loggedInUser => {
      if (loggedInUser) {
        this.memberService.getMemberByUsername(loggedInUser.userName)?.pipe(take(1)).subscribe(member => {
          if (member) {
            this.member = member;

            this.initContollersValues(member);
          }
        });
      }
    });
  }

  userEditFg: FormGroup = this.fb.group({
    introductionCtrl: ['', [Validators.maxLength(this.maxTextAreaChars)]],
    lookingForCtrl: ['', [Validators.maxLength(this.maxTextAreaChars)]],
    interestsCtrl: ['', [Validators.maxLength(this.maxTextAreaChars)]],
    cityCtrl: ['', [Validators.minLength(this.minInputChars), Validators.maxLength(this.maxInputChars)]],
    countryCtrl: ['', [Validators.minLength(this.minInputChars), Validators.maxLength(this.maxInputChars)]]
  });

  get IntroductionCtrl(): AbstractControl {
    return this.userEditFg.get('introductionCtrl') as FormControl;
  }
  get LookingForCtrl(): AbstractControl {
    return this.userEditFg.get('lookingForCtrl') as FormControl;
  }
  get InterestsCtrl(): AbstractControl {
    return this.userEditFg.get('interestsCtrl') as FormControl;
  }
  get CityCtrl(): AbstractControl {
    return this.userEditFg.get('cityCtrl') as FormControl;
  }
  get CountryCtrl(): AbstractControl {
    return this.userEditFg.get('countryCtrl') as FormControl;
  }

  initContollersValues(member: Member) {
    this.IntroductionCtrl.setValue(member.introduction);
    this.LookingForCtrl.setValue(member.lookingFor);
    this.InterestsCtrl.setValue(member.interests);
    this.CityCtrl.setValue(member.city);
    this.CountryCtrl.setValue(member.country);
  }

  updateUser(member: Member): void {
    if (member) {
      let updatedUser: UserUpdate = {
        username: member.username,
        introduction: this.IntroductionCtrl.value,
        lookingFor: this.LookingForCtrl.value,
        interests: this.InterestsCtrl.value,
        city: this.CityCtrl.value,
        country: this.CountryCtrl.value
      }

      this.userService.updateUser(updatedUser)
        .pipe(take(1))
        .subscribe({
          next: (response: ApiResponseMessage) => {
            if (response.message) {
              this.matSnak.open(response.message, "Close", { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 10000 });
            }
          }
        });

      this.userEditFg.markAsPristine();
    }
  }

  logForm() {
    console.log(this.IntroductionCtrl)
  }
}
