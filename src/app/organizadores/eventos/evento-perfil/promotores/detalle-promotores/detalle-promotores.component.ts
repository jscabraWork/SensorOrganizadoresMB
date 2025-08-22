import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../../../../../commons-ui/base.component';
import { ReporteDataService } from '../../../../../service/data/reporte-data.service';
import { ReporteVendedores } from '../../../../../models/reporte/reporte_vendedores.model';
import { Ticket } from '../../../../../models/ticket.model';
import { TituloComponent } from '../../../../iu/titulo/titulo.component';
import { ErrorComponent } from '../../../../iu/error/error.component';
import { TablaOrganizadoresComponent, ColumnaTabla } from '../../../../iu/tabla-organizadores/tabla-organizadores.component';
import { EstadisticasCardsComponent, EstadisticaCard } from '../../../../iu/estadisticas-cards/estadisticas-cards.component';

@Component({
  selector: 'app-detalle-promotores',
  imports: [CommonModule, TituloComponent, ErrorComponent, TablaOrganizadoresComponent, EstadisticasCardsComponent],
  templateUrl: './detalle-promotores.component.html',
  styleUrl: './detalle-promotores.component.scss'
})
export class DetallePromotoresComponent extends BaseComponent implements OnInit {

  idEvento: string = '';
  documentoPromotor: string = '';
  promotor: ReporteVendedores | null = null;
  tickets: Ticket[] = [];

  // Configuración de columnas para la tabla de tickets
  columnasTabla: ColumnaTabla[] = [
    { key: 'id', label: 'ID', alineacion: 'center' },
    { key: 'numero', label: 'Número' },
    { key: 'tarifa.nombre', label: 'Tarifa' },
    { key: 'tarifa.precio', label: 'Precio', tipo: 'moneda', alineacion: 'right' },
    { key: 'tarifa.servicio', label: 'Servicio', tipo: 'moneda', alineacion: 'right' },
    { key: 'tarifa.iva', label: 'IVA', tipo: 'moneda', alineacion: 'right' },
    { key: 'precioTotal', label: 'Precio Total', tipo: 'moneda', alineacion: 'right' },
    { key: 'localidad', label: 'Localidad' }
  ];

  constructor(
    protected override dialog: MatDialog,
    protected override route: ActivatedRoute,
    private router: Router,
    private reporteService: ReporteDataService
  ) {
    super(dialog, route);
    this.pathVariableName = 'idEvento';
  }

  override ngOnInit() {
    super.ngOnInit();
    // También necesitamos obtener el documento del promotor de los parámetros
    this.route.params.subscribe(params => {
      this.documentoPromotor = params['idPromotor'];
      if (this.idEvento && this.documentoPromotor) {
        this.cargarDatos();
      }
    });
  }

  protected override onPathVariableChanged(value: string | null): void {
    if (value) {
      this.idEvento = value;
      if (this.documentoPromotor) {
        this.cargarDatos();
      }
    }
  }

  protected override cargarDatos(): void {
    if (this.idEvento && this.documentoPromotor) {
      this.cargarDetallePromotor();
    }
  }

  cargarDetallePromotor() {
    this.iniciarCarga();
    
    this.reporteService.getVentasByEventoIdAndPromotor(
      parseInt(this.idEvento), 
      this.documentoPromotor
    ).subscribe({
      next: (response) => {
        this.promotor = response.resumen;
        this.tickets = (response.ventas || []).map(ticket => ({
          ...ticket,
          precioTotal: (ticket.tarifa?.precio || 0) + (ticket.tarifa?.servicio || 0) + (ticket.tarifa?.iva || 0)
        }));
        this.finalizarCarga();
      },
      error: (error) => {
        this.manejarError(error, 'Error al cargar el detalle del promotor');
      }
    });
  }

  // Getter para estadísticas del promotor
  get estadisticasPromotor(): EstadisticaCard[] {
    if (!this.promotor) return [];

    const totalTickets = this.tickets.length;
    const totalPrecio = this.tickets.reduce((total, t) => total + (t.tarifa?.precio || 0), 0);
    const totalServicio = this.tickets.reduce((total, t) => total + (t.tarifa?.servicio || 0), 0);
    const totalIva = this.tickets.reduce((total, t) => total + (t.tarifa?.iva || 0), 0);

    return [
      { titulo: 'Tickets Vendidos', valor: totalTickets },
      { 
        titulo: 'Total Precio', 
        valor: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalPrecio)
      },
      { 
        titulo: 'Total Servicio', 
        valor: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalServicio)
      },
      { 
        titulo: 'Total IVA', 
        valor: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalIva)
      },
      { 
        titulo: 'Total Recaudado', 
        valor: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(this.promotor.recaudado),
        tipo: 'highlight' 
      }
    ];
  }

  // Función para obtener datos expandidos
  obtenerDatosExpandidos = (item: Ticket) => {
    return {
      'ID': item.id,
      'Número': item.numero || 'No numerado',
      'Tarifa': item.tarifa?.nombre || 'No asignada',
      'Precio': item.tarifa?.precio || 0,
      'Servicio': item.tarifa?.servicio || 0,
      'IVA': item.tarifa?.iva || 0,
      'Precio Total': item.tarifa?.precio + item.tarifa?.servicio + item.tarifa?.iva || 0,
      'Localidad': item.localidad || 'N/A'
    };
  };

  // Método para volver a la lista de promotores
  volver() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
