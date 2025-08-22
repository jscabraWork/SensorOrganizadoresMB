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
  selector: 'app-taquillas',
  imports: [CommonModule, FormsModule, TituloComponent, ErrorComponent, TablaOrganizadoresComponent, EstadisticasCardsComponent],
  templateUrl: './taquillas.component.html',
  styleUrl: './taquillas.component.scss'
})
export class TaquillasComponent extends BaseComponent implements OnInit {

  idEvento: string = '';
  evento: any = null;
  taquillas: ReporteVendedores[] = [];
  todasLasTaquillas: ReporteVendedores[] = [];
  filtroTexto: string = '';

  // Configuración de columnas para la tabla
  columnasTabla: ColumnaTabla[] = [
    { key: 'documento', label: 'Documento' },
    { key: 'nombre', label: 'Taquilla' },
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
      this.cargarTaquillas();
    }
  }

  cargarTaquillas() {
    this.iniciarCarga();
    
    this.reporteService.getVentasTaquillaByEventoId(parseInt(this.idEvento)).subscribe({
      next: (response) => {
        this.todasLasTaquillas = response || [];
        this.aplicarFiltro();
        this.finalizarCarga();
      },
      error: (error) => {
        this.manejarError(error, 'Error al cargar las taquillas');
      }
    });
  }

  aplicarFiltro() {
    if (!this.filtroTexto.trim()) {
      this.taquillas = this.todasLasTaquillas;
    } else {
      const filtro = this.filtroTexto.toLowerCase().trim();
      this.taquillas = this.todasLasTaquillas.filter(taquilla => 
        taquilla.nombre.toLowerCase().includes(filtro) || 
        taquilla.documento.toLowerCase().includes(filtro)
      );
    }
  }

  onFiltroChange() {
    this.aplicarFiltro();
  }

  // Getter para estadísticas de taquillas
  get estadisticasTaquillas(): EstadisticaCard[] {
    const totalTaquillas = this.taquillas.length;
    const totalTickets = this.taquillas.reduce((total, t) => total + t.cantidadVendida, 0);
    const totalRecaudado = this.taquillas.reduce((total, t) => total + t.recaudado, 0);
    const promedioTicketsPorTaquilla = totalTaquillas > 0 ? Math.round(totalTickets / totalTaquillas) : 0;
    const promedioRecaudadoPorTaquilla = totalTaquillas > 0 ? Math.round(totalRecaudado / totalTaquillas) : 0;

    return [
      { titulo: 'Total Taquillas', valor: totalTaquillas },
      { titulo: 'Tickets Vendidos', valor: totalTickets },
      { 
        titulo: 'Total Recaudado', 
        valor: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalRecaudado),
        tipo: 'highlight' 
      },
      { 
        titulo: 'Promedio Tickets', 
        valor: `${promedioTicketsPorTaquilla} tickets`,
        tipo: 'primary' 
      },
      { 
        titulo: 'Promedio Recaudado', 
        valor: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(promedioRecaudadoPorTaquilla),
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
  onAccionClick(taquilla: ReporteVendedores) {
    this.router.navigate([taquilla.documento], { relativeTo: this.route });
  }
}
