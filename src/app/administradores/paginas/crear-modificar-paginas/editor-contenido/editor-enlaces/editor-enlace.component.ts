import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorBaseComponent } from '../editor-base/editor-base.component';
import { Enlace, EstiloContenido } from '../../../../../models/pagina.model';
import { EditorPropiedadesComunesComponent } from '../editor-base/editor-propiedades-comunes';

@Component({
  selector: 'app-editor-enlace',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorPropiedadesComunesComponent],
  templateUrl: './editor-enlace.component.html',
  styleUrls: ['../editor-contenido.component.scss']
})
export class EditorEnlaceComponent extends EditorBaseComponent<Enlace> implements OnInit {
  // Modelo de datos principal
  enlace: Enlace = new Enlace();

  
  override inicializarDesdeContenidoExistente() {
    // Inicializar propiedades comunes desde la clase base
    super.inicializarDesdeContenidoExistente();
    
    if (this.contenidoExistente) {
      // Clonar propiedades del contenido existente
      this.enlace = {...new Enlace(), ...this.contenidoExistente};
      
      // Asegurar que existe el objeto estilos
      if (!this.enlace.estilos) {
        this.enlace.estilos = new EstiloContenido();
      }
    }
  }
  
  // Método para verificar si la URL es válida
  esUrlValida(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Método abstracto requerido - devuelve el elemento actual
  override obtenerElementoActual(): Enlace {
    return this.enlace;
  }

  // Método para guardar
  guardar() {
    // Validar la URL antes de guardar
    if (!this.esUrlValida(this.enlace.url)) {
      alert('Por favor, ingrese una URL válida. Debe incluir http:// o https://');
      return;
    }
    
    // Crear una nueva instancia para enviar
    const enlaceGuardado = new Enlace();
    Object.assign(enlaceGuardado, this.enlace);

    // Emitir el evento con el contenido creado
    this.contenidoCreado.emit(enlaceGuardado);
  }
}