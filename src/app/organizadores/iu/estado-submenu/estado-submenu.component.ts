import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OpcionEstado {
  value: number;
  label: string;
}

@Component({
  selector: 'app-estado-submenu',
  imports: [CommonModule],
  templateUrl: './estado-submenu.component.html',
  styleUrl: './estado-submenu.component.scss'
})
export class EstadoSubmenuComponent {
  @Input() opciones: OpcionEstado[] = [];
  @Input() estadoSeleccionado: number = 34;
  @Output() cambioEstado = new EventEmitter<number>();

  onCambiarEstado(estado: number) {
    this.cambioEstado.emit(estado);
  }
}