import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { DatosPersona, Privilegios } from '../../app.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private api = inject(Api);
  private auth = inject(Auth);
  private router = inject(Router);

  // signal en vez de propiedad normal: se actualiza sola en pantalla al
  // llegar la respuesta HTTP, sin necesitar ChangeDetectorRef (Angular 21
  // es zoneless por defecto; los signals son la forma nativa de avisarle
  // a Angular que algo cambió).
  datos = signal<DatosPersona[]>([]);
  selectedId: number | null = null;
  nombreUsuario = '';

  puedeNuevo = false;
  puedeDesplegar = false;
  puedeEditar = false;
  puedeEliminar = false;
  esAdmin = false;

  ngOnInit() {
    const usuario = this.auth.currentUser();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.nombreUsuario = usuario.nombreUsuarios;
    this.puedeNuevo = this.auth.hasPrivilege(Privilegios.NUEVO);
    this.puedeDesplegar = this.auth.hasPrivilege(Privilegios.DESPLEGAR);
    this.puedeEditar = this.auth.hasPrivilege(Privilegios.EDITAR);
    this.puedeEliminar = this.auth.hasPrivilege(Privilegios.ELIMINAR);
    this.esAdmin = this.auth.hasPrivilege(Privilegios.ADMIN);

    this.api.getDatos().subscribe({
      next: (data) => this.datos.set(data),
      error: (err) => console.error('Error al cargar datos', err)
    });
  }

  seleccionar(id: number) {
    this.selectedId = id;
  }

  eliminar() {
    if (this.selectedId && confirm('¿Estás seguro de eliminar este registro?')) {
      this.api.eliminarDato(this.selectedId).subscribe(() => {
        this.datos.update(arr => arr.filter(d => d.idDatos !== this.selectedId));
        this.selectedId = null;
      });
    }
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
