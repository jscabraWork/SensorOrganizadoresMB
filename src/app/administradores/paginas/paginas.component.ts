import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonListarComponent } from '../../commons-components/common-listar/common-listar.component';
import { PaginasDataService } from '../../service/data/paginas.data.service';
import { MatDialog } from '@angular/material/dialog';
import { ExpandedRowConfig, TablaBotonConfig, TablaSelectConfig, TableComponent } from '../../commons-ui/table/table.component';
import { TitleComponent } from '../../commons-ui/title/title.component';
import { Pagina } from './../../models/pagina.model';
import { Tipo } from '../../models/tipo.model';

@Component({
  selector: 'app-paginas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableComponent,
    TitleComponent
  ],
  templateUrl: './paginas.component.html',
  styleUrl: './paginas.component.scss'
})
export class PaginasComponent extends CommonListarComponent<Pagina, PaginasDataService> implements OnInit {
 
  estado: number = 1;
  selectedItem: number | null = null;
  tipos: Tipo[] = []

  // Configuración para los botones de la tabla
  botonesConfig: TablaBotonConfig[] = [
    {
      texto: 'Ver',
      clase: 'btn-ver',
      accion: (item: Pagina) => this.router.navigate(['modificar', item.id], { relativeTo: this.route })
    }
  ];

  // Configuración para los selects de la tabla (solo estado)
  selectsConfig: TablaSelectConfig[] = [
    {
      nombreCampo: 'estado',
      opciones: [
        { value: 0, label: 'Inactiva' },
        { value: 1, label: 'Activa' },
        { value: 2, label: 'Oculta' }
      ],
      clase: 'form-select estado-select',
      action: (item: Pagina) => this.actualizarEstado(item)
    }
  ];

  // Configuración para las filas expandibles
  expandableConfig: ExpandedRowConfig = {
    infoFields: [
      { label: 'Nombre', property: 'nombre' },
      { label: 'Cantidad secciones', property: 'seccionesCount' },
      { label: 'Tipo', property: 'tipoNombre' }
    ],
    actionButtons: [
      {
        text: 'Ver',
        class: 'btn-ver',
        action: (item: Pagina) => this.router.navigate(['modificar', item.id], { relativeTo: this.route })
      },
      {
        text: 'Eliminar',
        class: 'btn-eliminar',
        action: (item: Pagina) => this.delete(item.id)
      }
    ],
    selects: [
      {
        property: 'estado',
        options: [
          { value: 0, label: 'Inactiva' },
          { value: 1, label: 'Activa' },
          { value: 2, label: 'Oculta' }
        ],
        action: (item: Pagina) => this.actualizarEstado(item),
      },
      {
        property: 'tipo.id',
        options: [], // Se llenará dinámicamente
        action: (item: Pagina, newValue: number) => this.actualizarTipo(item, newValue),
        label: 'Tipo'
      }
    ]
  };

  constructor(
    protected override service: PaginasDataService,
    protected override dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super(service, dialog);
  }

  override ngOnInit(): void {
    this.id = this.estado;
    this.refrescar();
  }

  // Método para preparar los datos
  override manejar(response): void {
    this.lista = response.lista;
    this.tipos = response.tipos;
    
    // Llenar opciones de tipo dinámicamente en la configuración expandible
    if (this.expandableConfig.selects && this.expandableConfig.selects[1]) {
      this.expandableConfig.selects[1].options = this.tipos.map(tipo => ({
        value: tipo.id,
        label: tipo.nombre
      }));
    }
    
    if (this.lista && this.lista.length > 0) {
      this.lista.forEach(pagina => {
        // Calcular cantidad de secciones
        pagina['seccionesCount'] = pagina.secciones ? pagina.secciones.length : 0;
        
        // Obtener el nombre del tipo para mostrar en la tabla
        pagina['tipoNombre'] = pagina.tipo ? pagina.tipo.nombre : 'Sin tipo';
        
        // Asegurar que el objeto tipo existe para el select
        if (!pagina.tipo) {
          pagina.tipo = {} as Tipo;
        }
      });
    }
  }

  // Método para manejar los clics en el menú
  toggleMenu(estado: number): void {
    this.estado = estado;
    this.id = estado;
    this.refrescar();
  }

  // Método para navegar a la página de creación
  navigateToCrear(): void {
    this.router.navigate(['crear'], { relativeTo: this.route });
  }

  // Método para actualizar el estado de una página
  actualizarEstado(pagina: Pagina): void {
    this.cargando = true;
    this.service.actualizarEstado(pagina).subscribe({
      next: (response) => {
        this.cargando = false;
        this.refrescar();
        this.mensaje("Se actualizó el estado de la página");
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje("Sucedio un error por favor vuelve a intentar");
      }
    });
  }

  actualizarTipo(pagina: Pagina, nuevoTipoId?: number): void {
    // Si viene un nuevo tipo ID, asignarlo
    if (nuevoTipoId !== undefined) {
      pagina.tipo.id = nuevoTipoId;
    }

    this.cargando = true;
    this.service.actualizarTipo(pagina).subscribe({
      next: (response) => {
        this.refrescar();
        this.cargando = false;
        this.mensaje("Se actualizó el tipo de la página");
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje("Sucedió un error por favor vuelve a intentar");
      }
    });
  }
}