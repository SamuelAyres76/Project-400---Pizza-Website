import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { About } from './pages/about/about';
import { CreateComponent } from './pages/create/create';
import { CheckoutComponent } from './pages/checkout/checkout';
import { TrackerComponent } from './pages/tracker/tracker';
import { EmployeeComponent } from './pages/employee/employee';
import { AuthComponent } from './pages/auth/auth';
import { HistoryComponent } from './pages/history/history';
import { SavedComponent } from './pages/saved/saved';
import { AdminComponent } from './pages/admin/admin';
import { BrowseComponent } from './pages/browse/browse';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: About },
  { path: 'create', component: CreateComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'tracker', component: TrackerComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'saved', component: SavedComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' } // Redirect invalid routes to home page
];
