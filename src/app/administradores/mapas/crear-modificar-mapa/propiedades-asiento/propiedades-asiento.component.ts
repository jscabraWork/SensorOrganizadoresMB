import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Asiento } from '../../../../models/mapas/asiento.model';
import { Estilo } from '../../../../models/mapas/estilo.model';
import { Forma } from '../../../../models/mapas/forma.model';

@Component({
  selector: 'app-propiedades-asiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './propiedades-asiento.component.html',
  styleUrls: ['./propiedades-asiento.component.scss']
})
export class PropiedadesAsientoComponent {
  @Input() asiento!: Asiento;
  @Input() estilosDisponibles: Estilo[] = [];
  @Input() formasDisponibles: Forma[] = [];
  @Output() asientoChange = new EventEmitter<Asiento>();
  @Output() eliminar = new EventEmitter<void>();

  onAsientoChange() {
    this.asientoChange.emit(this.asiento);
  }

  eliminarAsiento() {
    this.eliminar.emit();
  }
  onEstiloChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const estiloId = +target.value;
    const estiloSeleccionado = this.estilosDisponibles.find(e => e.id === estiloId);
    if (estiloSeleccionado) {
      this.asiento.estilo = estiloSeleccionado;
      this.onAsientoChange();
    } else {
      this.asiento.estilo = null;
      this.onAsientoChange();
    }
  }

  onFormaChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const formaId = +target.value;
    const formaSeleccionada = this.formasDisponibles.find(f => f.id === formaId);
    if (formaSeleccionada) {
      this.onAsientoChange();
    } else {
      this.onAsientoChange();
    }
  }

  updateStyleProperty(property: string, value: any): void {
    if (!this.asiento.estilo) {
      this.asiento.estilo = new Estilo();
    }
    
    switch (property) {
      case 'width':
        this.asiento.estilo.width = +value;
        break;
      case 'height':
        this.asiento.estilo.height = +value;
        break;
      case 'backgroundColor':
        this.asiento.estilo.backgroundColor = value;
        break;
      case 'borderColor':
        this.asiento.estilo.borderColor = value;
        break;
      case 'borderWidth':
        this.asiento.estilo.borderWidth = +value;
        break;
      case 'borderRadius':
        this.asiento.estilo.borderRadius = +value;
        break;
      case 'color':
        this.asiento.estilo.color = value;
        break;
      case 'fontSize':
        this.asiento.estilo.fontSize = +value;
        break;
    }
    
    this.onAsientoChange();
  }

  // Helper methods para mostrar información del ticket
  getEstadoTicket(estado: number): string {
    switch (estado) {
      case 0: return 'DISPONIBLE';
      case 1: return 'VENDIDO';
      case 2: return 'RESERVADO';
      case 3: return 'EN PROCESO';
      case 4: return 'NO DISPONIBLE';
      default: return 'DESCONOCIDO';
    }
  }

  getTipoTicket(tipo: number): string {
    switch (tipo) {
      case 0: return 'TICKET COMPLETO';
      case 1: return 'TICKET MASTER DE PALCOS';
      default: return 'DESCONOCIDO';
    }
  }
}
