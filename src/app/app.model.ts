export interface Usuario {
  idUsuarios: number;
  nombreUsuarios: string;
  claveUsuarios?: string;
  privilegiosUsuarios: number;
}

export interface DatosPersona {
  idDatos: number;
  nombreDatos: string;
  edadDatos: number;
  sexoDatos: number;
  fechaNacimientoDatos: string;
  correoDatos: string;
}

export interface BitacoraEntry {
  idBitacora: number;
  fechaHoraBitacora: string;
  soBitacora: string;
  nombreUsuarios: string;
}

export enum Privilegios {
  NUEVO = 1,
  DESPLEGAR = 2,
  EDITAR = 4,
  ELIMINAR = 8,
  ADMIN = 16
}
