import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../../commons-ui/base.component';
import { ReporteDataService } from '../../service/data/reporte-data.service';
import { ResumenAdmin, LocalidadesPorAcabar } from './reseumen-admin';
import { EstadisticasCardsComponent, EstadisticaCard } from '../../organizadores/iu/estadisticas-cards/estadisticas-cards.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Evento } from '../../models/evento.model';
import { GraficaDona, GraficaLineas } from '../../models/reporte/resumen';
import { BaseChartDirective } from 'ng2-charts';
import { 
  Chart, 
  ChartConfiguration, 
  ChartData, 
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

// Registrar componentes de Chart.js
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
  selector: 'app-home-admin',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.scss'
})
export class HomeAdminComponent extends BaseComponent implements OnInit {
  
  resumen: ResumenAdmin | null = null;
  localidades: LocalidadesPorAcabar[] = [];
  eventos: Evento[] = [];
  graficaCircular: GraficaDona[] = [];
  graficaLineas: GraficaLineas[] = [];

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
  
  eventoSeleccionado?: string;
  anioSeleccionado?:number = new Date().getFullYear();
  mesSeleccionado?: number;
  diaSeleccionado?: number;
  
  constructor(
    protected override dialog: MatDialog,
    protected override route: ActivatedRoute,
    private reporteService: ReporteDataService
  ) {
    super(dialog, route);
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
  }
  

  
  protected override cargarDatos(): void {
    this.cargarResumen();
  }
  
  
  private cargarResumen(): void {
    this.iniciarCarga();
    
    this.reporteService.getResumenAdmin(this.eventoSeleccionado, this.anioSeleccionado, this.mesSeleccionado, this.diaSeleccionado)
      .subscribe({
        next: (response) => {
          this.resumen = response.resumen;
          this.localidades = response.localidades || [];
          this.eventos = response.eventos || [];
          this.graficaCircular = response.graficaMetodo || [];
          this.graficaLineas = response.graficaVentas || [];
          
          // Actualizar gráficas
          this.actualizarGraficaCircular();
          this.actualizarGraficaLineas();
          
          this.finalizarCarga();
        },
        error: (error) => {
          this.manejarError(error, 'Error al cargar los datos del administrador');
        }
      });
  }

  
  actualizarFiltros(): void {
    // Si se deselecciona el mes, también deseleccionar el día
    if (!this.mesSeleccionado) {
      this.diaSeleccionado = undefined;
    }
    this.cargarDatos();
  }
  
  getDiasDelMes(): number[] {
    return Array.from({length: 31}, (_, i) => i + 1);
  }

  getAnios(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 3; i--) {
      years.push(i);
    }
    return years;
  }

  getMeses(): { valor: number, nombre: string }[] {
    return [
      { valor: 1, nombre: 'Enero' },
      { valor: 2, nombre: 'Febrero' },
      { valor: 3, nombre: 'Marzo' },
      { valor: 4, nombre: 'Abril' },
      { valor: 5, nombre: 'Mayo' },
      { valor: 6, nombre: 'Junio' },
      { valor: 7, nombre: 'Julio' },
      { valor: 8, nombre: 'Agosto' },
      { valor: 9, nombre: 'Septiembre' },
      { valor: 10, nombre: 'Octubre' },
      { valor: 11, nombre: 'Noviembre' },
      { valor: 12, nombre: 'Diciembre' }
    ];
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
        data: this.graficaCircular.map(item => item.totalRecaudadoTransacciones),
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

  getTotalRecaudadoTRX(): number {
    return this.graficaCircular.reduce((total, item) => total + item.totalRecaudadoTransacciones, 0);
  }
}
