import { Generic } from '../service/commons/generic.model';

export class Imagen implements Generic {
  public id: number;
  public nombre: string;
  public url: string;
  public creationDate: Date;
  public tipo: number;

  constructor() {
    this.id = 0;
    this.nombre = '';
    this.url = '';
    this.creationDate = new Date();
    this.tipo = 1;
  }
}