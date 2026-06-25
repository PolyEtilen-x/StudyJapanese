import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

const TIER_WEIGHTS: Record<string, number> = {
  FREE: 0,
  STANDARD: 1,
  PREMIUM: 2,
  ENTERPRISE: 3,
};

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredTier = route.data['requiredTier'] as string;
  if (!requiredTier) {
    return true;
  }

  const user = authService.currentUser();
  if (!user) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const userTier = user.tier || 'FREE';
  const userWeight = TIER_WEIGHTS[userTier] ?? 0;
  const requiredWeight = TIER_WEIGHTS[requiredTier] ?? 0;

  if (userWeight >= requiredWeight) {
    return true;
  }

  // User has insufficient tier level, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};
