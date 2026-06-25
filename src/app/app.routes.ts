import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { onboardingCompleteGuard, onboardingInProgressGuard } from './core/auth/onboarding-complete.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/components/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/components/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/components/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then(
        (m) => m.OnboardingComponent
      ),
    canActivate: [authGuard, onboardingInProgressGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard, onboardingCompleteGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/user/pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard, onboardingCompleteGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/user/pages/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
    canActivate: [authGuard, onboardingCompleteGuard],
  },
  {
    path: 'learn/kana',
    loadComponent: () =>
      import('./features/learn/kana/kana.component').then(
        (m) => m.KanaComponent
      ),
    canActivate: [authGuard, onboardingCompleteGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
