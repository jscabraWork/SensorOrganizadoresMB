import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleComponent } from '../../commons-ui/title/title.component';
import { TableComponent, Page, ExpandedRowConfig, ColumnaBotonConfig } from '../../commons-ui/table/table.component';
import { SearchFilterComponent, Filter } from '../../commons-ui/search-filter/search-filter.component';
import { AsignarEventosModalComponent } from '../../commons-components/asignar-eventos-modal/asignar-eventos-modal.component';
import { HardcodedAutheticationService } from '../../service/hardcoded-authetication.service';
import { PromotoresDataService } from '../../service/data/promotores-data.service';
import { Promotor } from '../../models/promotor.model';
import { Evento } from '../../models/evento.model';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../mensaje/mensaje.component';

@Component({
  selector: 'app-promotores',
  imports: [
    CommonModule,
    FormsModule,
    TitleComponent,
    TableComponent,
    SearchFilterComponent,
    AsignarEventosModalComponent
  ],
  templateUrl: './promotores.component.html',
  styleUrl: './promotores.component.scss'
})
export class PromotoresComponent implements OnInit {

  // Variables para la tabla de promotores
  promotoresPage: Page<Promotor> | null = null;
  cargandoPromotores: boolean = false;
  
  // Variables para eventos
  eventosDisponibles: Evento[] = [];
  eventosSeleccionados: number[] = [];
  promotorSeleccionado: Promotor | null = null;
  
  // Estados de la UI
  cargandoEventos: boolean = false;
  asignandoEventos: boolean = false;
  mostrandoAsignacion: boolean = false;
  
  // Variables de autenticación
  nombre: string = '';

  // Variables para filtros
  filtrosActivos: {[key: string]: string} = {};

  // Configuración de filtros
  searchFilters: Filter[] = [
    {
      key: 'nombre',
      value: '',
      placeholder: 'Buscar por nombre',
      label: 'Nombre'
    },
    {
      key: 'numeroDocumento',
      value: '',
      placeholder: 'Buscar por documento',
      label: 'Documento'
    },
    {
      key: 'correo',
      value: '',
      placeholder: 'Buscar por correo',
      label: 'Correo'
    }
  ];

  // Configuración de la tabla expandible
  expandableConfig: ExpandedRowConfig = {
    infoFields: [
      { label: 'Documento', property: 'numeroDocumento' },
      { label: 'Nombre', property: 'nombre' },
      { label: 'Correo', property: 'correo' },
      { label: 'Celular', property: 'celular' }
    ],
    actionButtons: [
      {
        text: 'Eventos',
        class: 'button-primary',
        action: (promotor: Promotor) => this.gestionarEventos(promotor)
      }
    ]
  };

  // Configuración de botones en columnas de la tabla
  columnaBotones: ColumnaBotonConfig[] = [
    {
      columna: 'acciones',
      texto: 'Eventos',
      clase: 'button-primary',
      accion: (promotor: Promotor) => this.gestionarEventos(promotor)
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autenticado: HardcodedAutheticationService,
    private promotoresService: PromotoresDataService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();
    this.cargarPromotores();
  }

  /**
   * Carga todos los promotores
   */
  cargarPromotores(): void {
    this.cargandoPromotores = true;
    
    // Determinar si usar filtros o cargar todos
    const hayFiltros = Object.values(this.filtrosActivos).some(valor => valor?.trim());
    
    const observable = hayFiltros 
      ? this.promotoresService.filtrarPromotores(
          this.filtrosActivos['nombre'],
          this.filtrosActivos['numeroDocumento'], 
          this.filtrosActivos['correo']
        )
      : this.promotoresService.listar();

    observable.subscribe({
      next: (response) => {
        this.cargandoPromotores = false;
        const promotores = hayFiltros ? response.promotores : response;
        
        this.promotoresPage = {
          content: promotores,
          totalElements: promotores.length,
          totalPages: 1,
          number: 0,
          size: promotores.length
        };
      },
      error: (error) => {
        this.cargandoPromotores = false;
        console.error('Error al cargar promotores:', error);
        this.openMensaje('Error al cargar la lista de promotores');
      }
    });
  }

  /**
   * Maneja la búsqueda con filtros
   */
  onBuscarPromotores(filtros: {[key: string]: string}): void {
    this.filtrosActivos = { ...filtros };
    this.cargarPromotores();
  }

  /**
   * Carga los eventos específicos de un promotor y los disponibles
   */
  async gestionarEventos(promotor: Promotor): Promise<void> {
    this.promotorSeleccionado = promotor;
    this.mostrandoAsignacion = true;
    this.eventosSeleccionados = [];
    
    try {
      await Promise.all([
        this.cargarEventosPromotor(promotor.numeroDocumento),

      ]);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      this.openMensaje('Error al cargar los eventos');
    }
  }

  /**
   * Carga los eventos específicos de un promotor
   */
  private cargarEventosPromotor(numeroDocumento: string): Promise<void> {

    this.cargandoEventos = true;

    return new Promise((resolve) => {
      this.promotoresService.getPromotorByNumeroDocumento(numeroDocumento).subscribe({
        next: (response) => {
          this.eventosSeleccionados = response.eventosAsignados?.map((e: any) => e.id) || [];
          this.eventosDisponibles = response.eventos || [];

          this.cargandoEventos = false;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar eventos del promotor:', error);
          this.cargandoEventos = false;
          resolve();
        }
      });
    });
  }


  /**
   * Alterna la selección de un evento
   */
  toggleEventoSeleccion(eventoId: number): void {
    const index = this.eventosSeleccionados.indexOf(eventoId);
    if (index > -1) {
      this.eventosSeleccionados.splice(index, 1);
    } else {
      this.eventosSeleccionados.push(eventoId);
    }
  }

  /**
   * Selecciona o deselecciona todos los eventos
   */
  toggleTodosEventos(): void {
    if (this.eventosSeleccionados.length === this.eventosDisponibles.length) {
      this.eventosSeleccionados = [];
    } else {
      this.eventosSeleccionados = this.eventosDisponibles.map(e => e.id);
    }
  }

  /**
   * Asigna los eventos seleccionados al promotor
   */
  asignarEventos(): void {
    if (!this.promotorSeleccionado) {
      this.openMensaje('No hay promotor seleccionado');
      return;
    }

    this.asignandoEventos = true;

    this.promotoresService.asignarEventos(
      this.promotorSeleccionado.numeroDocumento, 
      this.eventosSeleccionados
    ).subscribe({
      next: () => {
        this.asignandoEventos = false;
        
        const mensaje = this.eventosSeleccionados.length === 0 
          ? 'Todos los eventos han sido removidos del promotor'
          : `${this.eventosSeleccionados.length} evento(s) asignado(s) exitosamente`;

        this.openMensaje(mensaje);
        this.cargarPromotores();
        this.cerrarAsignacion();
      },
      error: (error) => {
        this.asignandoEventos = false;
        console.error('Error al asignar eventos:', error);
        this.openMensaje('Error al asignar los eventos');
      }
    });
  }

  /**
   * Cierra la sección de asignación de eventos
   */
  cerrarAsignacion(): void {
    this.mostrandoAsignacion = false;
    this.promotorSeleccionado = null;
    this.eventosSeleccionados = [];
    this.eventosDisponibles = [];
  }

  /**
   * Navega de vuelta al menú principal
   */
  goBack(): void {
    this.router.navigate(['/administradores/admin', this.nombre]);
  }

  /**
   * Abre el modal de mensaje
   */
  private openMensaje(mensaje: string): void {
    const screenWidth = screen.width;
    const isMobile = screenWidth <= 600;
    
    this.dialog.open(MensajeComponent, {
      width: isMobile ? '100%' : '500px',
      maxWidth: isMobile ? '100%' : '80vw',
      height:  'auto',
      data: { mensaje }
    });
  }
}
