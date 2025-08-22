import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../../commons-ui/base.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ReporteDataService } from '../../../../service/data/reporte-data.service';
import { Historial, HistorialDTO } from '../../../../models/reporte/historial.model';
import { TablaOrganizadoresComponent, ColumnaTabla } from '../../../iu/tabla-organizadores/tabla-organizadores.component';
import { EstadoSubmenuComponent, OpcionEstado } from '../../../iu/estado-submenu/estado-submenu.component';
import { PaginacionComponent, PaginacionConfig, PaginacionEvent } from '../../../iu/paginacion/paginacion.component';
import { TituloComponent } from '../../../iu/titulo/titulo.component';
import { ErrorComponent } from '../../../iu/error/error.component';


@Component({
  selector: 'app-historial',
  imports: [CommonModule, FormsModule, PaginacionComponent, EstadoSubmenuComponent, TablaOrganizadoresComponent, TituloComponent, ErrorComponent],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss'
})
export class HistorialComponent extends BaseComponent implements OnInit {

  idEvento: string = '';
  evento: any = null;
  historial: HistorialDTO[] = [];
  
  // Filtros
  statusSeleccionado: number = 34; // 34 = aprobado por defecto
  tipoSeleccionado?: number | null;
  fechaInicio?: string;
  fechaFin?: string;
  
  // Paginación
  paginacionConfig: PaginacionConfig = {
    currentPage: 0,
    totalPages: 0,
    pageSize: 25,
    totalElements: 0
  };
  
  // Control de expansión de filas
  filasExpandidas: Set<number> = new Set();
  
  // Opciones para tipos según especificación
  opcionesTipo = [
    { value: null, label: 'Todos los tipos' },
    { value: 1, label: 'Compra Estándar' },
    { value: 3, label: 'Creación de Alcancía' },
    { value: 4, label: 'Aporte a alcancía' },
    { value: 5, label: 'Traspaso de tickets' },
    { value: 6, label: 'Asignaciónes' }
  ];

  // Estados para el submenu
  opcionesEstado: OpcionEstado[] = [
    { value: 34, label: 'Aprobadas' },
    { value: 36, label: 'Rechazadas' },
    { value: 35, label: 'En Proceso' }
  ];

  // Configuración de columnas para la tabla
  columnasTabla: ColumnaTabla[] = [
    { key: 'venta.ordenId', label: 'Orden' },
    { key: 'venta.fecha', label: 'Fecha', tipo: 'fecha' },
    { key: 'venta.tipoNombre', label: 'Tipo' },
    { key: 'venta.tarifa', label: 'Tarifa' },
    { key: 'venta.localidad', label: 'Localidad' },
    { key: 'venta.cantidad', label: 'Cantidad', alineacion: 'center' },
    { key: 'venta.valorOrden', label: 'Valor', tipo: 'moneda', alineacion: 'right' },
    { key: 'venta.metodo', label: 'Método' },
    { key: 'venta.promotor', label: 'Promotor' },
    { key: 'venta.nombre', label: 'Cliente' },
    { key: 'venta.documento', label: 'Documento' },
    { key: 'venta.correo', label: 'Correo' }
  ];

  constructor(
    protected override dialog: MatDialog,
    protected override route: ActivatedRoute,
    private reporteService: ReporteDataService
  ) {
    super(dialog, route);
    this.pathVariableName = 'idEvento';
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  protected override onPathVariableChanged(value: string | null): void {
    if (value) {
      this.idEvento = value;
    }
  }

  protected override cargarDatos(): void {
    if (this.idEvento) {
      this.cargarHistorial();
    }
  }

  cargarHistorial() {
    this.iniciarCarga();
    
    this.reporteService.getHistorialTransaccionesEvento(
      parseInt(this.idEvento),
      this.statusSeleccionado,
      this.paginacionConfig.currentPage,
      this.paginacionConfig.pageSize,
      this.fechaInicio,
      this.fechaFin,
      this.tipoSeleccionado
    ).subscribe({
      next: (response) => {
        this.evento = response.evento;
        this.historial = response.historial || [];
        // Actualizar configuración de paginación
        this.paginacionConfig = {
          currentPage: response.page || 0,
          totalPages: response.totalPages,
          pageSize: this.paginacionConfig.pageSize,
          totalElements: response.totalElements
        };
        
        this.finalizarCarga();
      },
      error: (error) => {
        this.manejarError(error, 'Error al cargar el historial de transacciones');
      }
    });
  }

  // Método para actualizar filtros
  actualizarFiltros() {
    this.paginacionConfig.currentPage = 0; // Resetear a primera página
    this.cargarDatos();
  }

  // Manejar cambio de página
  onPaginacionChange(event: PaginacionEvent) {
    this.paginacionConfig.currentPage = event.page;
    this.paginacionConfig.pageSize = event.size;
    this.cargarDatos();
  }

  // Métodos para expansión de filas
  onFilaExpandida(event: { item: any, index: number, expandido: boolean }): void {
    if (event.expandido) {
      this.filasExpandidas.add(event.index);
    } else {
      this.filasExpandidas.delete(event.index);
    }
  }

  isFilaExpandida(index: number): boolean {
    return this.filasExpandidas.has(index);
  }

  // Métodos de utilidad para mostrar datos
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  formatearMoneda(valor: number): string {
    if (valor === null || valor === undefined) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  // Método para cambiar estado desde el submenu
  onCambioEstado(nuevoEstado: number) {
    this.statusSeleccionado = nuevoEstado;
    this.actualizarFiltros();
  }

  getEstadoTexto(estado: number): string {
    switch (estado) {
      case 34: return 'Aprobado';
      case 36: return 'Rechazado';
      case 35: return 'Pendiente';
      default: return 'Desconocido';
    }
  }

  getTicketEstadoTexto(estado: number): string {
    switch (estado) {
      case 0: return 'Disponible';
      case 1: return 'Vendido';
      case 2: return 'Reservado';
      case 3: return 'En Proceso';
      default: return 'No Disponible';
    }
  }

  // Función para obtener datos expandidos
  obtenerDatosExpandidos = (item: HistorialDTO) => {
    return {
      'Email': item.venta.correo || 'N/A',
      'Teléfono': item.venta.telefono || 'N/A', 
      'Documento': item.venta.documento || 'N/A',
      'Localidad': item.venta.localidad,
      'Etapa': item.venta.tarifa,
      'Valor': this.formatearMoneda(item.venta.valorOrden),
      ...(item.venta.promotor && {
        'Promotor': `${item.venta.promotor} (${item.venta.promotorNumeroDocumento})`
      }),
      ...(item.venta.precioParcialPagado && {
        'Parcial Pagado': this.formatearMoneda(item.venta.precioParcialPagado)
      })
    };
  }


  // Método para descargar Excel
  descargarExcel() {
    if (!this.idEvento) return;
    
    this.reporteService.descargarExcelHistorialTransacciones(
      parseInt(this.idEvento),
      this.statusSeleccionado
    ).subscribe({
      next: (blob) => {
        // Crear URL del blob
        const url = window.URL.createObjectURL(blob);
        
        // Crear elemento <a> temporal para descargar
        const link = document.createElement('a');
        link.href = url;
        
        // Generar nombre del archivo con timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
        const estadoTexto = this.getEstadoTexto(this.statusSeleccionado).toLowerCase();
        link.download = `historial_${estadoTexto}_${this.idEvento}_${timestamp}.xlsx`;
        
        // Simular click para descargar
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.manejarError(error, 'Error al descargar el archivo Excel');
      }
    });
  }

}
