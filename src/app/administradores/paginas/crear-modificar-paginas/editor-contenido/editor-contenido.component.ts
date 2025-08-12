import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  Contenido, 
  Texto, 
  Imagen, 
  Video, 
  Enlace 
} from '../../../../models/pagina.model';

import { EditorImagenComponent } from './editor-imagenes/editor-imagen.component';
import { EditorVideoComponent } from './editor-videos/editor-video.component';
import { EditorEnlaceComponent } from './editor-enlaces/editor-enlace.component';
import { EditorTextoComponent } from './editor-texto/editor-texto.component';
import { SelectorTipoContenidoComponent } from './selector/selector-tipo-contenido.component';

@Component({
  selector: 'app-contenido-editor',
  standalone: true,
  imports: [
    CommonModule,
    SelectorTipoContenidoComponent,
    EditorTextoComponent,
    EditorImagenComponent,
    EditorVideoComponent,
    EditorEnlaceComponent
  ],
  templateUrl: './editor-contenido.component.html',
  styleUrls: ['./editor-contenido.component.scss'],
})
export class EditorContenidoComponent {
  @Input() paginaId: number | null = null;
  @Input() modoEdicion: 'nuevo' | 'editar' = 'nuevo';
  @Input() contenidoExistente: Contenido | null = null;
  @Output() contenidoCreado = new EventEmitter<Contenido>();

  // Tipo de contenido seleccionado (0: Imagen, 1: Video, 2: Texto, 3: Enlace)
  tipoContenidoSeleccionado: number | null = null;

   ngOnInit() {
    // Si hay contenido existente, establecer el tipo de contenido
    if (this.contenidoExistente) {
      this.tipoContenidoSeleccionado = this.contenidoExistente.tipo;
    }
  }

  // Métodos para obtener contenido existente de manera específica
  obtenerTexto(): Texto | null {
    if (this.contenidoExistente && this.contenidoExistente.tipo === 2) {
      return this.contenidoExistente as Texto;
    }
    return null;
  }

  obtenerImagen(): Imagen | null {
    if (this.contenidoExistente && this.contenidoExistente.tipo === 0) {
      return this.contenidoExistente as Imagen;
    }
    return null;
  }

  obtenerVideo(): Video | null {
    if (this.contenidoExistente && this.contenidoExistente.tipo === 1) {
      return this.contenidoExistente as Video;
    }
    return null;
  }

  obtenerEnlace(): Enlace | null {
    if (this.contenidoExistente && this.contenidoExistente.tipo === 3) {
      return this.contenidoExistente as Enlace;
    }
    return null;
  }

  // Métodos para gestionar la selección y guardado de contenido
  seleccionarTipoContenido(tipo: number) {
    this.tipoContenidoSeleccionado = tipo;
  }

  guardarContenido(contenido: Contenido) {
    // Establecer el tipo de contenido
    contenido.tipo = this.tipoContenidoSeleccionado!;

    // Emitir el contenido creado
    this.contenidoCreado.emit(contenido);

    // Reiniciar la selección
    this.tipoContenidoSeleccionado = null;
  }
}