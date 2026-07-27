import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { BitacoraEntry } from '../../app.model';

@Component({
  selector: 'app-admin-bitacora',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-bitacora.html'
})
export class AdminBitacora implements OnInit {
  private api = inject(Api);
  registros = signal<BitacoraEntry[]>([]);

  ngOnInit() {
    this.api.getBitacora().subscribe({
      next: (data) => this.registros.set(data),
      error: (err) => console.error('Error obteniendo bitácora', err)
    });
  }
}
