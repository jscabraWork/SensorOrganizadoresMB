export class Estilo {
  id: number | null;
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
  color: string;
  backgroundColor: string;
  borderRadius: number | null;
  fontSize: number | null;
  rotation: number | null;
  borderColor: string;
  borderWidth: number | null;
  zIndex: number | null;

  constructor() {
    this.id = null;
    this.width = null;
    this.height = null;
    this.positionX = null;
    this.positionY = null;
    this.color = '';
    this.backgroundColor = '#0080ff'; // color visible por defecto
    this.borderRadius = null;
    this.fontSize = null;
    this.rotation = null;
    this.borderColor = '#222'; // borde visible por defecto
    this.borderWidth = 2; // grosor visible por defecto
    this.zIndex = null;
  }
}