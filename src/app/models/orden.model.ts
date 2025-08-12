import { TransaccionesComponent } from "../administradores/transacciones/transacciones.component";
import { Evento } from "./evento.model";

export class Orden {
  id: number

  // 1: ACEPTADA , 2:RECHAZADA, 3: EN PROCESO, 4: DEVOLUCION, 5: FRAUDE 6: UPGRADE
  estado: number;

  // 1: TICKET, 2:TICKET COMPLETO(PALCO), 3: APORTE
  tipo: number;

  evento: Evento;

  valorOrden: number;

  transacciones;

  tickets;

  cliente;

  creationDate:string;

}
