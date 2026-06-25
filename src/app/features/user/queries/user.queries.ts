import { inject } from '@angular/core';
import { injectQuery, injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { UserService, UpdateProfileDto } from '../../../core/user/user.service';
import { AuthService } from '../../../core/auth/auth.service';

export function useUserStatsQuery() {
  const userService = inject(UserService);
  return injectQuery(() => ({
    queryKey: ['user-stats'],
    queryFn: () => firstValueFrom(userService.getStats()).then(res => res.data)
  }));
}

export function useUserSubscriptionQuery() {
  const userService = inject(UserService);
  return injectQuery(() => ({
    queryKey: ['user-subscription'],
    queryFn: () => firstValueFrom(userService.getSubscription()).then(res => res.data)
  }));
}

export function useUpdateProfileMutation() {
  const userService = inject(UserService);
  const authService = inject(AuthService);
  const queryClient = injectQueryClient();

  return injectMutation(() => ({
    mutationFn: (variables: UpdateProfileDto) =>
      firstValueFrom(userService.updateProfile(variables)).then(res => res.data),
    onSuccess: (updatedProfile) => {
      // Sync local auth user object
      const user = authService.currentUser();
      if (user) {
        authService.currentUser.set({
          ...user,
          profile: {
            ...user.profile,
            ...updatedProfile
          }
        });
      }
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    }
  }));
}

export function useUpdateIndustryTrackMutation() {
  const userService = inject(UserService);
  const authService = inject(AuthService);
  const queryClient = injectQueryClient();

  return injectMutation(() => ({
    mutationFn: (industryTrack: string) =>
      firstValueFrom(userService.updateIndustryTrack(industryTrack)).then(res => res.data),
    onSuccess: (updatedProfile) => {
      // Sync local auth user object
      const user = authService.currentUser();
      if (user) {
        authService.currentUser.set({
          ...user,
          profile: {
            ...user.profile,
            ...updatedProfile
          }
        });
      }
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    }
  }));
}
