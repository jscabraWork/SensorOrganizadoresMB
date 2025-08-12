import { Evento } from "./evento.model";

export class Temporada {
    id: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    estado: number;
    eventos: Evento[] = [];             
  }