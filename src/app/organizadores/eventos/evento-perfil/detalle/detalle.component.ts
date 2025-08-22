import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../../../../commons-ui/base.component';
import { ReporteDataService } from '../../../../service/data/reporte-data.service';
import { DetalleEvento } from './detalle';
import { ResumenEvento } from '../resumen/resumen';

@Component({
  selector: 'app-detalle',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class DetalleComponent extends BaseComponent implements OnInit {

  idEvento: string = '';
  evento: any = null;
  detalle: DetalleEvento[] = [];
  resumen: ResumenEvento = null;

  localidadIdSeleccionada?: number;
  
  opcionesLocalidades: { value: number, label: string }[] = [];
  
  // Control de expansión de filas
  filasExpandidas: Set<number> = new Set();
  
  // Control de vista de resumen
  vistaResumen: 'financiero' | 'asistentes' = 'financiero';

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
    
    // Solo pasar localidadId si tiene un valor válido
    const localidadId = this.localidadIdSeleccionada && this.localidadIdSeleccionada > 0 
      ? this.localidadIdSeleccionada 
      : undefined;
    
    this.reporteService.getDetalleEvento(
      this.idEvento,
      undefined, // tarifaId
      localidadId, // localidadId
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

}
