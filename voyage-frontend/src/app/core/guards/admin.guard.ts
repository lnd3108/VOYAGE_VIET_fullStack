import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  if (authService.hasRole('STAFF')) {
    if (state.url === '/admin' || state.url === '/admin/') {
      router.navigateByUrl('/admin/categories');
      return false;
    }

    if (state.url.startsWith('/admin/categories') || state.url.startsWith('/admin/destinations')) {
      return true;
    }
  }

  router.navigateByUrl('/');
  return false;
};
