import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const snackbar = inject(MatSnackBar);

  if (localStorage.getItem('token'))
    return true;

  localStorage.setItem('returnUrl', state.url);
  router.navigate(['login'], { queryParams: { 'returnUrl': state.url } })

  snackbar.open('Please login first.', 'Close', { horizontalPosition: 'end', duration: 7000 })

  return false;
};
