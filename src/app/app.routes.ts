import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page';
import { AboutUsComponent } from './pages/about-us/about-us';
import { CreatePizzaComponent } from './pages/create-pizza/create-pizza';
import { CheckoutComponent } from './pages/checkout/checkout';
import { OrderTrackerComponent } from './pages/order-tracker/order-tracker';
import { EmployeeComponent } from './pages/employee/employee';
import { AuthComponent } from './pages/auth/auth';
import { OrderHistoryComponent } from './pages/order-history/order-history';
import { FavoritesComponent } from './pages/favorites/favorites';
import { AdminComponent } from './pages/admin/admin';
import { MenuComponent } from './pages/menu/menu';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'create-pizza', component: CreatePizzaComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-tracker', component: OrderTrackerComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'order-history', component: OrderHistoryComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' } // Redirect invalid routes to home page
];
