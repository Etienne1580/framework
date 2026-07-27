import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Privilegios } from '../app.model';

// Permite el paso solo si hay una sesión activa (currentUser). Protege
// /dashboard y las rutas de datos de que se llegue a ellas escribiendo
// la URL directamente sin haber iniciado sesión.
export const authGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

// Igual que authGuard, pero además exige el bit ADMIN. Protege las rutas
// /admin/* para que un usuario sin ese privilegio no pueda entrar solo
// por conocer la URL (los botones deshabilitados en el dashboard nunca
// fueron una protección real, solo ocultaban el enlace).
export const adminGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.hasPrivilege(Privilegios.ADMIN)) {
    return true;
  }
  router.navigate(authService.currentUser() ? ['/dashboard'] : ['/login']);
  return false;
};
