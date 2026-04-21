import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EmployeeAuthService } from '../services/employee-auth.service';

export const employeeAuthGuard: CanActivateFn = () => {
  const authService = inject(EmployeeAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/employee-login']);
};
