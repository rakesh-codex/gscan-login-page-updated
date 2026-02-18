import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated() && auth.isAdmin()) return true;
  router.navigate(['/']);
  return false;
};

export const merchantGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated() && auth.isMerchant()) return true;
  const subdomain = route.paramMap.get('subdomain') ?? '';
  router.navigate([`/${subdomain}/login`]);
  return false;
};
