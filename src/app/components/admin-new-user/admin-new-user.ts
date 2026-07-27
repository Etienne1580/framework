import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { Privilegios } from '../../app.model';

@Component({
  selector: 'app-admin-new-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-new-user.html'
})
export class AdminNewUser {
  private api = inject(Api);
  private router = inject(Router);

  nombre = '';
  clave = '';
  c_nuevo = false;
  c_desplegar = false;
  c_editar = false;
  c_eliminar = false;
  c_admin = false;
  error = signal('');

  guardarUsuario() {
    this.error.set('');
    let privilegios = 0;
    if (this.c_nuevo) privilegios |= Privilegios.NUEVO;
    if (this.c_desplegar) privilegios |= Privilegios.DESPLEGAR;
    if (this.c_editar) privilegios |= Privilegios.EDITAR;
    if (this.c_eliminar) privilegios |= Privilegios.ELIMINAR;
    if (this.c_admin) privilegios |= Privilegios.ADMIN;

    this.api.crearUsuarioAdmin({ nombre: this.nombre, clave: this.clave, privilegios }).subscribe({
      next: () => {
        alert('Usuario almacenado correctamente.');
        this.router.navigate(['/dashboard']);
      },
      // Antes solo hacía console.error: si el nombre ya existía, la
      // pantalla no decía nada y parecía que sí se había guardado.
      error: (err) => this.error.set(err?.error?.message || 'No se pudo crear el usuario.')
    });
  }
}
