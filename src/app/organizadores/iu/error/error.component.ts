import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  imports: [CommonModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {
  @Input() mensaje: string = 'Ha ocurrido un error';
  @Input() mostrarBotonReintentar: boolean = true;
  @Input() textoBoton: string = 'Reintentar';
  @Input() icono: string = '⚠️';
  @Input() tipo: 'error' | 'warning' | 'info' = 'error';
  
  @Output() reintentar = new EventEmitter<void>();

  onReintentar(): void {
    this.reintentar.emit();
  }

  getClaseTipo(): string {
    return `error-${this.tipo}`;
  }
}