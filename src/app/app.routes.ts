import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { About } from './pages/about/about';
import { CreateComponent } from './pages/create/create';
import { CheckoutComponent } from './pages/checkout/checkout';
import { TrackerComponent } from './pages/tracker/tracker';
import { EmployeeComponent } from './pages/employee/employee';
import { BrowseComponent } from './pages/browse/browse';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: About },
  { path: 'create', component: CreateComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'tracker', component: TrackerComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'browse', component: BrowseComponent },
  { path: '**', redirectTo: '' }
];
