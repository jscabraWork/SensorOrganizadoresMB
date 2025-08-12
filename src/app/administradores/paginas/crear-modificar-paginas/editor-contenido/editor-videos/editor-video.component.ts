import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstiloContenido, Video, Recurso } from '../../../../../models/pagina.model';
import { EditorBaseComponent } from '../editor-base/editor-base.component';
import { RecursosComponent } from '../../recursos/recursos.component';
import { EditorPropiedadesComunesComponent } from '../editor-base/editor-propiedades-comunes';

@Component({
  selector: 'app-editor-video',
  standalone: true,
  imports: [CommonModule, FormsModule, RecursosComponent, EditorPropiedadesComunesComponent],
  templateUrl: './editor-video.component.html',
  styleUrls: ['../editor-contenido.component.scss']
})
export class EditorVideoComponent extends EditorBaseComponent<Video> implements OnInit {
  // Input para la página asociada
  @Input() paginaId: number | null = null;
  
  // Modelo de datos
  video: Video = new Video();

    tipos = [1]

  
  override inicializarDesdeContenidoExistente() {
    // Inicializar propiedades comunes desde la clase base
    super.inicializarDesdeContenidoExistente();
    
    if (this.contenidoExistente) {
      // Clonar propiedades del contenido existente
      this.video = {...new Video(), ...this.contenidoExistente};
      
      // Asegurar que existe el objeto estilos
      if (!this.video.estilos) {
        this.video.estilos = new EstiloContenido();
      }
      
      // Inicializar propiedades de reproducción si no existen
      if (this.video.autoplay === undefined) this.video.autoplay = false;
      if (this.video.bucle === undefined) this.video.bucle = false;
      if (this.video.controls === undefined) this.video.controls = true;
      if (this.video.muted === undefined) this.video.muted = false;
    }
  }

  // Método para seleccionar un recurso desde el componente RecursosComponent
  seleccionarRecurso(recurso: Recurso) {
    if (recurso.tipo === 1) { // Asegurar que sea un video
      this.video.recurso = recurso;
    } else {
      alert('El recurso seleccionado no es un video');
    }
  }

  // Método para formatear el tamaño del archivo
  formatearTamano(tamano: number): string {
    if (!tamano) return '0 B';
    if (tamano < 1024) return `${tamano} B`;
    if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(2)} KB`;
    return `${(tamano / (1024 * 1024)).toFixed(2)} MB`;
  }
  
  // Método abstracto requerido
  override obtenerElementoActual(): Video {
    return this.video;
  }

  // Método para guardar
  guardar() {
    // Validar que se haya seleccionado un video
    if (!this.video.recurso) {
      alert('Debe seleccionar un archivo de video');
      return;
    }
    
    // Crear una nueva instancia para enviar
    const videoGuardado = new Video();
    Object.assign(videoGuardado, this.video);

    // Emitir el evento con el contenido creado
    this.contenidoCreado.emit(videoGuardado);
  }
}