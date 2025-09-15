import { Alcancia } from './alcancia.model';
import { Ticket } from './ticket.model';

export class MisAlcanciasDto {
  alcancia: Alcancia;
  tickets: Ticket[];
  eventoId: number;
  eventoNombre: string;
  imagen: string;
  localidad: string;
  aporteMinimo: number;

  constructor() {
    this.alcancia = new Alcancia();
    this.tickets = [];
    this.eventoId = 0;
    this.eventoNombre = '';
    this.imagen = '';
    this.localidad = '';
    this.aporteMinimo = 0;
  }
}