import { inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

export function useLoginMutation() {
  const authService = inject(AuthService);
  const router = inject(Router);
  const route = inject(ActivatedRoute);

  return injectMutation(() => ({
    mutationFn: (variables: { email: string; password: string }) =>
      firstValueFrom(authService.login(variables.email, variables.password)),
    onSuccess: () => {
      const returnUrl = route.snapshot.queryParams['returnUrl'] || '/dashboard';
      router.navigateByUrl(returnUrl);
    }
  }));
}

export function useRegisterMutation() {
  const authService = inject(AuthService);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: (variables: { email: string; password: string; displayName: string }) =>
      firstValueFrom(authService.register(variables.email, variables.password, variables.displayName)),
    onSuccess: () => {
      router.navigate(['/dashboard']);
    }
  }));
}

export function useForgotPasswordMutation() {
  const authService = inject(AuthService);

  return injectMutation(() => ({
    mutationFn: (email: string) => firstValueFrom(authService.forgotPassword(email))
  }));
}

export function useResetPasswordMutation() {
  const authService = inject(AuthService);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: (variables: { token: string; newPassword: string }) =>
      firstValueFrom(authService.resetPassword(variables.token, variables.newPassword)),
    onSuccess: () => {
      router.navigate(['/login']);
    }
  }));
}

export function useRequestVerificationMutation() {
  const authService = inject(AuthService);

  return injectMutation(() => ({
    mutationFn: (email: string) => firstValueFrom(authService.requestEmailVerification(email))
  }));
}

export function useVerifyEmailMutation() {
  const authService = inject(AuthService);

  return injectMutation(() => ({
    mutationFn: (token: string) => firstValueFrom(authService.verifyEmail(token))
  }));
}

export function useLogoutMutation() {
  const authService = inject(AuthService);
  return injectMutation(() => ({
    mutationFn: () => firstValueFrom(authService.logout())
  }));
}
