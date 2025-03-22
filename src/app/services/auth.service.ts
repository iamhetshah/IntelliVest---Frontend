import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, tap, of, throwError } from 'rxjs';
import backendApis from '../app.constants';
import { RegisterRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'authToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    this.validateToken(); // Validate token on startup
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private validateToken() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.http.get(backendApis.auth.verify_token).subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);

          if (err.status === 401) {
            this.logout();
          }
        },
      });
    }
  }

  login(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticatedSubject.next(true);
    this.router.navigate(['/dashboard']);
  }

  register(data: RegisterRequest) {
    this.http
      .post<{ token: string }>(backendApis.auth.register, data)
      .subscribe({
        next: (res) => {
          localStorage.setItem(this.tokenKey, res.token);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/dashboard']);
          this;
        },
      });
  }

  loginFromForm(username: string, password: string) {
    return this.http
      .post<{ token: string }>(backendApis.auth.login, {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/dashboard']);
        }),
        catchError((error) => {
          console.error('Login failed', error);
          return throwError(() => error);
        })
      )
      .subscribe();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
