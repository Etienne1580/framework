import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Usuario } from '../app.model';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';
  currentUser = signal<Usuario | null>(null);

  constructor() {
    const stored = localStorage.getItem('usuario');
    if (stored) this.currentUser.set(JSON.parse(stored));
  }

  login(nombre: string, clave: string) {
    return this.http.post<{ success: boolean; usuario: Usuario }>(`${this.apiUrl}/login`, { nombre, clave })
      .pipe(tap(res => {
        if (res.success) {
          this.currentUser.set(res.usuario);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
        }
      }));
  }

  registroBasico(nombre: string, clave: string) {
    return this.http.post(`${this.apiUrl}/registro`, { nombre, clave });
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('usuario');
  }

  hasPrivilege(bit: number): boolean {
    const user = this.currentUser();
    return user ? (user.privilegiosUsuarios & bit) === bit : false;
  }
}
