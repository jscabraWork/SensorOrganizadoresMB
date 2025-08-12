import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Fila } from '../../../../models/mapas/fila.model';
import { Estilo } from '../../../../models/mapas/estilo.model';
import { Asiento } from '../../../../models/mapas/asiento.model';
import { Ticket } from '../../../../models/ticket.model';
import { Evento } from '../../../../models/evento.model';
import { SelectorTicketsComponent } from './selector-tickets/selector-tickets.component';

@Component({
  selector: 'app-propiedades-fila',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorTicketsComponent],
  templateUrl: './propiedades-fila.component.html',
  styleUrls: ['./propiedades-fila.component.scss']
})
export class PropiedadesFilaComponent {
  @Input() fila!: Fila;
  @Input() estilosDisponibles: Estilo[] = [];
  @Input() evento: Evento | null = null;
  @Output() filaChange = new EventEmitter<Fila>();
  @Output() eliminar = new EventEmitter<void>();

  // Control del modal selector de tickets
  mostrarSelectorTickets = false;

  @Input() getEstilosAsiento: (asiento: any, fila?: any) => any;

  constructor(private cdr: ChangeDetectorRef) {}

  onFilaChange() {
    this.filaChange.emit(this.fila);
  }

  eliminarFila() {
    this.eliminar.emit();
  }  onEstiloChange(estiloId: number | null) {
    if (estiloId) {
      const estiloSeleccionado = this.estilosDisponibles.find(e => e.id === estiloId);
      if (estiloSeleccionado) {
        this.fila.estilo = estiloSeleccionado;
        this.actualizarEstilosAsientos();
        this.onFilaChange();
      }
    } else {
      this.fila.estilo = null;
      this.actualizarEstilosAsientos();
      this.onFilaChange();
    }
  }

  /**
   * Actualiza los estilos de todos los asientos para que hereden las propiedades de la fila
   */
  private actualizarEstilosAsientos() {
    if (!this.fila.asientos) return;
    this.fila.asientos.forEach(asiento => {
      // Solo heredar propiedades si el asiento no tiene un estilo propio definido
      if (!asiento.estilo) return;
      if (this.fila.estilo) {
        asiento.estilo.width = this.fila.estilo.width || 40;
        asiento.estilo.height = this.fila.estilo.height || 40;
        asiento.estilo.color = this.fila.estilo.color || '#fff';
        asiento.estilo.borderColor = this.fila.estilo.borderColor || '#333';
        asiento.estilo.borderWidth = this.fila.estilo.borderWidth || 1;
        asiento.estilo.borderRadius = this.fila.estilo.borderRadius || 4;
        asiento.estilo.fontSize = this.fila.estilo.fontSize || 12;
        // No tocar backgroundColor: si el asiento no tiene, hereda de la fila por getEstilosAsiento
      }
    });
  }

  updateStyleProperty(property: string, value: any): void {
    if (!this.fila.estilo) {
      this.fila.estilo = new Estilo();
    }
    
    switch (property) {
      case 'width':
        this.fila.estilo.width = +value;
        break;
      case 'height':
        this.fila.estilo.height = +value;
        break;
      case 'backgroundColor':
        this.fila.estilo.backgroundColor = value;
        break;
      case 'borderColor':
        this.fila.estilo.borderColor = value;
        break;
      case 'borderWidth':
        this.fila.estilo.borderWidth = +value;
        break;
      case 'borderRadius':
        this.fila.estilo.borderRadius = +value;
        break;
      case 'color':
        this.fila.estilo.color = value;
        break;
      case 'fontSize':
        this.fila.estilo.fontSize = +value;
        break;
      case 'rotation':
        this.fila.estilo.rotation = +value;
        break;
    }
    
    // Actualizar estilos de asientos existentes para reflejar los cambios
    this.actualizarEstilosAsientos();
    this.onFilaChange();
    this.cdr.detectChanges(); // Fuerza actualización visual inmediata
  }

  abrirSelectorTickets() {
    if (!this.evento) {
      console.warn('No hay evento seleccionado');
      return;
    }
    this.mostrarSelectorTickets = true;
  }

  cerrarSelectorTickets() {
    this.mostrarSelectorTickets = false;
  }

  onTicketsSeleccionados(tickets: Ticket[]) {
    // Crear asientos basados en los tickets seleccionados
    const nuevosAsientos = tickets.map(ticket => this.crearAsientoDesdeTicket(ticket));
    
    // Agregar los nuevos asientos a la fila
    if (!this.fila.asientos) {
      this.fila.asientos = [];
    }
    
    this.fila.asientos.push(...nuevosAsientos);
    this.onFilaChange();
    this.cerrarSelectorTickets();
  }  private crearAsientoDesdeTicket(ticket: Ticket): Asiento {
    const asiento = new Asiento();
    asiento.id = null; // Se asignará en el backend
    asiento.ticket = ticket;
    asiento.margenR = 5;
    asiento.margenL = 5;
    asiento.orden = this.fila.asientos ? this.fila.asientos.length : 0;
    // No asignar estilo: hereda de la fila por defecto
    asiento.estilo = null;
    // Si quieres que el color de fondo refleje el estado del ticket, puedes usar un campo auxiliar o dejarlo a la lógica de visualización
    return asiento;
  }

  private obtenerColorPorEstado(estado: number): string {
    switch (estado) {
      case 0: return '#28a745'; // Disponible - Verde
      case 1: return '#dc3545'; // Vendido - Rojo
      case 2: return '#ffc107'; // Reservado - Amarillo
      case 3: return '#17a2b8'; // En proceso - Azul
      case 4: return '#6c757d'; // No disponible - Gris
      default: return '#343a40';
    }
  }

  eliminarAsiento(index: number) {
    if (this.fila.asientos && index >= 0 && index < this.fila.asientos.length) {
      this.fila.asientos.splice(index, 1);
      this.onFilaChange();
    }
  }

  eliminarTodosAsientos() {
    if (this.fila.asientos) {
      this.fila.asientos = [];
      this.onFilaChange();
    }
  }

  obtenerNombreEstado(estado: number): string {
    switch (estado) {
      case 0: return 'Disponible';
      case 1: return 'Vendido';
      case 2: return 'Reservado';
      case 3: return 'En Proceso';
      case 4: return 'No Disponible';
      default: return 'Desconocido';
    }
  }
}
