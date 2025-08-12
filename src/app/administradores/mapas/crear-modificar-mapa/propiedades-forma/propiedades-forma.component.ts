import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Forma } from '../../../../models/mapas/forma.model';
import { Estilo } from '../../../../models/mapas/estilo.model';
import { Localidad } from '../../../../models/localidad.model';

@Component({
  selector: 'app-propiedades-forma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './propiedades-forma.component.html',
  styleUrls: ['./propiedades-forma.component.scss']
})
export class PropiedadesFormaComponent {
  @Input() forma!: Forma;
  @Input() estilosDisponibles: Estilo[] = [];
  @Input() localidadesDisponibles: Localidad[] = [];
  @Output() formaChange = new EventEmitter<Forma>();
  @Output() eliminar = new EventEmitter<void>();

  // Tipos de forma disponibles
  tiposForma = [
    { id: 1, nombre: 'Rectangular' },
    { id: 2, nombre: 'Circular' },
    { id: 3, nombre: 'Óvalo' },
    { id: 4, nombre: 'Triángulo' }
  ];

  onFormaChange() {
    this.formaChange.emit(this.forma);
  }

  eliminarForma() {
    this.eliminar.emit();
  }

  onEstiloChange(estiloId: number | null) {
    if (estiloId) {
      const estiloSeleccionado = this.estilosDisponibles.find(e => e.id === estiloId);
      if (estiloSeleccionado) {
        // Clonar el objeto estilo para evitar referencias compartidas
        this.forma.estilo = { ...estiloSeleccionado };
        this.onFormaChange();
      }
    } else {
      // Crear estilo personalizado
      if (!this.forma.estilo) {
        this.forma.estilo = new Estilo();
      }
      this.onFormaChange();
    }
  }

  updateStyleProperty(property: string, value: any): void {
    if (!this.forma.estilo) {
      this.forma.estilo = new Estilo();
    }

    switch (property) {
      case 'width':
        this.forma.estilo.width = +value;
        break;
      case 'height':
        this.forma.estilo.height = +value;
        break;
      case 'backgroundColor':
        this.forma.estilo.backgroundColor = value;
        break;
      case 'borderColor':
        this.forma.estilo.borderColor = value;
        break;
      case 'borderWidth':
        this.forma.estilo.borderWidth = +value;
        break;
      case 'borderRadius':
        this.forma.estilo.borderRadius = +value;
        break;
      case 'zIndex':
        this.forma.estilo.zIndex = +value;
        break;
      case 'positionX':
        this.forma.estilo.positionX = +value;
        break;
      case 'positionY':
        this.forma.estilo.positionY = +value;
        break;
      case 'rotation':
        this.forma.estilo.rotation = +value;
        break;
      case 'color':
        this.forma.estilo.color = value;
        break;
      case 'fontSize':
        this.forma.estilo.fontSize = +value;
        break;
    }

    this.onFormaChange();
  }

  onLocalidadChange(localidadId: number | null) {
    if (localidadId) {
      const localidadSeleccionada = this.localidadesDisponibles.find(l => l.id === localidadId);
      if (localidadSeleccionada) {
        // Si no existe el array de localidades, crearlo
        if (!this.forma.localidades) {
          this.forma.localidades = [];
        }
        
        // Verificar si la localidad ya está agregada
        const yaExiste = this.forma.localidades.find(l => l.id === localidadId);
        if (!yaExiste) {
          this.forma.localidades.push(localidadSeleccionada);
          this.onFormaChange();
        }
      }
    }
  }

  eliminarLocalidad(index: number) {
    if (this.forma.localidades && index >= 0 && index < this.forma.localidades.length) {
      this.forma.localidades.splice(index, 1);
      this.onFormaChange();
    }
  }

  eliminarTodasLocalidades() {
    if (this.forma.localidades) {
      this.forma.localidades = [];
      this.onFormaChange();
    }
  }

  obtenerNombreTipo(tipoId: number | null): string {
    const tipo = this.tiposForma.find(t => t.id === tipoId);
    return tipo ? tipo.nombre : 'Sin tipo';
  }

  obtenerLocalidadesDisponiblesParaAgregar(): Localidad[] {
    if (!this.forma.localidades || this.forma.localidades.length === 0) {
      return this.localidadesDisponibles;
    }
    
    return this.localidadesDisponibles.filter(localidad => 
      !this.forma.localidades.find(l => l.id === localidad.id)
    );
  }
}
