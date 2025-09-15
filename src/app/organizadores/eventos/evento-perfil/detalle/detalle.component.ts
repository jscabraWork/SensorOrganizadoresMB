import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../../../../commons-ui/base.component';
import { ReporteDataService } from '../../../../service/data/reporte-data.service';
import { DetalleEvento } from '../../../../models/reporte/detalle';
import { ResumenEvento } from '../../../../models/reporte/resumen';
import { TituloComponent } from '../../../iu/titulo/titulo.component';
import { ErrorComponent } from '../../../iu/error/error.component';
import { TablaOrganizadoresComponent, ColumnaTabla } from '../../../iu/tabla-organizadores/tabla-organizadores.component';

@Component({
  selector: 'app-detalle',
  imports: [CommonModule, FormsModule, TituloComponent, ErrorComponent, TablaOrganizadoresComponent],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class DetalleComponent extends BaseComponent implements OnInit {

  idEvento: string = '';
  evento: any = null;
  detalle: DetalleEvento[] = [];
  resumen: ResumenEvento = null;

  localidadIdSeleccionada: number = -1;

  opcionesLocalidades: { value: number, label: string }[] = [];
  
  // Control de expansión de filas
  filasExpandidas: Set<number> = new Set();
  
  // Control de vista de resumen
  vistaResumen: 'financiero' | 'asistentes' = 'financiero';

  // Configuración de columnas para la tabla
  columnasTabla: ColumnaTabla[] = [
    { key: 'tarifa', label: 'Tarifa', tipo: 'texto' },
    { key: 'localidad', label: 'Localidad', tipo: 'texto' },
    { key: 'precio', label: 'Precio', tipo: 'moneda', alineacion: 'right' },
    { key: 'servicio', label: 'Servicio', tipo: 'moneda', alineacion: 'right' },
    { key: 'iva', label: 'IVA', tipo: 'moneda', alineacion: 'right' },
    { key: 'precioTotal', label: 'Precio Total', tipo: 'moneda', alineacion: 'right' },
    { key: 'vendidos', label: 'Vendidos', tipo: 'texto', alineacion: 'center' },
    { key: 'reservados', label: 'Reservados', tipo: 'texto', alineacion: 'center' },
    { key: 'proceso', label: 'En Proceso', tipo: 'texto', alineacion: 'center' },
    { key: 'totalTickets', label: 'Total', tipo: 'texto', alineacion: 'center' },
    { key: 'porcentajeOcupacion', label: 'Ocupación', tipo: 'porcentaje', alineacion: 'center' },
    { key: 'totalRecaudado', label: 'Total Recaudado', tipo: 'moneda', alineacion: 'right' }
  ];

  // Totales para el pie de tabla
  get totalesTabla() {
    if (!this.detalle?.length) return {};
    
    return {
      'vendidos': this.getTotalVendidos,
      'reservados': this.getTotalReservados,
      'proceso': this.getTotalEnProceso,
      'totalTickets': this.getTotalTickets,
      'porcentajeOcupacion': `${this.getPromedioOcupacion.toFixed(2)}%`,
      'totalRecaudado': new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(this.getTotalRecaudado)
    };
  }

  constructor(
    protected override dialog: MatDialog,
    protected override route: ActivatedRoute,
    private reporteService: ReporteDataService
  ) {
    super(dialog, route);
    this.pathVariableName = 'idEvento';
  }

  protected override onPathVariableChanged(value: string | null): void {
    if (value) {
      this.idEvento = value;
    }
  }

  protected override cargarDatos(): void {
    if (this.idEvento) {
      this.cargarDetalle();
    }
  }

  cargarDetalle() {
    this.iniciarCarga();

    
    this.reporteService.getDetalleEvento(
      this.idEvento,
      undefined, // tarifaId
      this.localidadIdSeleccionada, // localidadId
      undefined  // diaId
    ).subscribe({
      next: (response) => {
        this.evento = response.evento;
        this.detalle = response.detalle;
        this.resumen = response.resumen;
        // Extraer opciones únicas de filtros desde los datos
        this.extraerOpcionesFiltros();
        this.finalizarCarga();
      },
      error: (error) => {
        this.manejarError(error, 'Error al cargar el detalle de ventas');
      }
    });
  }

  // Método para extraer opciones de filtros únicos
  private extraerOpcionesFiltros(): void {
    if (!this.detalle?.length) return;

    if (this.opcionesLocalidades.length>0) return;
    
    // Extraer localidades únicas usando Map para evitar duplicados
    const localidadesMap = new Map();
    this.detalle.forEach(item => {
      if (item.localidadId && item.localidad) {
        localidadesMap.set(item.localidadId, item.localidad);
      }
    });
    
    this.opcionesLocalidades = Array.from(localidadesMap.entries()).map(([id, nombre]) => ({
      value: id,
      label: nombre
    }));
  }

  // Método para actualizar filtros
  actualizarFiltros(localidadId?: number) {
    this.localidadIdSeleccionada = localidadId;
    this.cargarDatos();
  }

  // Métodos para calcular totales
  get getTotalVendidos(): number {
    return this.detalle.reduce((total, item) => total + item.vendidos, 0);
  }

  get getTotalReservados(): number {
    return this.detalle.reduce((total, item) => total + item.reservados, 0);
  }

  get getTotalEnProceso(): number {
    return this.detalle.reduce((total, item) => total + item.proceso, 0);
  }

  get getTotalTickets(): number {
    return this.detalle.reduce((total, item) => total + item.totalTickets, 0);
  }

  get getTotalRecaudado(): number {
    return this.detalle.reduce((total, item) => total + item.totalRecaudado, 0);
  }

  get getPromedioOcupacion(): number {
    if (this.detalle.length === 0) return 0;
    const totalOcupacion = this.detalle.reduce((total, item) => total + item.porcentajeOcupacion, 0);
    return totalOcupacion / this.detalle.length;
  }

  // Métodos para expansión de filas
  toggleFilaExpandida(index: number): void {
    if (this.filasExpandidas.has(index)) {
      this.filasExpandidas.delete(index);
    } else {
      this.filasExpandidas.add(index);
    }
  }

  isFilaExpandida(index: number): boolean {
    return this.filasExpandidas.has(index);
  }

  // Método para obtener datos expandidos para la tabla
  obtenerDatosExpandidos = (item: DetalleEvento) => {
    return {
      'Total Recaudado': item.totalRecaudado,
      'Disponibles': item.disponibles,
      'Vendidos': item.vendidos,
      'Reservados': item.reservados,
      'En Proceso': item.proceso,
      'Utilizados': item.utilizados
    };
  };

  // Método para manejar fila expandida de la tabla
  onFilaExpandida(event: { item: any, index: number, expandido: boolean }): void {
    if (event.expandido) {
      this.filasExpandidas.add(event.index);
    } else {
      this.filasExpandidas.delete(event.index);
    }
  }

}
