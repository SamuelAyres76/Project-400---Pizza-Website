import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { About } from './pages/about/about';
import { CreateComponent } from './pages/create/create';
import { CheckoutComponent } from './pages/checkout/checkout';
import { TrackerComponent } from './pages/tracker/tracker';
import { EmployeeComponent } from './pages/employee/employee';
import { BrowseComponent } from './pages/browse/browse';
import { EmployeeLoginComponent } from './pages/employee-login/employee-login';
import { employeeAuthGuard } from './guards/employee-auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: About },
  { path: 'create', component: CreateComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'tracker', component: TrackerComponent },
  { path: 'employee-login', component: EmployeeLoginComponent },
  { path: 'employee', component: EmployeeComponent, canActivate: [employeeAuthGuard] },
  { path: 'browse', component: BrowseComponent },
  { path: '**', redirectTo: '' }
];
