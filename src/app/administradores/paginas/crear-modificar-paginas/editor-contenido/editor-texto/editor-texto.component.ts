import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstiloContenido, Texto } from '../../../../../models/pagina.model';
import { EditorBaseComponent } from '../editor-base/editor-base.component';
import { EditorPropiedadesComunesComponent } from '../editor-base/editor-propiedades-comunes';

@Component({
  selector: 'app-editor-texto',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorPropiedadesComunesComponent],
  templateUrl: './editor-texto.component.html',
  styleUrls: ['../editor-contenido.component.scss']
})
export class EditorTextoComponent extends EditorBaseComponent<Texto> implements OnInit {
  // Modelo de datos principal
  texto: Texto = new Texto();
  
  override inicializarDesdeContenidoExistente() {
    // Inicializar propiedades comunes desde la clase base
    super.inicializarDesdeContenidoExistente();
    
    if (this.contenidoExistente) {
      // Clonar propiedades del contenido existente
      this.texto = {...new Texto(), ...this.contenidoExistente};
      
      // Asegurar que existe el objeto estilos
      if (!this.texto.estilos) {
        this.texto.estilos = new EstiloContenido();
      }
    }
  }
  
  // Método abstracto requerido
  override obtenerElementoActual(): Texto {
    return this.texto;
  }

  // Método para guardar
  guardar() {
    // Crear una nueva instancia para enviar
    const textoGuardado = new Texto();
    Object.assign(textoGuardado, this.texto);

    // Emitir el evento con el contenido creado
    this.contenidoCreado.emit(textoGuardado);
  }
}