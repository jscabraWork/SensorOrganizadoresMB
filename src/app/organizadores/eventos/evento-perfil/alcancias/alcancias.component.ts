import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../../../../commons-ui/base.component';
import { ReporteDataService } from '../../../../service/data/reporte-data.service';
import { Alcancia } from '../../../../models/alcancia.model';
import { TituloComponent } from '../../../iu/titulo/titulo.component';
import { ErrorComponent } from '../../../iu/error/error.component';
import { TablaOrganizadoresComponent, ColumnaTabla } from '../../../iu/tabla-organizadores/tabla-organizadores.component';
import { EstadoSubmenuComponent, OpcionEstado } from '../../../iu/estado-submenu/estado-submenu.component';

@Component({
  selector: 'app-alcancias',
  imports: [CommonModule, TituloComponent, ErrorComponent, TablaOrganizadoresComponent, EstadoSubmenuComponent],
  templateUrl: './alcancias.component.html',
  styleUrl: './alcancias.component.scss'
})
export class AlcanciasComponent extends BaseComponent implements OnInit {

  idEvento: string = '';
  evento: any = null;
  alcancias: Alcancia[] = [];
  todasLasAlcancias: Alcancia[] = [];
  estadoSeleccionado?: number;
  estadisticas = {
    totalAlcancias: 0,
    totalActivas: 0,
    totalPagadas: 0,
    totalDevueltas: 0,
    totalRecaudado: 0,
    totalPorPagar: 0,
    porcentajePagadoGeneral: 0
  };

  opcionesEstado: OpcionEstado[] = [
    { value: undefined, label: 'Todas' },
    { value: 1, label: 'Activas' },
    { value: 0, label: 'Pagadas' },
    { value: 2, label: 'Devueltas' }
  ];

  // Configuración de columnas para la tabla
  columnasTabla: ColumnaTabla[] = [
    { key: 'id', label: 'ID', alineacion: 'center' },
    { key: 'creationDate', label: 'Fecha Apertura', tipo: 'fecha' },
    { key: 'estadoTexto', label: 'Estado' },
    { key: 'localidad', label: 'Localidad' },
    { key: 'precioTotal', label: 'Precio Total', tipo: 'moneda', alineacion: 'right' },
    { key: 'precioParcialPagado', label: 'Parcial Pagado', tipo: 'moneda', alineacion: 'right' },
    { key: 'porcentajePagado', label: 'Porcentaje Pagado', tipo: 'porcentaje', alineacion: 'center' },
    { key: 'cliente.nombre', label: 'Cliente' },
    { key: 'cliente.numeroDocumento', label: 'Documento' }
  ];

  // Getter para las alcancías con estado como texto
  get alcanciasConEstadoTexto(): any[] {
    return this.alcancias.map(alcancia => ({
      ...alcancia,
      estadoTexto: this.getEstado(alcancia.estado)
    }));
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
      this.cargarAlcancias();
    }
  }

  cargarAlcancias() {
    this.iniciarCarga();
    
    this.reporteService.getAlcanciasByEventoAndEstado(
      parseInt(this.idEvento),
      this.estadoSeleccionado
    ).subscribe({
      next: (response) => {
        this.evento = response.evento;
        this.alcancias = this.procesarAlcancias(response.alcancias || []);
        
        // Calcular estadísticas solo si cargamos todas (sin filtro)
        if (this.estadoSeleccionado === undefined) {
          this.todasLasAlcancias = this.alcancias;
          this.calcularEstadisticas();
        }
        
        this.finalizarCarga();
      },
      error: (error) => {
        this.manejarError(error, 'Error al cargar las alcancías');
      }
    });
  }

  private procesarAlcancias(alcancias: Alcancia[]): any[] {
    return alcancias.map(alcancia => ({
      ...alcancia,
      porcentajePagado: this.calcularPorcentajePagado(alcancia.precioParcialPagado, alcancia.precioTotal)
    }));
  }

  // Método para cambiar estado desde el submenu
  onCambioEstado(nuevoEstado: number | undefined) {
    this.estadoSeleccionado = nuevoEstado;
    this.cargarDatos();
  }

  // Método para obtener texto del estado
  getEstado(estado: number): string {
    switch (estado) {
      case 0: return 'Pagada';
      case 1: return 'Activa';
      case 2: return 'Devuelta';
      default: return 'Desconocido';
    }
  }

  // Método para obtener clase CSS del estado
  getEstadoClase(estado: number): string {
    switch (estado) {
      case 0: return 'estado-pagada';
      case 1: return 'estado-activa';
      case 2: return 'estado-devuelta';
      default: return '';
    }
  }

  // Calcular porcentaje pagado
  private calcularPorcentajePagado(parcialPagado: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((parcialPagado / total) * 100);
  }

  // Calcular estadísticas generales
  private calcularEstadisticas() {
    this.estadisticas.totalAlcancias = this.todasLasAlcancias.length;
    this.estadisticas.totalActivas = this.todasLasAlcancias.filter(a => a.estado === 1).length;
    this.estadisticas.totalPagadas = this.todasLasAlcancias.filter(a => a.estado === 0).length;
    this.estadisticas.totalDevueltas = this.todasLasAlcancias.filter(a => a.estado === 2).length;
    
    // Excluir alcancías devueltas de los cálculos monetarios
    const alcanciasValidas = this.todasLasAlcancias.filter(a => a.estado !== 2);
    
    this.estadisticas.totalRecaudado = alcanciasValidas.reduce((total, a) => total + (a.precioParcialPagado || 0), 0);
    
    const totalPorCobrar = alcanciasValidas.reduce((total, a) => total + (a.precioTotal || 0), 0);
    this.estadisticas.totalPorPagar = totalPorCobrar - this.estadisticas.totalRecaudado;
    
    this.estadisticas.porcentajePagadoGeneral = totalPorCobrar > 0 
      ? Math.round((this.estadisticas.totalRecaudado / totalPorCobrar) * 100)
      : 0;
  }

  // Función para obtener datos expandidos
  obtenerDatosExpandidos = (item: any) => {
    return {
      'Fecha Apertura': item.creationDate,
      'Estado': item.estadoTexto,
      'Localidad': item.localidad,
      'Cantidad Tickets': item.tickets?.length || 0,
      'Precio Total': item.precioTotal,
      'Parcial Pagado': item.precioParcialPagado,
      'Cliente': item.cliente?.nombre || 'N/A',
      'Documento': item.cliente?.numeroDocumento || 'N/A'
    };
  };
}
