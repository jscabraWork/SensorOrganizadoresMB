import { Generic } from "../service/commons/generic.model";
import { Orden } from "./orden.model";

export enum MetodoPago {
  TARJETA_CREDITO = 1,
  PSE = 2,
  DATAFONO = 3,
  EFECTIVO = 4,
  TRANSFERENCIA = 5,
  TOKEN_TARJETA = 6
}

export enum StatusTransaccion {
  APROBADA = 34,
  EN_PROCESO = 35,
  RECHAZADA = 36,
  DEVOLUCION = 4,
  FRAUDE = 5,
  ASIGNACION = 7,
  UPGRADE = 8
}

export class Transaccion implements Generic{
  id: number;
  amount: number;
  email: string;
  fullName: string;
  idPersona: string;
  idPasarela?: string;
  ip?: string;
  metodo: MetodoPago;
  metodoNombre?: string;
  phone: string;
  status: StatusTransaccion;
  idBasePasarela?: string;
  orden: Orden;
  creationDate?: Date;
}