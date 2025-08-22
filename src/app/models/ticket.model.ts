import { Cliente } from "./cliente.model";
import { Ingreso } from "./ingreso.model";
import { Localidad } from "./localidad.model";
import { Orden } from "./orden.model";
import { Seguro } from "./seguro.model";
import { Servicio } from "./servicio.model";
import { Tarifa } from "./tarifa.model";

export class Ticket {
  id:number;
  // 0: DISPONIBLE, 1: VENDIDO, 2: RESERVADO, 3: EN PROCESO, 4: NO DISPONIBLE
  estado:number;
  // 0: TICKET COMPLETO, 1: TICKET MASTER DE PALCOS INDIVIDUALES
  tipo:number;
  numero: String;
  ordenes: Orden[];
  servicios: Servicio[];
  asientos: Ticket[];  // Relación Master-Slave: Master
  palco: Ticket | null;      // Relación Master-Slave: Slave reference to Master
  cliente: Cliente | null;
  ingresos: Ingreso[] | []; 
  seguro: Seguro | null;
  tarifa?: Tarifa;
  localidad: Localidad | null;
  personasPorTicket: number
  }
