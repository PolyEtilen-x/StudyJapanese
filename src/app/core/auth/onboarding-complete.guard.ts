import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Chặn truy cập Dashboard/Học tập nếu học viên chưa hoàn thành Onboarding
 */
export const onboardingCompleteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Nếu chưa hoàn tất onboarding -> Chuyển hướng sang trang nhập môn
  if (!user.profile?.onboardingCompleted) {
    router.navigate(['/onboarding']);
    return false;
  }

  return true;
};

/**
 * Ngăn chặn truy cập lại trang Onboarding nếu đã hoàn thành rồi
 */
export const onboardingInProgressGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();

  if (!user) {
    return true; // Cho phép đi tiếp, authGuard chính sẽ bắt sau
  }

  // Nếu đã hoàn tất onboarding -> Chuyển hướng về Dashboard
  if (user.profile?.onboardingCompleted) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
