import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  // Do not add header if it's external or auth requests that shouldn't have it
  const isApiRequest = req.url.includes('/api/v1');
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  let authReq = req;
  if (accessToken && isApiRequest && !isAuthRequest) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isApiRequest &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh')
      ) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenPair: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenPair.accessToken);
        return next(req.clone({
          headers: req.headers.set('Authorization', `Bearer ${tokenPair.accessToken}`)
        }));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logoutAndRedirect();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((jwt) => {
        return next(req.clone({
          headers: req.headers.set('Authorization', `Bearer ${jwt}`)
        }));
      })
    );
  }
}
