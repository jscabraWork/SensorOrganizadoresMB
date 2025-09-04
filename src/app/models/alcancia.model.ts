import { Cliente } from './cliente.model';
import { Ticket } from './ticket.model';

export class Alcancia {
  id: number;
  creationDate:string;
  precioParcialPagado: number;
  precioTotal: number;
  activa: boolean;
  cliente?: Cliente;
  tickets?: Ticket[];
  estado:number;

  //ATRIBUTOS AUXILIARES
  evento?: string;
  localidad?: string;
}