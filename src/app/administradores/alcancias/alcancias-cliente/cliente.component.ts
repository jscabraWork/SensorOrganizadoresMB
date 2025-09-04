import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ExpandedRowConfig, TableComponent } from '../../../commons-ui/table/table.component';
import { Filter, SearchFilterComponent } from '../../../commons-ui/search-filter/search-filter.component';
import { AlcanciasDataService } from '../../../service/data/alcancias-data.service';
import { Page } from '../../../models/page.mode';
import { Alcancia } from '../../../models/alcancia.model';

@Component({
  selector: 'app-alcancias-cliente',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableComponent,
    SearchFilterComponent
  ],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class AlcanciasClienteComponent implements OnInit {

  // Data and selection state
  cargando: boolean = false;
  alcanciaSeleccionada: Alcancia | null = null;
  alcanciasPage: Page<Alcancia> | null = null;

  // Configuration objects
  searchFilters: Filter[] = [
    {
      key: 'clienteId',
      value: '',
      type: 'text',
      placeholder: 'Buscar por documento del cliente',
      label: 'Documento Cliente',
      onEnter: (valor: string) => this.buscarPorCliente(valor)
    }
  ];

  expandableConfig: ExpandedRowConfig = {
    infoFields: [
      { label: 'ID Alcancía', property: 'id' },
      { label: 'Cliente', property: 'clienteNombre' },
      { label: 'Documento', property: 'clienteDocumento' },
      { label: 'Evento', property: 'eventoNombre' },
      { label: 'Localidad', property: 'localidadNombre' },
      { label: 'Total Alcancía', property: 'total' }
    ],
    actionButtons: [
      {
        text: 'Ver Detalles',
        class: 'btn-ver',
        action: (alcancia: Alcancia) => this.verDetalles(alcancia)
      },
      {
        text: 'Aportar',
        class: 'btn-aportar',
        action: (alcancia: Alcancia) => this.aportarAlcancia(alcancia)
      },
      {
        text: 'Agregar Ticket',
        class: 'btn-ticket',
        action: (alcancia: Alcancia) => this.agregarTicket(alcancia)
      }
    ],
    selects: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private alcanciasService: AlcanciasDataService
  ) { }

  ngOnInit(): void {
    // Componente inicia sin cargar datos, solo busca cuando se solicita
  }

  buscarPorCliente(clienteId: string): void {
    if (!clienteId || clienteId.trim() === '') {
      this.limpiarFiltros();
      return;
    }
    
    this.cargando = true;
    
    this.alcanciasService.getByClienteIdParaAdmin(clienteId.trim()).subscribe({
      next: (response: any) => {
        const alcanciasTransformadas = response.alcancias?.map((alcancia: any) => 
          this.transformarAlcanciaSimple(alcancia, response.cliente)
        ) || [];
        
        this.alcanciasPage = {
          content: alcanciasTransformadas,
          totalElements: alcanciasTransformadas.length,
          totalPages: 1,
          size: alcanciasTransformadas.length,
          number: 0
        };
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error buscando alcancías por cliente:', error);
        this.alcanciasPage = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 0,
          number: 0
        };
        this.cargando = false;
      }
    });
  }

  buscarAlcancias(): void {
    // Actualizar filtro desde searchFilters
    const clienteFilter = this.searchFilters.find(f => f.key === 'clienteId');
    if (clienteFilter && clienteFilter.value) {
      this.buscarPorCliente(clienteFilter.value.toString());
    }
  }

  private transformarAlcanciaSimple(alcancia: any, cliente: any): any {
    return {
      id: alcancia.id || 'Sin definir',
      clienteNombre: cliente?.nombre || 'Sin definir',
      clienteDocumento: cliente?.numeroDocumento || 'Sin definir',
      eventoNombre: alcancia.eventoTransient?.nombre || 'Sin definir',
      localidadNombre: alcancia.localidadTransient?.nombre || 'Sin definir',
      cantidadTickets: alcancia.tickets?.length || 0,
      total: alcancia.total || 0
    };
  }

  limpiarFiltros(): void {
    this.searchFilters.forEach(filter => {
      filter.value = '';
    });
    
    this.alcanciasPage = null;
  }

  onExpandRow(alcancia: any | null): void {
    this.alcanciaSeleccionada = alcancia;
  }

  verDetalles(alcancia: any): void {
    console.log('Ver detalles de alcancía:', alcancia);
    // Implementar modal o navegación para ver detalles
  }

  aportarAlcancia(alcancia: any): void {
    console.log('Aportar a alcancía:', alcancia);
    // Implementar modal para aportar dinero
  }

  agregarTicket(alcancia: any): void {
    console.log('Agregar ticket a alcancía:', alcancia);
    // Implementar modal para agregar ticket
  }
}