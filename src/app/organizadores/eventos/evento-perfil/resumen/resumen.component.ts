import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReporteDataService } from '../../../../service/data/reporte-data.service';
import { BaseComponent } from '../../../../commons-ui/base.component';
import { GraficaDona, ResumenEvento, GraficaLineas } from '../../../../models/reporte/resumen';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { 
  Chart, 
  ChartConfiguration, 
  ChartData, 
  ChartType,
  DoughnutController,
  LineController,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar solo componentes necesarios
Chart.register(
  DoughnutController,
  LineController,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-resumen',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.scss'
})
export class ResumenComponent extends BaseComponent implements OnInit {
  
  idEvento: string = '';
  resumen: ResumenEvento | null = null;
  graficaCircular: GraficaDona[] = [];
  graficaLineas: GraficaLineas[] = [];
  evento: any = null;

  // Filtros opcionales
  anioSeleccionado?: number;
  mesSeleccionado?: number;

  // Chart.js - Gráficas
  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#FFD900', '#fedc91ff', '#5e5e5eff', '#D4B800'] }]
  };
  
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  
  chartOptions = {
    doughnut: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } },
    line: { responsive: true, maintainAspectRatio: false } as ChartConfiguration<'line'>['options']
  };

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

  protected override  cargarDatos(): void {
    if (this.idEvento) {
      this.cargarResumen();
    }
  }

  cargarResumen() {
    this.iniciarCarga();
    
    this.reporteService.getResumenEvento(this.idEvento, this.anioSeleccionado, this.mesSeleccionado)
      .subscribe({
        next: (response) => {
          this.resumen = response.resumen;
          this.graficaCircular = response.graficaCircular;
          this.graficaLineas = response.graficaLineas;
          this.evento = response.evento;
          
          // Actualizar gráficas
          this.actualizarGraficaCircular();
          this.actualizarGraficaLineas();
          
          this.finalizarCarga();
        },
        error: (error) => {
          this.manejarError(error, 'Error al cargar los datos del resumen');
        }
      });
  }

  // Método para actualizar filtros
  actualizarFiltros(anio?: number, mes?: number) {
    this.anioSeleccionado = anio;
    this.mesSeleccionado = mes;
    this.cargarDatos();
  }

  // Método para calcular el total recaudado para la gráfica circular
  getTotalRecaudado(): number {
    return this.graficaCircular.reduce((total, item) => total + item.totalRecaudado, 0);
  }

  private actualizarGraficaCircular(): void {
    if (!this.graficaCircular?.length) return;
    
    const mapMetodo = (metodo: string) => {
      const metodos: Record<string, string> = {
        'punto_fisico': 'Taquilla', 'taquilla': 'Taquilla',
        'tarjeta': 'Tarjeta', 'tc': 'Tarjeta', 'pse': 'PSE'
      };
      return metodos[metodo.toLowerCase()] || metodo;
    };

    this.doughnutChartData = {
      labels: this.graficaCircular.map(item => mapMetodo(item.metodo)),
      datasets: [{
        data: this.graficaCircular.map(item => item.totalRecaudado),
        backgroundColor: ['#FFD900', '#757575ff', '#ffa703ff', '#D4B800']
      }]
    };
  }

  private actualizarGraficaLineas(): void {
    if (!this.graficaLineas?.length) return;

    const formatCurrency = (value: any) => new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(value as number);

    this.lineChartData = {
      labels: this.graficaLineas.map(item => item.nombrePeriodo),
      datasets: [
        {
          data: this.graficaLineas.map(item => item.recaudado),
          label: 'Recaudado',
          backgroundColor: 'rgba(255, 217, 0, 0.2)',
          borderColor: '#FFD900',
          pointBackgroundColor: '#FFD900',
          pointBorderColor: '#E6C300',
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          data: this.graficaLineas.map(item => item.asistentes),
          label: 'Asistentes',
          backgroundColor: 'rgba(64, 64, 64, 0.1)',
          borderColor: '#404040',
          pointBackgroundColor: '#404040',
          pointBorderColor: '#2D2D2D',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    this.chartOptions.line = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          title: { display: true, text: 'Recaudado (COP)' },
          ticks: { callback: formatCurrency }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          title: { display: true, text: 'Asistentes' },
          grid: { drawOnChartArea: false }
        }
      }
    };
  }

}
