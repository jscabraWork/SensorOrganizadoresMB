import { Ticket } from './ticket.model';

export class MisTicketsDto {
  ticket: Ticket;
  eventoId: number;
  eventoNombre: string;
  imagen: string;
  localidad: string;
  utilizado: boolean;

  constructor() {
    this.ticket = new Ticket();
    this.eventoId = 0;
    this.eventoNombre = '';
    this.imagen = '';
    this.localidad = '';
  }
}