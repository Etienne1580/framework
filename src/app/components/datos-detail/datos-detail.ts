import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { DatosPersona } from '../../app.model';

@Component({
  selector: 'app-datos-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './datos-detail.html'
})
export class DatosDetail implements OnInit {
  private api = inject(Api);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // "dato" se enlaza con [(ngModel)] campo por campo, así que no puede ser
  // un signal (ngModel necesita una propiedad normal para escribir en ella).
  // Por eso, solo aquí, seguimos necesitando este aviso manual.
  private cdr = inject(ChangeDetectorRef);

  dato: Partial<DatosPersona> = { nombreDatos: '', edadDatos: 0, sexoDatos: 1, fechaNacimientoDatos: '', correoDatos: '' };
  modo = 'nuevo';
  esSoloLectura = false;
  idActual: number | null = null;
  error = signal('');

  ngOnInit() {
    this.modo = (this.route.snapshot.data['modo'] as string) || 'nuevo';
    this.esSoloLectura = this.modo === 'desplegar';
    this.idActual = Number(this.route.snapshot.paramMap.get('id')) || null;

    if (this.idActual && (this.modo === 'desplegar' || this.modo === 'editar')) {
      this.api.getDatoById(this.idActual).subscribe(res => {
        if (res.fechaNacimientoDatos) {
          res.fechaNacimientoDatos = res.fechaNacimientoDatos.split('T')[0];
        }
        this.dato = res;
        this.cdr.markForCheck();
      });
    }
  }

  guardar() {
    this.error.set('');
    const peticion = this.modo === 'nuevo'
      ? this.api.crearDato(this.dato)
      : this.modo === 'editar' && this.idActual
        ? this.api.editarDato(this.idActual, this.dato)
        : null;

    peticion?.subscribe({
      next: () => this.router.navigate(['/dashboard']),
      // Muestra el mensaje real del backend (ej. correo duplicado) en vez
      // de fallar en silencio o solo loguearlo en consola.
      error: (err) => this.error.set(err?.error?.message || 'No se pudo guardar. Intenta de nuevo.')
    });
  }
}
