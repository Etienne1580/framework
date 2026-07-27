import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BitacoraEntry, DatosPersona } from '../app.model';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  getDatos(): Observable<DatosPersona[]> {
    return this.http.get<DatosPersona[]>(`${this.apiUrl}/datos`);
  }

  getDatoById(id: number): Observable<DatosPersona> {
    return this.http.get<DatosPersona>(`${this.apiUrl}/datos/${id}`);
  }

  crearDato(dato: Partial<DatosPersona>): Observable<{ success: boolean; idDatos: number }> {
    return this.http.post<{ success: boolean; idDatos: number }>(`${this.apiUrl}/datos`, dato);
  }

  editarDato(id: number, dato: Partial<DatosPersona>): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/datos/${id}`, dato);
  }

  eliminarDato(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/datos/${id}`);
  }

  getBitacora(): Observable<BitacoraEntry[]> {
    return this.http.get<BitacoraEntry[]>(`${this.apiUrl}/bitacora`);
  }

  crearUsuarioAdmin(usuario: { nombre: string; clave: string; privilegios: number }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/admin/usuarios`, usuario);
  }
}
