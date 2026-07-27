import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { DatosDetail } from './components/datos-detail/datos-detail';
import { AdminNewUser } from './components/admin-new-user/admin-new-user';
import { AdminBitacora } from './components/admin-bitacora/admin-bitacora';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'datos/nuevo', component: DatosDetail, data: { modo: 'nuevo' }, canActivate: [authGuard] },
  { path: 'datos/desplegar/:id', component: DatosDetail, data: { modo: 'desplegar' }, canActivate: [authGuard] },
  { path: 'datos/editar/:id', component: DatosDetail, data: { modo: 'editar' }, canActivate: [authGuard] },
  { path: 'admin/nuevo-usuario', component: AdminNewUser, canActivate: [adminGuard] },
  { path: 'admin/bitacora', component: AdminBitacora, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'login' }
];
