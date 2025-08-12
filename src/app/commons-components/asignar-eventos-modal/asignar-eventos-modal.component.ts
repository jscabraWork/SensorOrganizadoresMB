import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-asignar-eventos-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './asignar-eventos-modal.component.html',
  styleUrl: './asignar-eventos-modal.component.scss'
})
export class AsignarEventosModalComponent {

  @Input() visible: boolean = false;
  @Input() entidadSeleccionada: any = null;
  @Input() eventosDisponibles: Evento[] = [];
  @Input() eventosSeleccionados: number[] = [];
  @Input() cargandoEventos: boolean = false;
  @Input() asignandoEventos: boolean = false;
  @Input() tituloModal: string = 'Asignar Eventos';
  @Input() nombreEntidad: string = 'entidad';
  @Output() cerrar = new EventEmitter<void>();
  @Output() asignar = new EventEmitter<void>();
  @Output() toggleEvento = new EventEmitter<number>();
  @Output() toggleTodos = new EventEmitter<void>();

  filtroNombreEvento: string = '';

  /**
   * Verifica si un evento está seleccionado
   */
  isEventoSeleccionado(eventoId: number): boolean {
    return this.eventosSeleccionados.includes(eventoId);
  }

  /**
   * Verifica si todos los eventos están seleccionados
   */
  get todosSelecionados(): boolean {
    return this.eventosSeleccionados.length === this.eventosDisponibles.length && this.eventosDisponibles.length > 0;
  }

  /**
   * Emite el evento para cerrar el modal
   */
  onCerrar(): void {
    this.cerrar.emit();
  }

  /**
   * Emite el evento para asignar eventos
   */
  onAsignar(): void {
    this.asignar.emit();
  }

  /**
   * Emite el evento para alternar selección de un evento
   */
  onToggleEvento(eventoId: number): void {
    this.toggleEvento.emit(eventoId);
  }

  /**
   * Emite el evento para alternar todos los eventos
   */
  onToggleTodos(): void {
    this.toggleTodos.emit();
  }

  /**
   * Maneja el clic en el overlay para cerrar el modal
   */
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCerrar();
    }
  }

  getEventosFiltrados(): Evento[] {
    if (!this.filtroNombreEvento || !this.eventosDisponibles) return this.eventosDisponibles;
    const filtro = this.filtroNombreEvento.toLowerCase();
    return this.eventosDisponibles.filter(e => e.nombre && e.nombre.toLowerCase().includes(filtro));
  }
}
