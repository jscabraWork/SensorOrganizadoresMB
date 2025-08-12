import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleComponent } from '../../commons-ui/title/title.component';
import { TableComponent, Page, ExpandedRowConfig, ColumnaBotonConfig } from '../../commons-ui/table/table.component';
import { SearchFilterComponent, Filter } from '../../commons-ui/search-filter/search-filter.component';
import { AsignarEventosModalComponent } from '../../commons-components/asignar-eventos-modal/asignar-eventos-modal.component';
import { HardcodedAutheticationService } from '../../service/hardcoded-authetication.service';
import { PuntosFisicosDataService } from '../../service/data/puntosfisicos-data.service';
import { PuntoFisico } from '../../models/puntofisico.model';
import { Evento } from '../../models/evento.model';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../mensaje/mensaje.component';

@Component({
  selector: 'app-puntos-fisicos',
  imports: [
    CommonModule,
    FormsModule,
    TitleComponent,
    TableComponent,
    SearchFilterComponent,
    AsignarEventosModalComponent
  ],
  templateUrl: './puntos-fisicos.component.html',
  styleUrl: './puntos-fisicos.component.scss'
})
export class PuntosFisicosComponent implements OnInit {

  // Variables para la tabla de puntos físicos
  puntosFisicosPage: Page<PuntoFisico> | null = null;
  cargandoPuntosFisicos: boolean = false;
  
  // Variables para eventos
  eventosDisponibles: Evento[] = [];
  eventosSeleccionados: number[] = [];
  puntoFisicoSeleccionado: PuntoFisico | null = null;
  
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
        action: (puntoFisico: PuntoFisico) => this.gestionarEventos(puntoFisico)
      }
    ]
  };

  // Configuración de botones en columnas de la tabla
  columnaBotones: ColumnaBotonConfig[] = [
    {
      columna: 'acciones',
      texto: 'Eventos',
      clase: 'button-primary',
      accion: (puntoFisico: PuntoFisico) => this.gestionarEventos(puntoFisico)
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autenticado: HardcodedAutheticationService,
    private puntosFisicosService: PuntosFisicosDataService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();
    this.cargarPuntosFisicos();
  }

  /**
   * Carga todos los puntos físicos
   */
  cargarPuntosFisicos(): void {
    this.cargandoPuntosFisicos = true;
    
    // Determinar si usar filtros o cargar todos
    const hayFiltros = Object.values(this.filtrosActivos).some(valor => valor?.trim());
    
    const observable = hayFiltros 
      ? this.puntosFisicosService.filtrarPuntosFisicos(
          this.filtrosActivos['nombre'],
          this.filtrosActivos['numeroDocumento'], 
          this.filtrosActivos['correo']
        )
      : this.puntosFisicosService.listar();

    observable.subscribe({
      next: (response) => {
        this.cargandoPuntosFisicos = false;
        const puntosFisicos = hayFiltros ? response.puntosFisicos : response;
        
        this.puntosFisicosPage = {
          content: puntosFisicos,
          totalElements: puntosFisicos.length,
          totalPages: 1,
          number: 0,
          size: puntosFisicos.length
        };
      },
      error: (error) => {
        this.cargandoPuntosFisicos = false;
        console.error('Error al cargar puntos físicos:', error);
        this.openMensaje('Error al cargar la lista de puntos físicos');
      }
    });
  }

  /**
   * Maneja la búsqueda con filtros
   */
  onBuscarPuntosFisicos(filtros: {[key: string]: string}): void {
    this.filtrosActivos = { ...filtros };
    this.cargarPuntosFisicos();
  }

  /**
   * Carga los eventos específicos de un punto físico y los disponibles
   */
  async gestionarEventos(puntoFisico: PuntoFisico): Promise<void> {
    this.puntoFisicoSeleccionado = puntoFisico;
    this.mostrandoAsignacion = true;
    this.eventosSeleccionados = [];
    
    try {
      await Promise.all([
        this.cargarEventosPuntoFisico(puntoFisico.numeroDocumento),
      ]);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      this.openMensaje('Error al cargar los eventos');
    }
  }

  /**
   * Carga los eventos específicos de un punto físico
   */
  private cargarEventosPuntoFisico(numeroDocumento: string): Promise<void> {

    this.cargandoEventos = true;

    return new Promise((resolve) => {
      this.puntosFisicosService.getPuntoFisicoByNumeroDocumento(numeroDocumento).subscribe({
        next: (response) => {
          this.eventosSeleccionados = response.eventosAsignados?.map((e: any) => e.id) || [];
          this.eventosDisponibles = response.eventos || [];

          resolve();
          this.cargandoEventos = false;
        },
        error: (error) => {
          console.error('Error al cargar eventos del punto físico:', error);
          resolve();
          this.cargandoEventos = false;
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
   * Asigna los eventos seleccionados al punto físico
   */
  asignarEventos(): void {
    if (!this.puntoFisicoSeleccionado) {
      this.openMensaje('No hay punto físico seleccionado');
      return;
    }

    this.asignandoEventos = true;

    this.puntosFisicosService.asignarEventos(
      this.puntoFisicoSeleccionado.numeroDocumento, 
      this.eventosSeleccionados
    ).subscribe({
      next: () => {
        this.asignandoEventos = false;
        
        const mensaje = this.eventosSeleccionados.length === 0 
          ? 'Todos los eventos han sido removidos del punto físico'
          : `${this.eventosSeleccionados.length} evento(s) asignado(s) exitosamente`;

        this.openMensaje(mensaje);
        this.cargarPuntosFisicos();
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
    this.puntoFisicoSeleccionado = null;
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
