import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  usuarioInput = '';
  claveInput = '';
  regUsuario = '';
  regClave = '';

  // signals: se muestran/ocultan solas al cambiar, sin ChangeDetectorRef.
  isRegistering = signal(false);
  error = signal('');

  toggleRegister() {
    this.isRegistering.update(v => !v);
    this.error.set('');
  }

  ingresar() {
    this.error.set('');
    this.auth.login(this.usuarioInput, this.claveInput).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.error.set('Credenciales incorrectas')
    });
  }

  registrar() {
    this.error.set('');
    this.auth.registroBasico(this.regUsuario, this.regClave).subscribe({
      next: () => {
        alert('Usuario registrado. Ahora puedes iniciar sesión.');
        this.isRegistering.set(false);
        this.usuarioInput = this.regUsuario;
        this.claveInput = '';
      },
      // err.error.message trae el mensaje amigable que ahora manda el
      // backend (ej. "Ya existe un usuario llamado ...") en vez de uno genérico.
      error: (err) => this.error.set(err?.error?.message || 'Error al registrar usuario')
    });
  }
}
