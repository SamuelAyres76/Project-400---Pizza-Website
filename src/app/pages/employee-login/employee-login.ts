import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeAuthService } from '../../services/employee-auth.service';

@Component({
  selector: 'app-employee-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-login.html',
  styleUrl: './employee-login.css'
})
export class EmployeeLoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: EmployeeAuthService,
    private router: Router
  ) {}

  submit(): void {
    this.errorMessage = '';

    const success = this.authService.login(this.username, this.password);
    if (!success) {
      this.errorMessage = 'Invalid username or password.';
      return;
    }

    this.router.navigate(['/employee']);
  }
}
