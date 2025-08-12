import { Asiento } from "./asiento.model";
import { Estilo } from "./estilo.model";

export class Fila {
  id: number | null;
  asientos: Asiento[];
  estilo: Estilo | null;

  // Propiedades específicas de fila
  separacion: number = 0;

  //puede ser positiva o negativa positiva es hacia abajo y negativa hacia arriba
  curvatura: number = 0;

  constructor() {
    this.id = null;
    this.asientos = [];
    this.estilo = null;
  }
}