import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../../../../commons-ui/base.component';
import { ReporteDataService } from '../../../../service/data/reporte-data.service';
import { ReporteVendedores } from '../../../../models/reporte/reporte_vendedores.model';
import { TituloComponent } from '../../../iu/titulo/titulo.component';
import { ErrorComponent } from '../../../iu/error/error.component';
import { TablaOrganizadoresComponent, ColumnaTabla, AccionTabla } from '../../../iu/tabla-organizadores/tabla-organizadores.component';
import { EstadisticasCardsComponent, EstadisticaCard } from '../../../iu/estadisticas-cards/estadisticas-cards.component';

@Component({
  selector: 'app-promotores',
  imports: [CommonModule, FormsModule, TituloComponent, ErrorComponent, TablaOrganizadoresComponent, EstadisticasCardsComponent],
  templateUrl: './promotores.component.html',
  styleUrl: './promotores.component.scss'
})
export class PromotoresComponent extends BaseComponent implements OnInit {

  idEvento: string = '';
  evento: any = null;
  promotores: ReporteVendedores[] = [];
  todosLosPromotores: ReporteVendedores[] = [];
  filtroTexto: string = '';

  // Configuración de columnas para la tabla
  columnasTabla: ColumnaTabla[] = [
    { key: 'documento', label: 'Documento' },
    { key: 'nombre', label: 'Promotor' },
    { key: 'correo', label: 'Correo' },
    { key: 'cantidadVendida', label: 'Tickets Vendidos', alineacion: 'center' },
    { key: 'recaudado', label: 'Total Recaudado', tipo: 'moneda', alineacion: 'right' }
  ];

  // Configuración de acción para la tabla
  accionTabla: AccionTabla = {
    texto: 'Ver detalle',
    clase: 'btn-primary'
  };

  constructor(
    protected override dialog: MatDialog,
    protected override route: ActivatedRoute,
    private router: Router,
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
      this.cargarPromotores();
    }
  }

  cargarPromotores() {
    this.iniciarCarga();
    
    this.reporteService.getVentasPromotorByEventoId(parseInt(this.idEvento)).subscribe({
      next: (response) => {
        this.todosLosPromotores = response || [];
        this.aplicarFiltro();
        this.finalizarCarga();
      },
      error: (error) => {
        this.manejarError(error, 'Error al cargar los promotores');
      }
    });
  }

  aplicarFiltro() {
    if (!this.filtroTexto.trim()) {
      this.promotores = this.todosLosPromotores;
    } else {
      const filtro = this.filtroTexto.toLowerCase().trim();
      this.promotores = this.todosLosPromotores.filter(promotor => 
        promotor.nombre.toLowerCase().includes(filtro) || 
        promotor.documento.toLowerCase().includes(filtro)
      );
    }
  }

  onFiltroChange() {
    this.aplicarFiltro();
  }

  // Getter para estadísticas de promotores
  get estadisticasPromotores(): EstadisticaCard[] {
    const totalPromotores = this.promotores.length;
    const totalTickets = this.promotores.reduce((total, p) => total + p.cantidadVendida, 0);
    const totalRecaudado = this.promotores.reduce((total, p) => total + p.recaudado, 0);
    const promedioTicketsPorPromotor = totalPromotores > 0 ? Math.round(totalTickets / totalPromotores) : 0;
    const promedioRecaudadoPorPromotor = totalPromotores > 0 ? Math.round(totalRecaudado / totalPromotores) : 0;

    return [
      { titulo: 'Total Promotores', valor: totalPromotores },
      { titulo: 'Tickets Vendidos', valor: totalTickets },
      { 
        titulo: 'Total Recaudado', 
        valor: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalRecaudado),
        tipo: 'highlight' 
      },
      { 
        titulo: 'Promedio Tickets', 
        valor: `${promedioTicketsPorPromotor} tickets`,
        tipo: 'primary' 
      },
      { 
        titulo: 'Promedio Recaudado', 
        valor: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(promedioRecaudadoPorPromotor),
        tipo: 'primary' 
      }
    ];
  }

  // Función para obtener datos expandidos
  obtenerDatosExpandidos = (item: ReporteVendedores) => {
    return {
      'Documento': item.documento,
      'Correo': item.correo,
      'Tickets Vendidos': item.cantidadVendida,
      'Total Recaudado': item.recaudado
    };
  };

  // Método para manejar clic en acción
  onAccionClick(promotor: ReporteVendedores) {
    this.router.navigate([promotor.documento], { relativeTo: this.route });
  }
}
