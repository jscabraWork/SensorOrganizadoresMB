import { Ticket } from "../ticket.model";
import { Estilo } from "./estilo.model";
import { Forma } from "./forma.model";

export class Asiento {
  id: number | null;
  estilo: Estilo | null;
  ticket: Ticket | null;
  margenR: number;
  margenL: number;
  orden: number = 0;
  
  constructor() {
    this.id = null;
    this.estilo = null;
    this.ticket = null;
    this.margenR = 0;
    this.margenL = 0;
  }
}