export interface DetalleEvento {
  tarifaId: number;
  eventoId: number;
  tarifa: string;
  localidad: string;
  dia: string;
  localidadId: number;
  diaId: number;
  precio: number;
  servicio: number;
  iva: number;
  precioTotal: number;
  vendidos: number;
  reservados: number;
  proceso: number;
  disponibles: number;
  totalTickets: number;
  totalPrecio: number;
  totalServicio: number;
  totalIva: number;
  totalRecaudado: number;
  porcentajeOcupacion: number;
  utilizados: number;
}