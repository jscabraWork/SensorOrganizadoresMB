export class Leyenda {
  id: number | null;
  label: string;
  color: string;
  precio: number; // Nuevo campo

  constructor() {
    this.id = null;
    this.label = '';
    this.color = '';
    this.precio = 0;
  }
}