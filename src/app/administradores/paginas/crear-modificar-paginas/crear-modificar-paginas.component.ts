import { PropiedadesSeccionComponent} from './propiedades-seccion/propiedades-seccion.component';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Pagina, Seccion, Contenido, Texto, Imagen, Video, Enlace, EstiloContenido } from '../../../models/pagina.model';
import { PaginasDataService } from '../../../service/data/paginas.data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { EditorContenidoComponent } from './editor-contenido/editor-contenido.component';
import { ScrollingModule, CdkScrollable } from '@angular/cdk/scrolling';
import { TitleComponent } from '../../../commons-ui/title/title.component';
import { NavigationComponent } from '../../../commons-ui/navigation/navigation.component';
import { CommonAgregarComponent } from '../../../commons-components/common-agregar/common-agregar.component';
import { Dialog } from '@angular/cdk/dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-crear-modificar-paginas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DragDropModule,
    ScrollingModule, 
    PropiedadesSeccionComponent,
    EditorContenidoComponent,
    TitleComponent,
    NavigationComponent,
    RouterModule,
    
  ],
  templateUrl: './crear-modificar-paginas.component.html',
  styleUrls: ['./crear-modificar-paginas.component.scss']
})

export class CrearModificarPaginasComponent extends CommonAgregarComponent<Pagina, PaginasDataService> implements OnInit {
  pagina: Pagina = new Pagina();
  paginaId: number | null = null;
  modoEdicion = false;
  guardando = false;
  modoPreview = false;
  isRecursosRoute: boolean = false;
  panelAbierto = false;

  cargando:boolean=false;

   menuItems = [
    { path: './', label: 'Edición' },
    { path: './recursos', label: 'Recursos' }
  ];

  seccionSeleccionada: number | null = null;
  contenidoSeleccionado: { 
    seccionIndex: number, 
    contenidoIndex: number | null 
  } | null = null;

  constructor(
    protected override service: PaginasDataService,
    protected override router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    protected override dialog: MatDialog,
    public cdr: ChangeDetectorRef
  ) {    super(service,router, dialog)
}

override ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    this.id = params.get('paginaId');
    if (this.id) {
      this.paginaId = +this.id;
      this.modoEdicion = true; // Estamos en modo edición
      // Set menuItems for edit mode
      this.menuItems = [
        { path: './', label: 'Edición' },
        { path: './recursos', label: 'Recursos' }
      ];
      // Cargar la página si hay un ID
      this.cargarPagina();
    } else {
      // Si no hay ID, estamos en modo de creación
      this.menuItems = []; // No mostramos el menú en modo creación
    }
  });

  // Escuchar cambios en la ruta para detectar navegación
  this.router.events.subscribe(() => {
    this.updateRecursosRoute();
  });
  // Verificar inicialmente si estamos en la ruta de recursos
  this.updateRecursosRoute();
}

//Método para actualizar el estado de la ruta
private updateRecursosRoute(): void {
  this.isRecursosRoute = this.router.url.includes('/recursos');
}

  // Toggle modo de previsualización
  togglePreview(): void {
  this.modoPreview = !this.modoPreview;
  
  if (this.modoPreview) {
    // Al entrar en modo preview, cerrar el panel de edición
    this.resetearSeleccion();
    // Opcional: scroll hacia arriba para ver toda la página
    const container = document.querySelector('.vista-previa-pagina');
    if (container) {
      container.scrollTop = 0;
    }
  } 
  
  // Forzar detección de cambios
  this.cdr.detectChanges();
}

  // Métodos de generación de estilos para la sección
  generarEstilosSeccion(seccion: Seccion): { [key: string]: string } {
    return {
    'background-color': seccion.estilos.backgroundColor || '#ffffff',
    'width': seccion.estilos.width || '100%',
    'height': seccion.estilos.height || 'auto',
    'margin-top': this.getStyleWithUnitOrAuto(seccion.estilos.marginTop, 'px'),
    'margin-right': this.getStyleWithUnitOrAuto(seccion.estilos.marginRight, 'px'),
    'margin-bottom': this.getStyleWithUnitOrAuto(seccion.estilos.marginBottom, 'px'),
    'margin-left': this.getStyleWithUnitOrAuto(seccion.estilos.marginLeft, 'px'),
    'padding-top': this.getStyleWithUnit(seccion.estilos.paddingTop, 'px'),
    'padding-right': this.getStyleWithUnit(seccion.estilos.paddingRight, 'px'),
    'padding-bottom': this.getStyleWithUnit(seccion.estilos.paddingBottom, 'px'),
    'padding-left': this.getStyleWithUnit(seccion.estilos.paddingLeft, 'px'),
    'border-width': this.getStyleWithUnit(seccion.estilos.borderWidth, 'px'),
    'border-radius': this.getStyleWithUnit(seccion.estilos.borderRadius, 'px'),
    'border-color': seccion.estilos.borderColor || 'transparent',
    'border-style': (seccion.estilos.borderWidth && seccion.estilos.borderWidth > 0) ? 'solid' : 'none'
  };
  }

  // Método para generar estilos básicos del contenido usando el objeto estilos
  generarEstilosContenido(contenido: Contenido): { [key: string]: string } {
    if (!contenido.estilos) {
      contenido.estilos = new EstiloContenido();
    }
    
    return {
      'text-align': contenido.estilos.textAlign || 'left',
      'width': contenido.estilos.width || '100%',
      'height': contenido.estilos.height || 'auto',
      'margin-top': this.getStyleWithUnitOrAuto(contenido.estilos.marginTop, 'px'),
      'margin-right': this.getStyleWithUnitOrAuto(contenido.estilos.marginRight, 'px'),
      'margin-bottom': this.getStyleWithUnitOrAuto(contenido.estilos.marginBottom, 'px'),
      'margin-left': this.getStyleWithUnitOrAuto(contenido.estilos.marginLeft, 'px'),
      'background-color': contenido.estilos.backgroundColor || 'transparent',
      'border-width': this.getStyleWithUnit(contenido.estilos.borderWidth, 'px'),
      'border-radius': this.getStyleWithUnit(contenido.estilos.borderRadius, 'px'),
      'border-color': contenido.estilos.borderColor || 'transparent',
      'border-style': contenido.estilos.borderWidth && contenido.estilos.borderWidth > 0 ? 'solid' : 'none'
    };
  }

  // Método para generar estilos específicos para imágenes
  generarEstilosImagenEspecificos(contenido: any): { [key: string]: string } {
    const imagen = contenido as Imagen;

    return {
      'object-fit': imagen.objectFit || 'contain',
      'width': imagen.estilos.width ||'100%',
      'height': imagen.estilos.height ||'auto'
    };
  }

  // Método para generar estilos específicos para textos
  generarEstilosTextoEspecificos(contenido: any): { [key: string]: string } {
    const texto = contenido as Texto;
    return {
      'font-size': texto.fontSize+ 'px',
      'font-family': texto.fontFamily,
      'font-weight': texto.fontWeight,
      'font-style': texto.fontStyle,
      'text-align': texto.estilos.textAlign,
      'line-height': `${texto.lineHeight}`,
      'color': texto.color
    };
  }

  generarEstilosEnlaceEspecificos(contenido: any): { [key: string]: string } {
  const enlace = contenido as Enlace;
  return {
    'color': enlace.color || '#007bff',
    'font-size': enlace.fontSize +'px' || '16px',
    'text-align': enlace.estilos.textAlign,
  };
}
  // Método auxiliar para convertir valores numéricos a valores con unidades o 'auto' si es null
  getStyleWithUnitOrAuto(value: number | undefined | null, unit: string): string {
    if (value === undefined || value === null) {
      return 'auto';
    }
    return value + unit;
  }

  // Método auxiliar para convertir valores numéricos a valores con unidades
  getStyleWithUnit(value: number | undefined | null, unit: string): string {
    if (value === undefined || value === null) {
      return '0' + unit;
    }
    return value + unit;
  }

  // Métodos de reorganización
 reorganizarSecciones(event: CdkDragDrop<string[]>) {
  moveItemInArray(
    this.pagina.secciones, 
    event.previousIndex, 
    event.currentIndex
  );
  this.pagina.secciones.forEach((seccion, index) => {
    // El primer elemento (index 0) tendrá el orden más bajo (1)
    // El último elemento (index = longitud-1) tendrá el orden más alto (longitud)
    seccion.orden = index + 1;
  });
}

 reorganizarContenido(seccionIndex: number, event: CdkDragDrop<string[]>) {
  // Primero realizamos el movimiento en el array
  moveItemInArray(
    this.pagina.secciones[seccionIndex].contenido, 
    event.previousIndex, 
    event.currentIndex
  );
  
  this.pagina.secciones[seccionIndex].contenido.forEach((contenido, index) => {
    // El primer elemento (index 0) tendrá el orden más bajo (1)
    // El último elemento (index = longitud-1) tendrá el orden más alto (longitud)
    contenido.orden = index + 1;
  });
}

  // Métodos de selección
  // REEMPLAZAR los métodos de selección con esta versión:
seleccionarSeccion(index: number) {

  if (this.modoPreview) {
    return;
  }
  
  // Resetear estado anterior
  this.resetearSeleccion();
  
  this.cdr.detectChanges();
  
  // Establecer nueva selección
  this.seccionSeleccionada = index;
  this.contenidoSeleccionado = null;
  this.panelAbierto = true; // Abrir el panel de edición
  
  // Forzar otra detección para asegurar renderizado
  this.cdr.detectChanges();
}

seleccionarContenido(seccionIndex: number, contenidoIndex: number, event: Event) {

  if (this.modoPreview) {
    return;
  }
  
  event.stopPropagation();
  
  // Resetear estado anterior
  this.resetearSeleccion();
  
  // Forzar detección de cambios
  this.cdr.detectChanges();
  
  // Establecer nueva selección
  this.seccionSeleccionada = seccionIndex;
  this.contenidoSeleccionado = { 
    seccionIndex, 
    contenidoIndex 
  };

  // Forzar otra detección para asegurar renderizado
  this.cdr.detectChanges();
        this.panelAbierto = true; // Abrir el panel de edición
}

  // Métodos de agregar
  agregarSeccion() {
    const nuevaSeccion = new Seccion();
    nuevaSeccion.nombre = `Sección ${this.pagina.secciones.length + 1}`;
    nuevaSeccion.orden = this.pagina.secciones.length + 1;
    this.pagina.secciones.push(nuevaSeccion);
    this.seleccionarSeccion(this.pagina.secciones.length - 1);
    this.panelAbierto = true; // Abrir el panel de edición
  }

  agregarContenido(seccionIndex: number, event: Event) {
  event.stopPropagation();
  
  // Resetear estado anterior si hay algo seleccionado
  this.resetearSeleccion();
  
  
  // Establecer nueva selección para agregar contenido
  this.seccionSeleccionada = seccionIndex;
  this.contenidoSeleccionado = { 
    seccionIndex, 
    contenidoIndex: null 
  };  
  // Forzar detección para asegurar que el panel se actualice
  this.cdr.detectChanges();
 this.panelAbierto = true; // Abrir el panel de edición


}

  // Métodos de eliminación
  eliminarSeccion(index: number) {
    if (confirm('¿Está seguro de eliminar esta sección?')) {
      this.pagina.secciones.splice(index, 1);
      this.resetearSeleccion();
    }
  }

  eliminarContenido(seccionIndex: number, contenidoIndex: number, event: Event) {
    event.stopPropagation();
    if (confirm('¿Está seguro de eliminar este contenido?')) {
      this.pagina.secciones[seccionIndex].contenido.splice(contenidoIndex, 1);
      this.resetearSeleccion();
    }
  }

  // Métodos de actualización
  actualizarSeccion(seccionActualizada: Seccion) {
    if (this.seccionSeleccionada !== null) {
      this.pagina.secciones[this.seccionSeleccionada] = seccionActualizada;
    }
  }

  actualizarContenido(contenidoCreado: Contenido) {
    if (this.seccionSeleccionada !== null && this.contenidoSeleccionado !== null) {
      const seccion = this.pagina.secciones[this.seccionSeleccionada];
      
      // Asegurar que el contenido tenga un objeto estilos
      if (!contenidoCreado.estilos) {
        contenidoCreado.estilos = new EstiloContenido();
      }
      
      if (this.contenidoSeleccionado.contenidoIndex !== null) {
        // Editar contenido existente
        seccion.contenido[this.contenidoSeleccionado.contenidoIndex] = contenidoCreado;
      } else {
        // Agregar nuevo contenido
        seccion.contenido = seccion.contenido || [];
        contenidoCreado.orden = seccion.contenido.length + 1;
        seccion.contenido.push(contenidoCreado);
      }
      
      this.resetearSeleccion();
    }
  }

  // Métodos de carga y guardado
  cargarPagina() {
    this.cargando=true;
    if (this.paginaId) {
      this.service.getPorId(this.paginaId).subscribe({
        next: (pagina) => {
          this.cargando=false;
          this.pagina = pagina;
        },
        error: (error) => {
          this.cargando=false;
          this.mensaje('Error al cargar la página');
        }
      });
    }
  }

  override save() {
    
    this.guardando = true;
    console.log('Guardando página:', this.pagina);
    
    // Función para procesar la respuesta después de guardar
    const procesarRespuesta = (exito: boolean, mensaje: string) => {
      this.guardando = false;
      if (exito) {
        this.mensaje('Página guardada correctamente');
        if (!this.paginaId) {
          this.router.navigate(['/paginas']);
        }
      } else {
        this.mensaje(`Error al guardar la página: ${mensaje}`);
      }
    };
    
    // Si la página ya tiene ID, actualizar; si no, crear nueva
    if (this.paginaId) {
      this.service.actualizar(this.pagina).subscribe({
        next: (respuesta) => {
          console.log('Página actualizada:', respuesta);
          procesarRespuesta(true, 'Actualizada');
        },
        error: (error) => {
          console.error('Error al actualizar la página:', error);
          procesarRespuesta(false, error.message || 'Error al actualizar');
        }
      });
    } else {
      this.service.crear(this.pagina).subscribe({
        next: (respuesta) => {
          console.log('Página creada:', respuesta);
          // Actualizar el ID de la página si el servicio lo devuelve
          if (respuesta && respuesta.id) {
            this.paginaId = respuesta.id;
            this.pagina.id = respuesta.id;
                  this.router.navigate(['../modificar', this.paginaId], { relativeTo: this.route });

          }
          procesarRespuesta(true, 'Creada');
        },
        error: (error) => {
          console.error('Error al crear la página:', error);
          procesarRespuesta(false, error.message || 'Error al crear');
        }
      });
    }
  }

atras(): void {
  const nombreAdmin = this.route.parent?.snapshot.params['nombre'];
  this.router.navigate(['/administradores/admin', nombreAdmin, 'paginas']);
}

  // Método de cancelación
  cancelarEdicion() {
    this.resetearSeleccion();
  }

  // Métodos auxiliares
  resetearSeleccion() {
    this.seccionSeleccionada = null;
    this.contenidoSeleccionado = null;
    this.panelAbierto = false; // Cerrar el panel de edición
  }

  toggleNavigation() {
  this.seccionSeleccionada = null;
  this.contenidoSeleccionado = null;
  this.panelAbierto = false; // Cerrar el panel de edición
}

  // Métodos para obtener información de contenido
  obtenerDescripcionContenido(contenido: Contenido): string {
    switch (contenido.tipo) {
      case 0: // Imagen
        return this.obtenerNombreRecurso(contenido as Imagen);
      case 1: // Video
        return this.obtenerNombreRecurso(contenido as Video);
      case 2: // Texto
        const textoContenido = contenido as Texto;
        return textoContenido.descripcion || 'Sin descripción';
      case 3: // Enlace
        const enlaceContenido = contenido as Enlace;
        return enlaceContenido.texto || 'Sin texto';
      default:
        return 'Contenido desconocido';
    }
  }

  obtenerNombreRecurso(contenido: Imagen | Video): string {
    return contenido.recurso ? contenido.recurso.nombre : 'Sin recurso';
  }

  obtenerUrlRecurso(contenido: any): string | null {
    // Se adapta para trabajar con diferentes tipos que tengan recurso
    if (contenido.recurso) {
      return contenido.recurso.url;
    }
    return null;
  }
// REEMPLAZAR estos métodos en crear-modificar-paginas.component.ts

// Método para detectar si es video directo
esVideoDirecto(url: string): boolean {
  const extensionesVideo = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  return extensionesVideo.some(ext => url.toLowerCase().includes(ext));
}

// Método para convertir URL a formato embed
getEmbedUrl(url: string): string {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = this.extractYouTubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  return url; // Devolver URL original si no es reconocida
}

// Método para extraer ID de YouTube
private extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// REEMPLAZAR el método obtenerUrlVideo
obtenerUrlVideo(contenido: any): SafeResourceUrl | null {
  const recursoUrl = this.obtenerUrlRecurso(contenido);
  
  if (recursoUrl) {
    // Convertir a URL embed antes de sanitizar
    const embedUrl = this.getEmbedUrl(recursoUrl);
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
  
  return null;
}

  // Método para obtener contenido existente para edición
  obtenerContenidoExistente(): Contenido | null {
    if (
      this.seccionSeleccionada !== null && 
      this.contenidoSeleccionado?.contenidoIndex !== null
    ) {
      return this.pagina.secciones[this.seccionSeleccionada]
        .contenido[this.contenidoSeleccionado.contenidoIndex];
    }
    return null;
  }
}