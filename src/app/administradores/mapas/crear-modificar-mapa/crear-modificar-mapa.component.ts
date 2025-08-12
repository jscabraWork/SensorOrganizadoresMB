import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';

import { Mapa } from '../../../models/mapas/mapa.model';
import { Fila } from '../../../models/mapas/fila.model';
import { Asiento } from '../../../models/mapas/asiento.model';
import { Estilo } from '../../../models/mapas/estilo.model';
import { Forma } from '../../../models/mapas/forma.model';
import { MapasDataService } from '../../../service/data/mapas-data.service';
import { Evento } from '../../../models/evento.model';
import { Localidad } from '../../../models/localidad.model';

import { TitleComponent } from '../../../commons-ui/title/title.component';
import { CommonAgregarComponent } from '../../../commons-components/common-agregar/common-agregar.component';
import { PropiedadesFilaComponent } from './propiedades-fila/propiedades-fila.component';
import { PropiedadesAsientoComponent } from './propiedades-asiento/propiedades-asiento.component';
import { PropiedadesFormaComponent } from './propiedades-forma/propiedades-forma.component';
import { LeyendasMapaComponent } from './leyendas-mapa/leyendas-mapa.component';

@Component({
  selector: 'app-crear-modificar-mapa',
  standalone: true,    imports: [
    CommonModule, 
    FormsModule, 
    DragDropModule,
    RouterModule,
    PropiedadesFilaComponent,
    PropiedadesAsientoComponent,
    PropiedadesFormaComponent,
    LeyendasMapaComponent
  ],
  templateUrl: './crear-modificar-mapa.component.html',
  styleUrls: ['./crear-modificar-mapa.component.scss']
})
export class CrearModificarMapaComponent extends CommonAgregarComponent<Mapa, MapasDataService> implements OnInit {
  // Propiedades principales
  mapa: Mapa = new Mapa();
  mapaId: number | null = null;
  modoEdicion = false;
  guardando = false;
  modoPreview = false;
  cargando = false;
  // Datos de referencia
  eventos: Evento[] = [];
  eventoSeleccionado: Evento | null = null;
  estilosDisponibles: Estilo[] = [];
  formasDisponibles: Forma[] = [];
  localidadesDisponibles: Localidad[] = [];

  // Estado de selección unificado (sin secciones)
  elementoSeleccionado: Fila | Asiento | Forma | null = null;
  tipoElementoSeleccionado: 'fila' | 'asiento' | 'forma' | null = null;
  
  indicesElementoSeleccionado: {
    filaIndex?: number;
    asientoIndex?: number;
    formaIndex?: number;
  } = {};

  // Estado de UI
  panelEstilosAbierto = false;
  filaExpandida: { [key: number]: boolean } = {};

  // Variables para drag & drop
  draggedElement: any = null;
  draggedType: string = '';
  dragOffset = { x: 0, y: 0 };

  // Override properties from CommonAgregarComponent
  protected override e: Mapa = new Mapa();
  protected override ruta = '/administradores/mapas';

  constructor(
    protected override service: MapasDataService,
    protected override router: Router,
    private route: ActivatedRoute,
    protected override dialog: MatDialog,
    public cdr: ChangeDetectorRef
  ) {
    super(service, router, dialog);
  }
  override ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('mapaId');
      if (this.id) {
        this.mapaId = +this.id;
        this.modoEdicion = true;
        this.cargarMapa();
      } else {
        this.inicializarMapaNuevo();
        // Solo cargar eventos en modo creación
        this.cargarEventos();
      }
    });    // Cargar datos de referencia que siempre se necesitan
  
  }
  
  // === CARGA DE DATOS ===
  cargarEventos(): void {
    this.service.getEventosNoTerminados().subscribe({
      next: (eventos) => {
        this.eventos = eventos || [];
        console.log('Eventos cargados:', eventos);
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.eventos = [];
        this.mensaje('Error al cargar la lista de eventos');
      }
    });
  }

  onEventoSeleccionado(evento: Evento): void {
    this.eventoSeleccionado = evento;
    if (evento) {
      this.mapa.evento = evento;
      console.log('Evento asignado al mapa:', evento.nombre);
    }
  }

 
  cargarFormas(): void {
    const forma1 = new Forma();
    forma1.id = 1;
    forma1.tipo = 1;
    forma1.type = 'rectangular';
    
    const forma2 = new Forma();
    forma2.id = 2;
    forma2.tipo = 2;
    forma2.type = 'circular';
    
    this.formasDisponibles = [forma1, forma2];
  }
  cargarLocalidades(): void {
    this.service.getLocalidadesByEvento(this.mapa.evento.id).subscribe({
      next: (localidades) => {
        this.localidadesDisponibles = localidades || [];
        console.log('Localidades cargadas:', localidades);
      },
      error: (error) => {
        console.error('Error al cargar localidades:', error);
        this.localidadesDisponibles = [];
        this.mensaje('Error al cargar la lista de localidades');
      }
    });
  }

  cargarMapa(): void {
    if (this.mapaId) {
      this.cargando = true;
      this.service.getPorId(this.mapaId).subscribe({
        next: (mapa) => {
          this.mapa = mapa;
          this.e = mapa;
          this.eventoSeleccionado = mapa.evento;
          this.inicializarEstadoFilas();
           this.cargarFormas();
    this.cargarLocalidades();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar mapa:', error);
          this.cargando = false;
        }
      });
    }
  }

  inicializarMapaNuevo(): void {
    this.mapa = new Mapa();
    this.e = this.mapa;
  }

  inicializarEstadoFilas(): void {
    this.mapa.filas.forEach((_, index) => {
      this.filaExpandida[index] = false;
    });
  }

  // === SELECCIÓN UNIFICADA ===
  seleccionarElemento(elemento: Fila | Asiento | Forma, tipo: 'fila' | 'asiento' | 'forma', indices: any): void {
    this.elementoSeleccionado = elemento;
    this.tipoElementoSeleccionado = tipo;
    this.indicesElementoSeleccionado = indices;
    this.panelEstilosAbierto = true;
  }

  seleccionarFila(filaIndex: number, event?: Event): void {
    if (event) event.stopPropagation();
    const fila = this.mapa.filas[filaIndex];
    this.seleccionarElemento(fila, 'fila', { filaIndex });
  }

  seleccionarAsiento(filaIndex: number, asientoIndex: number, event?: Event): void {
    if (event) event.stopPropagation();
    const asiento = this.mapa.filas[filaIndex].asientos[asientoIndex];
    this.seleccionarElemento(asiento, 'asiento', { filaIndex, asientoIndex });
  }

  seleccionarForma(formaIndex: number, event?: Event): void {
    if (event) event.stopPropagation();
    const forma = this.mapa.formas[formaIndex];
    this.seleccionarElemento(forma, 'forma', { formaIndex });
  }

  cancelarSeleccion(): void {
    this.elementoSeleccionado = null;
    this.tipoElementoSeleccionado = null;
    this.indicesElementoSeleccionado = {};
    this.panelEstilosAbierto = false;
  }

  // === GESTIÓN DE FILAS ===
  toggleFila(index: number): void {
    this.filaExpandida[index] = !this.filaExpandida[index];
  }  agregarFila(): void {
    const nuevaFila = new Fila();
    nuevaFila.estilo = new Estilo();
    nuevaFila.estilo.positionX = 50;
    nuevaFila.estilo.positionY = 50 + (this.mapa.filas.length * 60);
    nuevaFila.estilo.rotation = 0;
    // Propiedades predeterminadas para asientos
    nuevaFila.estilo.width = 40;
    nuevaFila.estilo.height = 40;
    nuevaFila.estilo.backgroundColor = '#007bff';
    nuevaFila.estilo.color = '#fff';
    nuevaFila.estilo.borderColor = '#222'; // borde visible
    nuevaFila.estilo.borderWidth = 2; // grosor visible
    nuevaFila.estilo.borderRadius = 4;
    nuevaFila.estilo.fontSize = 12;
    this.mapa.filas.push(nuevaFila);
    this.filaExpandida[this.mapa.filas.length - 1] = true;
    // Seleccionar automáticamente la nueva fila
    this.seleccionarElemento(nuevaFila, 'fila', { filaIndex: this.mapa.filas.length - 1 });
  }

  eliminarFila(filaIndex: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.mapa.filas.splice(filaIndex, 1);    this.actualizarOrdenesFilas();
    this.cancelarSeleccion();
    this.reorganizarEstadoFilas();
  }

  // === GESTIÓN DE FORMAS ===
  agregarForma(): void {
    const nuevaForma = new Forma();
    nuevaForma.tipo = 1; // Rectangular por defecto
    nuevaForma.estilo = new Estilo();
    nuevaForma.estilo.positionX = 100;
    nuevaForma.estilo.positionY = 100 + (this.mapa.formas.length * 80);
    // Valores predeterminados VISIBLES
    nuevaForma.estilo.backgroundColor = '#0080ff'; // azul visible
    nuevaForma.estilo.borderColor = '#222'; // borde oscuro visible
    nuevaForma.estilo.borderWidth = 2;
    nuevaForma.estilo.width = 100;
    nuevaForma.estilo.height = 100;
    nuevaForma.estilo.borderRadius = 8;
    this.mapa.formas.push(nuevaForma);
    // Seleccionar automáticamente la nueva forma
    this.seleccionarElemento(nuevaForma, 'forma', { formaIndex: this.mapa.formas.length - 1 });
  }

  eliminarForma(formaIndex: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.mapa.formas.splice(formaIndex, 1);
    this.cancelarSeleccion();
  }

  // === GESTIÓN DE ASIENTOS ===
  agregarAsientoAFila(fila: Fila): void {
    const nuevoAsiento = new Asiento();
    nuevoAsiento.orden = fila.asientos.length;
    // Herencia: el estilo es null por defecto, para heredar de la fila
    nuevoAsiento.estilo = null;
    if (!fila.asientos) {
      fila.asientos = [];
    }
    fila.asientos.push(nuevoAsiento);
    // Seleccionar automáticamente el nuevo asiento
    const filaIndex = this.mapa.filas.indexOf(fila);
    this.seleccionarElemento(nuevoAsiento, 'asiento', { filaIndex, asientoIndex: fila.asientos.length - 1 });
  }

  eliminarAsiento(filaIndex: number, asientoIndex: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.mapa.filas[filaIndex].asientos.splice(asientoIndex, 1);
    this.actualizarOrdenesAsientos(filaIndex);
    this.cancelarSeleccion();
  }

  onDragStart(event: DragEvent, item: any, type: string): void {
    this.draggedElement = item;
    this.draggedType = type;
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ item, type }));
      
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.dragOffset.x = event.clientX - rect.left;
      this.dragOffset.y = event.clientY - rect.top;
    }
    
    (event.target as HTMLElement).style.opacity = '0.5';
  }

  onDragEnd(event: DragEvent): void {
    (event.target as HTMLElement).style.opacity = '1';
    this.draggedElement = null;
    this.draggedType = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    const canvas = event.currentTarget as HTMLElement;
    canvas.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    const canvas = event.currentTarget as HTMLElement;
    canvas.classList.remove('drag-over');
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    
    const canvas = event.currentTarget as HTMLElement;
    canvas.classList.remove('drag-over');
    
    if (event.dataTransfer && this.draggedElement) {
      const canvasRect = canvas.getBoundingClientRect();
      
      const newX = event.clientX - canvasRect.left - this.dragOffset.x;
      const newY = event.clientY - canvasRect.top - this.dragOffset.y;
      
      const elementWidth = this.getElementWidth(this.draggedElement, this.draggedType);
      const elementHeight = this.getElementHeight(this.draggedElement, this.draggedType);
      
      const constrainedX = Math.max(0, Math.min(newX, this.mapa.ancho! - elementWidth));
      const constrainedY = Math.max(0, Math.min(newY, this.mapa.alto! - elementHeight));
        // Handle position differently based on element type
      if (this.draggedType === 'fila') {
        // For rows, position is stored in estilo
        if (!this.draggedElement.estilo) {
          this.draggedElement.estilo = new Estilo();
        }
        this.draggedElement.estilo.positionX = constrainedX;
        this.draggedElement.estilo.positionY = constrainedY;
      } else {
        // For forms and other elements, position is stored in estilo
        if (!this.draggedElement.estilo) {
          this.draggedElement.estilo = new Estilo();
        }
        this.draggedElement.estilo.positionX = constrainedX;
        this.draggedElement.estilo.positionY = constrainedY;
      }
      
      this.cdr.detectChanges();
    }
  }

  private getElementWidth(element: any, type: string): number {
    switch (type) {
      case 'fila':
        return this.getEstilosFila(element).width;
      case 'asiento':
        // Find parent fila if possible for inheritance
        let fila: any = undefined;
        if (this.indicesElementoSeleccionado.filaIndex !== undefined) {
          fila = this.mapa.filas[this.indicesElementoSeleccionado.filaIndex];
        }
        return this.getEstilosAsiento(element, fila).width;
      case 'forma':
        return this.getEstilosForma(element).width;
      default:
        return 50;
    }
  }

  private getElementHeight(element: any, type: string): number {
    switch (type) {
      case 'fila':
        return this.getEstilosFila(element).height;
      case 'asiento':
        let fila: any = undefined;
        if (this.indicesElementoSeleccionado.filaIndex !== undefined) {
          fila = this.mapa.filas[this.indicesElementoSeleccionado.filaIndex];
        }
        return this.getEstilosAsiento(element, fila).height;
      case 'forma':
        return this.getEstilosForma(element).height;
      default:
        return 50;
    }
  }
  // === MÉTODOS DE ESTILO ===
  getPosicionX(item: any): number {
    return item.estilo?.positionX || 0;
  }

  getPosicionY(item: any): number {
    return item.estilo?.positionY || 0;
  }

  getRotacion(item: any): number {
    return item.estilo?.rotation || 0;
  }

  // === MÉTODOS DE ESTILO CON HERENCIA (OBSOLETOS, ELIMINADOS) ===
  // getColorAsiento(asiento: Asiento, fila?: Fila): string { ... }
  // getborderColorAsiento(asiento: Asiento, fila?: Fila): string { ... }
  // getborderWidth(asiento: Asiento, fila?: Fila): number { ... }
  // getFormaAsiento(asiento: Asiento, fila?: Fila): string { ... }
  // getFontSize(asiento: Asiento, fila?: Fila): number { ... }
  // getcolor(asiento: Asiento, fila?: Fila): string { ... }
  // ...existing code...
  // === ORDENAMIENTO ===
  reordenarFilas(event: any): void {
    if (event.previousIndex !== event.currentIndex) {
      const filas = [...this.mapa.filas];
      const [removed] = filas.splice(event.previousIndex, 1);
      filas.splice(event.currentIndex, 0, removed);
      
      filas.forEach((fila, index) => {
        fila.estilo.zIndex = index;
      });
      
      this.mapa.filas = filas;
    }
  }

  // === GETTERS PARA COMPONENTES DE PROPIEDADES ===
  obtenerFilaSeleccionada(): Fila | null {
    if (this.tipoElementoSeleccionado === 'fila' && this.indicesElementoSeleccionado.filaIndex !== undefined) {
      return this.mapa.filas[this.indicesElementoSeleccionado.filaIndex];
    }
    return null;
  }

  obtenerAsientoSeleccionado(): Asiento | null {
    if (this.tipoElementoSeleccionado === 'asiento' && 
        this.indicesElementoSeleccionado.filaIndex !== undefined &&
        this.indicesElementoSeleccionado.asientoIndex !== undefined) {
      return this.mapa.filas[this.indicesElementoSeleccionado.filaIndex]
                  .asientos[this.indicesElementoSeleccionado.asientoIndex];
    }
    return null;
  }

  obtenerFormaSeleccionada(): Forma | null {
    if (this.tipoElementoSeleccionado === 'forma' && this.indicesElementoSeleccionado.formaIndex !== undefined) {
      return this.mapa.formas[this.indicesElementoSeleccionado.formaIndex];
    }
    return null;
  }

  onElementoChange(elementoActualizado: Fila | Asiento | Forma): void {    this.cdr.detectChanges();
  }

  // === MANEJO DE EVENTOS DE PROPIEDADES ===
  onFormaChange(formaActualizada: Forma): void {
    if (this.tipoElementoSeleccionado === 'forma' && this.indicesElementoSeleccionado.formaIndex !== undefined) {
      const index = this.indicesElementoSeleccionado.formaIndex;
      this.mapa.formas[index] = formaActualizada;
      this.elementoSeleccionado = formaActualizada;
      this.cdr.detectChanges();
    }
  }

  eliminarElemento(): void {
    if (this.tipoElementoSeleccionado === 'fila' && this.indicesElementoSeleccionado.filaIndex !== undefined) {
      this.eliminarFila(this.indicesElementoSeleccionado.filaIndex);
    } else if (this.tipoElementoSeleccionado === 'asiento' && 
               this.indicesElementoSeleccionado.filaIndex !== undefined &&
               this.indicesElementoSeleccionado.asientoIndex !== undefined) {
      this.eliminarAsiento(this.indicesElementoSeleccionado.filaIndex, this.indicesElementoSeleccionado.asientoIndex);
    } else if (this.tipoElementoSeleccionado === 'forma' && this.indicesElementoSeleccionado.formaIndex !== undefined) {
this.eliminarForma(this.indicesElementoSeleccionado.formaIndex);    }
  }

  // === UTILIDADES ===
  actualizarOrdenesFilas(): void {
    this.mapa.filas.forEach((fila, index) => {
      fila.estilo.zIndex = index;
    });
  }

  reorganizarEstadoFilas(): void {
    const nuevoEstado: { [key: number]: boolean } = {};
    this.mapa.filas.forEach((_, index) => {
      nuevoEstado[index] = this.filaExpandida[index] || false;
    });
    this.filaExpandida = nuevoEstado;
  }

  actualizarOrdenesAsientos(filaIndex: number): void {
    const fila = this.mapa.filas[filaIndex];
    fila.asientos.forEach((asiento, index) => {
      asiento.orden = index;
    });
  }

  // === GUARDADO ===
  guardarMapa(): void {

    if (this.validarMapa()) {
      this.save();
    }
  }

  override save(): void {
    if (!this.validarMapa()) {
      return;
    }

    this.guardando = true;
    this.mapa.evento = this.eventoSeleccionado!;
    this.e = this.mapa;

    console.log('Guardando mapa:', this.mapa);

    if (this.modoEdicion) {
      this.service.editar(this.mapa).subscribe({
        next: () => {
          this.guardando = false;
          this.mensaje('Mapa actualizado exitosamente');
          this.atras();
        },
        error: (error) => {
          console.error('Error al actualizar mapa:', error);
          this.guardando = false;
          this.mensaje('Error al actualizar el mapa');
        }
      });
    } else {
      this.service.crear(this.mapa).subscribe({
        next: () => {
          this.guardando = false;
          this.mensaje('Mapa creado exitosamente');
          this.atras();
        },
        error: (error) => {
          console.error('Error al crear mapa:', error);
          this.guardando = false;
          this.mensaje('Error al crear el mapa');        }
      });
    }
  }

  private validarMapa(): boolean {
    if (!this.mapa.nombre?.trim()) {
      this.mensaje('El nombre del mapa es requerido');
      return false;
    }

    if (!this.eventoSeleccionado) {
      this.mensaje('Debe seleccionar un evento');
      return false;
    }

    if (this.mapa.filas.length === 0 && this.mapa.formas.length === 0) {
      this.mensaje('El mapa debe tener al menos una fila o forma');
      return false;
    }

    return true;
  }

  atras(): void {
    this.router.navigate([this.ruta]);
  }

  togglePreview(): void {
    this.modoPreview = !this.modoPreview;
    if (this.modoPreview) {
      this.cancelarSeleccion();
    }
  }

  obtenerTituloMapa(): string {
    return this.modoEdicion ? 'Editar Mapa' : 'Crear Mapa';
  }

  /**
   * Devuelve todos los estilos relevantes para una forma
   */
  getEstilosForma(forma: Forma) {
    const estilo = forma.estilo as Estilo | undefined;
    return {
      width: estilo?.width ?? 100,
      height: estilo?.height ?? 100,
      positionX: estilo?.positionX ?? 0,
      positionY: estilo?.positionY ?? 0,
      rotation: estilo?.rotation ?? 0,
      backgroundColor: estilo?.backgroundColor ?? '#ffffff',
      borderColor: estilo?.borderColor ?? '#cccccc',
      borderWidth: estilo?.borderWidth ?? 1,
      borderRadius: estilo?.borderRadius ?? 8,
      color: estilo?.color ?? '#000',
      fontSize: estilo?.fontSize ?? 16,
    };
  }

  /**
   * Devuelve todos los estilos relevantes para una fila
   */
  getEstilosFila(fila: Fila) {
    const estilo = fila.estilo as Estilo | undefined;
    return {
      width: estilo?.width ?? 40,
      height: estilo?.height ?? 40,
      positionX: estilo?.positionX ?? 0,
      positionY: estilo?.positionY ?? 0,
      rotation: estilo?.rotation ?? 0,
      backgroundColor: estilo?.backgroundColor ?? '#007bff',
      borderColor: estilo?.borderColor ?? '#222',
      borderWidth: estilo?.borderWidth ?? 2,
      borderRadius: estilo?.borderRadius ?? 4,
      color: estilo?.color ?? '#fff',
      fontSize: estilo?.fontSize ?? 12,
    };
  }

  /**
   * Devuelve todos los estilos relevantes para un asiento, considerando herencia de fila y estado del ticket
   */
  getEstilosAsiento(asiento: Asiento, fila?: Fila) {
    const estiloAsiento = asiento.estilo as Estilo | undefined;
    let estiloFila: Estilo | undefined = undefined;
    if (!fila && this.indicesElementoSeleccionado.filaIndex !== undefined) {
      fila = this.mapa.filas[this.indicesElementoSeleccionado.filaIndex];
    }
    if (fila && fila.estilo) {
      estiloFila = fila.estilo;
    }

    // Determinar backgroundColor y borderColor según estado del ticket
    let backgroundColor: string;
    let borderColor: string;
    switch (asiento.ticket?.estado) {
      case 1: // Vendido
      case 2: // Reservado
        backgroundColor = 'red'; // rojo
        break;
      case 3: // En proceso
        backgroundColor = '#ff9900'; // naranja
        break;
      case 4: // No disponible
        backgroundColor = '#808080'; // gris
        break;
      default: // Disponible (0 o indefinido)
        backgroundColor =
          estiloAsiento?.backgroundColor ??
          estiloFila?.backgroundColor ??
          '#28a745';
        borderColor =
          estiloAsiento?.borderColor ??
          estiloFila?.borderColor ??
          '#222';
        break;
    }

    return {
      width: estiloAsiento?.width ?? estiloFila?.width ?? 40,
      height: estiloAsiento?.height ?? estiloFila?.height ?? 40,
      backgroundColor,
      borderColor,
      borderWidth: estiloAsiento?.borderWidth ?? estiloFila?.borderWidth ?? 0,
      borderRadius: estiloAsiento?.borderRadius ?? estiloFila?.borderRadius ?? 0,
      color: estiloAsiento?.color ?? estiloFila?.color ?? '#000',
      fontSize: estiloAsiento?.fontSize ?? estiloFila?.fontSize ?? 12,
    };
  }

  trackByForma(index: number, forma: any): any {
    return forma && forma.id != null ? forma.id : index;
  }
  trackByFila(index: number, fila: any): any {
    return fila && fila.id != null ? fila.id : index;
  }

  trackByAsiento(index: number, asiento: any): any {
    return asiento && asiento.id != null ? asiento.id : index;
  }

  getFilaCurvatura(fila: any): string {
    // Devuelve una cadena de transformación CSS para la curvatura de la fila si aplica
    // Si no hay curvatura, retorna 'none' o una cadena vacía
    return '';
  }

  actualizarRotacionElemento(valor: number | string) {
    const rot = Number(valor) || 0;
    if (this.elementoSeleccionado && this.elementoSeleccionado.estilo) {
      this.elementoSeleccionado.estilo.rotation = rot;
      this.cdr.detectChanges();
    }
  }

  // === ROTATION HANDLE STATE ===
  isRotating = false;
  rotationStartAngle = 0;
  rotationStartValue = 0;
  rotationPreview: number | null = null; // Para mostrar el ángulo flotante

  onRotationHandleMouseDown(event: MouseEvent, element: any) {
    event.preventDefault();
    event.stopPropagation();
    this.isRotating = true;
    const target = event.target as HTMLElement;
    const parent = target.closest('.fila-element, .forma-element') as HTMLElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    this.rotationStartAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    this.rotationStartValue = element.estilo?.rotation || 0;
    this.rotationPreview = this.rotationStartValue;
    window.addEventListener('mousemove', this.onRotationHandleMouseMove);
    window.addEventListener('mouseup', this.onRotationHandleMouseUp);
    (window as any)._rotatingElement = element;
    (window as any)._rotatingCenter = { x: centerX, y: centerY };
  }

  onRotationHandleMouseMove = (event: MouseEvent) => {
    if (!this.isRotating) return;
    const element = (window as any)._rotatingElement;
    const center = (window as any)._rotatingCenter;
    if (!element || !center) return;
    const dx = event.clientX - center.x;
    const dy = event.clientY - center.y;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    let delta = angle - this.rotationStartAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    let newRotation = this.rotationStartValue + delta;
    const snap = event.shiftKey ? 45 : 15;
    newRotation = ((Math.round(newRotation / snap) * snap) % 360 + 360) % 360;
    this.rotationPreview = (newRotation === 0 && (this.rotationStartValue + delta) > 350) ? 360 : newRotation;
    if (element.estilo) {
      element.estilo.rotation = newRotation;
      this.cdr.detectChanges();
    }
  };

  onRotationHandleMouseUp = (event: MouseEvent) => {
    if (!this.isRotating) return;
    this.isRotating = false;
    this.rotationPreview = null;
    window.removeEventListener('mousemove', this.onRotationHandleMouseMove);
    window.removeEventListener('mouseup', this.onRotationHandleMouseUp);
    (window as any)._rotatingElement = null;
    (window as any)._rotatingCenter = null;
  };
}