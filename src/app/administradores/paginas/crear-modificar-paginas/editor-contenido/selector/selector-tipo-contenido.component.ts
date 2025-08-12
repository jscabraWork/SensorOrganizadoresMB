import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selector-tipo-contenido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-tipo-contenido.component.html',
  styleUrls: ['./selector-tipo-contenido.component.scss']
})
export class SelectorTipoContenidoComponent {
  @Output() tipoSeleccionado = new EventEmitter<number>();

  tiposContenido = [
    { valor: 0, etiqueta: 'Imagen', icono: '' },
    { valor: 1, etiqueta: 'Video', icono: '' },
    { valor: 2, etiqueta: 'Texto', icono: '' },
    { valor: 3, etiqueta: 'Enlace', icono: '' }
  ];

  seleccionarTipo(tipo: number): void {
    this.tipoSeleccionado.emit(tipo);
  }
}