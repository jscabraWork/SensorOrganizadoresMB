import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Transaccion } from '../../models/transaccion.model';
import { Page } from '../../models/page.mode';
import { ExpandedRowConfig, TableComponent } from '../../commons-ui/table/table.component';
import { Filter, SearchFilterComponent } from '../../commons-ui/search-filter/search-filter.component';
import { TransaccionesDataService } from '../../service/data/transacciones-data.service';

@Component({
  selector: 'app-transacciones',
  imports: [
          CommonModule,
          RouterModule,
          FormsModule,
          TableComponent,
          SearchFilterComponent
        ],
  templateUrl: './transacciones.component.html',
  styleUrl: './transacciones.component.scss'
})
export class TransaccionesComponent implements OnInit{

  // Pagination state
  paginaActual: number = 0;
  sizePagina: number = 25;
  totalTransacciones: number = 0;
  
  // Data and selection state
  cargando: boolean = false;
  selectedItem: number | null = null;
  transaccionSeleccionada: Transaccion | null = null;
  transaccionesPage: Page<Transaccion> | null = null;

  // Filter state
  filtros = {
    numeroDocumento: '',
    correo: '',
    fechaInicio: '',
    fechaFin: '',
    estado: undefined as number | undefined,
    metodo: undefined as number | undefined,
    metodoNombre: ''
  };

  // Configuration objects
  searchFilters: Filter[] = [
    {
      key: 'numeroDocumento',
      value: '',
      type: 'text',
      placeholder: 'Buscar por número de documento',
      label: 'Número de Documento',
onEnter: (valor: string) => this.buscarPorDocumento(valor)
    },
    {
      key: 'correo',
      value: '',
      type: 'text',
      placeholder: 'Buscar por correo electrónico',
      label: 'Correo Electrónico',
      onEnter: (valor: string) => this.buscarPorCorreo(valor)
    },
    {
      key: 'fechaInicio',
      value: '',
      type: 'date',
      label: 'Fecha Inicio',
      // Solo busca al hacer click en buscar
    },
    {
      key: 'fechaFin',
      value: '',
      type: 'date',
      label: 'Fecha Fin',
      // Solo busca al hacer click en buscar
    },
    {
      key: 'estado',
      value: '',
      type: 'select',
      label: 'Estado',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 34, label: 'Aprobadas' },
        { value: 36, label: 'Rechazadas' },
        { value: 35, label: 'Pendientes' }
      ],
      // Solo busca al hacer click en buscar
    },
    {
      key: 'metodo',
      value: '',
      type: 'select',
      label: 'Método de Pago',
      options: [
        { value: '', label: 'Todos los métodos' },
        { value: 1, label: 'Tarjeta Crédito' },
        { value: 2, label: 'PSE' },
        { value: 3, label: 'Datafono' },
        { value: 4, label: 'Efectivo' },
        { value: 5, label: 'Transferencia' },
        { value: 6, label: 'Token Tarjeta' }
      ],
      // Solo busca al hacer click en buscar
    },
    {
      key: 'metodoNombre',
      value: '',
      type: 'text',
      placeholder: 'Nombre del método de pago',
      label: 'Método Nombre',
      // Solo busca al hacer click en buscar
    }
  ];

  expandableConfig: ExpandedRowConfig = {
    infoFields: [
      { label: 'ID Transacción', property: 'id' },
      { label: 'Número de Documento', property: 'idPersona' },
      { label: 'Correo', property: 'correo' },
      { label: 'Fecha Inicio', property: 'fechaInicio' },
      { label: 'Fecha Fin', property: 'fechaFin' },
      { label: 'Estado', property: 'estado' },
      { label: 'Método', property: 'metodo' },
      { label: 'Método Nombre', property: 'metodoNombre' }
    ],
    actionButtons: [],
    selects: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private transaccionesService: TransaccionesDataService
  ){}

  ngOnInit(): void {
    this.establecerFiltrosPorDefecto();
    this.cargarTransacciones();
  }

  private establecerFiltrosPorDefecto(): void {
    const hoy = new Date();
    const primerDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    this.filtros.fechaInicio = this.formatearFecha(primerDiaDelMes);
    this.filtros.fechaFin = this.formatearFecha(ultimoDiaDelMes);
    this.filtros.estado = undefined; // Todas las transacciones por defecto
    
    // Actualizar valores en searchFilters
    const fechaInicioFilter = this.searchFilters.find(f => f.key === 'fechaInicio');
    const fechaFinFilter = this.searchFilters.find(f => f.key === 'fechaFin');
    const estadoFilter = this.searchFilters.find(f => f.key === 'estado');
    
    if (fechaInicioFilter) fechaInicioFilter.value = this.filtros.fechaInicio;
    if (fechaFinFilter) fechaFinFilter.value = this.filtros.fechaFin;
    if (estadoFilter) estadoFilter.value = this.filtros.estado;
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0]; // Formato yyyy-MM-dd
  }

  cargarTransacciones(): void {
    this.cargando = true;
    
    this.transaccionesService.getTransaccionesByFiltro(
      this.filtros.numeroDocumento || undefined,
      this.filtros.correo || undefined,
      this.filtros.fechaInicio || undefined,
      this.filtros.fechaFin || undefined,
      this.filtros.estado,
      this.filtros.metodo,
      this.filtros.metodoNombre || undefined,
      this.paginaActual,
      this.sizePagina
    ).subscribe({
      next: (response: any) => {

        console.log('Transacciones cargadas:', response);

        this.transaccionesPage = {
          content: response.transacciones?.map((transaccion: any) => ({
            ...transaccion,
            statusNombre: this.obtenerNombreStatus(transaccion.status),
            // Reemplazar valores null con "Sin definir"
            idPersona: transaccion.idPersona || 'Sin definir',
            email: transaccion.email || 'Sin definir',
            fullName: transaccion.fullName || 'Sin definir',
            phone: transaccion.phone || 'Sin definir',
            amount: transaccion.amount !== null && transaccion.amount !== undefined ? transaccion.amount : 'Sin definir',
            metodoNombre: transaccion.metodoNombre || 'Sin definir'
          })) || [],
          totalElements: response.total || 0,
          totalPages: response.totalPages || 0,
          size: this.sizePagina,
          number: response.currentPage || 0
        };
        this.totalTransacciones = response.total || 0;
        this.paginaActual = response.currentPage || 0;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando transacciones:', error);
        this.transaccionesPage = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: this.sizePagina,
          number: this.paginaActual
        };
        this.cargando = false;
      }
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.cargarTransacciones();
  }

  buscarPorDocumento(numeroDocumento: string): void {
    this.filtros.numeroDocumento = numeroDocumento?.trim() || '';
    this.buscarConFiltros();
  }

  buscarPorCorreo(correo: string): void {
    this.filtros.correo = correo?.trim() || '';
    this.buscarConFiltros();
  }

  buscarConFiltros(): void {
    // Actualizar filtros desde searchFilters
    this.searchFilters.forEach(filter => {
      if (this.filtros.hasOwnProperty(filter.key)) {
        (this.filtros as any)[filter.key] = filter.value;
      }
    });
    
    this.paginaActual = 0;
    this.cargarTransacciones();
  }

  limpiarFiltros(): void {
    // Restablecer filtros básicos
    this.filtros.numeroDocumento = '';
    this.filtros.correo = '';
    this.filtros.metodo = undefined;
    this.filtros.metodoNombre = '';
    
    // Restablecer valores por defecto
    this.establecerFiltrosPorDefecto();
    
    // Actualizar searchFilters
    this.searchFilters.forEach(filter => {
      switch (filter.key) {
        case 'numeroDocumento':
        case 'correo':
        case 'metodoNombre':
          filter.value = '';
          break;
        case 'metodo':
          filter.value = '';
          break;
        case 'fechaInicio':
          filter.value = this.filtros.fechaInicio;
          break;
        case 'fechaFin':
          filter.value = this.filtros.fechaFin;
          break;
        case 'estado':
          filter.value = '';
          break;
      }
    });
    
    // Resetear tamaño de página
    this.sizePagina = 25;
    this.paginaActual = 0;
    this.cargarTransacciones();
  }

  onExpandRow(transaccion: Transaccion | null): void {
    this.transaccionSeleccionada = transaccion;
  }

  cambiarsizePagina(event: any): void {
    this.sizePagina = parseInt(event.target.value);
    this.paginaActual = 0;
    this.cargarTransacciones();
  }

  obtenerNombreStatus(status: number): string {
    switch (status) {
      case 34:
        return 'Aprobada';
      case 35:
        return 'En Proceso';
      case 36:
        return 'Rechazada';
      case 4:
        return 'Devolución';
      case 5:
        return 'Fraude';
      case 7:
        return 'Asignación';
      case 6:
        return 'Upgrade';
      default:
        return `Estado ${status}`;
    }
  }

  // Métodos para manejar cambios en filtros
  cambiarFechaInicio(fecha: string): void {
    this.filtros.fechaInicio = fecha;
    this.paginaActual = 0;
    this.cargarTransacciones();
  }

  cambiarFechaFin(fecha: string): void {
    this.filtros.fechaFin = fecha;
    this.paginaActual = 0;
    this.cargarTransacciones();
  }

  cambiarEstado(estado: any): void {
    this.filtros.estado = estado;
    this.paginaActual = 0;
    this.cargarTransacciones();
  }

  cambiarMetodo(metodo: any): void {
    this.filtros.metodo = metodo || undefined;
    this.paginaActual = 0;
    this.cargarTransacciones();
  }

  cambiarMetodoNombre(metodoNombre: string): void {
    this.filtros.metodoNombre = metodoNombre;
    this.paginaActual = 0;
    this.cargarTransacciones();
  }

  cambiarTamañoPaginaDirecto(tamaño: number): void {
    this.sizePagina = tamaño;
    this.paginaActual = 0;
    this.cargarTransacciones();
  }
}
