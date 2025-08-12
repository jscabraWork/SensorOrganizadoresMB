import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Seccion, EstiloContenido } from '../../../../models/pagina.model';
import { EditorPropiedadesComunesComponent } from '../editor-contenido/editor-base/editor-propiedades-comunes';

@Component({
  selector: 'app-propiedades-seccion',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorPropiedadesComunesComponent],
  templateUrl: './propiedades-seccion.component.html',
  styleUrls: ['./propiedades-seccion.component.scss']
})
export class PropiedadesSeccionComponent implements OnChanges {
  
  @Input() seccion: Seccion = new Seccion();
  @Output() seccionCambiada = new EventEmitter<Seccion>();
  
  // Copia editable de la sección
  seccionEditada: Seccion;

  constructor() {
    this.seccionEditada = new Seccion();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seccion'] && changes['seccion'].currentValue) {
      // Crear copia simple de la sección
      this.seccionEditada = JSON.parse(JSON.stringify(this.seccion));
      
      // Asegurar que tiene estilos
      if (!this.seccionEditada.estilos) {
        this.seccionEditada.estilos = new EstiloContenido();
      }
    }
  }

  // Guardar propiedades y emitir cambios
  guardarPropiedades() {
    // Asegurar que el orden sea un número
    this.seccionEditada.orden = typeof this.seccionEditada.orden === 'number' 
      ? this.seccionEditada.orden 
      : parseInt(this.seccionEditada.orden as any) || 0;
    
    // Emitir la sección editada
    this.seccionCambiada.emit(this.seccionEditada);
  }
}