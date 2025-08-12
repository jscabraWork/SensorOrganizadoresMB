import { Component, OnInit, Input, Output, ViewChild, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstiloContenido, Imagen, Recurso } from '../../../../../models/pagina.model';
import { EditorBaseComponent } from '../editor-base/editor-base.component';
import { RecursosComponent } from '../../recursos/recursos.component';
import { EditorPropiedadesComunesComponent } from '../editor-base/editor-propiedades-comunes';

@Component({
  selector: 'app-editor-imagen',
  standalone: true,
  imports: [CommonModule, FormsModule, RecursosComponent, EditorPropiedadesComunesComponent],
  templateUrl: './editor-imagen.component.html',
  styleUrls: ['../editor-contenido.component.scss']
})
export class EditorImagenComponent extends EditorBaseComponent<Imagen> implements OnInit {
  // Input para la página asociada
  @Input() paginaId: number | null = null;
  
  // Modelo de datos
  imagen: Imagen = new Imagen();

  tipos = [0]

   objectFitOptions = [
    { value: 'fill', label: 'Fill - Rellenar (puede distorsionar)' },
    { value: 'contain', label: 'Contain - Contener (mantiene proporción)' },
    { value: 'cover', label: 'Cover - Cubrir (recorta para llenar)' },
    { value: 'none', label: 'None - Sin ajuste' },
    { value: 'scale-down', label: 'Scale-down - Reducir escala' }
  ];
  
  override inicializarDesdeContenidoExistente() {
    // Inicializar propiedades comunes desde la clase base
    super.inicializarDesdeContenidoExistente();
    
    if (this.contenidoExistente) {
      // Clonar propiedades del contenido existente
      this.imagen = {...new Imagen(), ...this.contenidoExistente};
      
      // Asegurar que existe el objeto estilos
      if (!this.imagen.estilos) {
        this.imagen.estilos = new EstiloContenido();
      }
    }
  }

  // Método para seleccionar un recurso desde el componente RecursosComponent
  seleccionarRecurso(recurso: Recurso) {
      this.imagen.recurso = recurso;
  }

  // Método para formatear el tamaño del archivo
  formatearTamano(tamano: number): string {
    if (!tamano) return '0 B';
    if (tamano < 1024) return `${tamano} B`;
    if (tamano < 1024 * 1024) return `${(tamano / 1024).toFixed(2)} KB`;
    return `${(tamano / (1024 * 1024)).toFixed(2)} MB`;
  }
  
  // Método para comprobar si se ha ingresado una URL válida
  esUrlValida(url: string): boolean {
    if (!url) return true; // Vacío es válido (sin enlace)
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Método abstracto requerido
  override obtenerElementoActual(): Imagen {
    return this.imagen;
  }

  // Método para guardar
  guardar() {
    // Validar que se haya seleccionado una imagen
    if (!this.imagen.recurso) {
      alert('Debe seleccionar una imagen');
      return;
    }
    
    // Validar la URL del target si se ha ingresado
    if (this.imagen.target && !this.esUrlValida(this.imagen.target)) {
      alert('Por favor, ingrese una URL válida para el enlace');
      return;
    }
    
    // Crear una nueva instancia para enviar
    const imagenGuardada = new Imagen();
    Object.assign(imagenGuardada, this.imagen);

    // Emitir el evento con el contenido creado
    this.contenidoCreado.emit(imagenGuardada);
  }
}