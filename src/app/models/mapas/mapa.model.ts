import { Evento } from "../evento.model";
import { Fila } from "./fila.model";
import { Forma } from "./forma.model";
import { Leyenda } from "./leyenda.model";

export class Mapa {
  id: number | null;
  nombre: string;
  ancho: number;
  alto: number;
  filas: Fila[];
  formas: Forma[];
  leyendas: Leyenda[];
  evento: Evento | null;

  constructor() {
    this.id = null;
    this.nombre = '';
    this.ancho = 800;
    this.alto = 600;
    this.filas = [];
    this.formas = [];
    this.leyendas = [];
    this.evento = null;
  }
}