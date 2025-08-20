import { Ticket } from "../../../../models/ticket.model";

export interface Historial {
  ordenId: number;
  eventoId: number;
  tarifa: string;
  dia: string;
  localidad: string;
  fecha: string; // Usa string para fechas (ISO) o Date si lo prefieres
  valorOrden: number;
  monto: number;
  tipo: number;
  tipoNombre: string;
  metodo: string;
  correo: string;
  nombre: string;
  telefono: string;
  documento: string;
  estado: number;
  status: number;
  promotor: string;
  promotorNumeroDocumento: string;
  tarifaId: number;
  localidadId: number;
  diaId: number;
  cantidad: number;
  alcanciaId: number;
  precioTotal: number;
  precioParcialPagado: number;
}


export interface HistorialDTO {
  venta: Historial[];
  tickets: Ticket[];
}