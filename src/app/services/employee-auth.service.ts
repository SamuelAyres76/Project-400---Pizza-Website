import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EMPLOYEE_AUTH_CONFIG } from '../config/auth.config';

@Injectable({
  providedIn: 'root'
})
export class EmployeeAuthService {
  private readonly SESSION_KEY = 'employeeAuthenticated';
  private readonly authState = new BehaviorSubject<boolean>(this.readAuthState());

  authState$ = this.authState.asObservable();

  login(username: string, password: string): boolean {
    const matches =
      username.trim() === EMPLOYEE_AUTH_CONFIG.username &&
      password === EMPLOYEE_AUTH_CONFIG.password;

    if (!matches) {
      return false;
    }

    sessionStorage.setItem(this.SESSION_KEY, 'true');
    this.authState.next(true);
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.authState.next(false);
  }

  isAuthenticated(): boolean {
    return this.authState.value;
  }

  private readAuthState(): boolean {
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  }
}
