import { Localidad } from "../localidad.model";
import { Estilo } from "./estilo.model";

export class Forma {
  id: number | null;
  tipo: number | null;
  localidades: Localidad[];
  estilo: Estilo | null;
  type?: string;
  texto: string;

  constructor() {
    this.id = null;
    this.tipo = null;
    this.localidades = [];
    this.type = 'forma';
    this.estilo = new Estilo();
    this.estilo.backgroundColor = '#0080ff';
    this.texto = '';
  }
}