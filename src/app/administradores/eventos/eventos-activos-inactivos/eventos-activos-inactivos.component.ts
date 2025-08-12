import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Evento } from '../../../models/evento.model';
import { EventoDataService } from '../../../service/data/evento-data.service';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ColumnaBotonConfig, ColumnaSelectConfig, TableComponent } from '../../../commons-ui/table/table.component';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';
import { ImagenesEventosComponent } from '../imagenes-eventos/imagenes-eventos.component';

@Component({
  selector: 'app-eventos-activos-inactivos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableComponent
  ],
  providers: [CurrencyPipe],
  templateUrl: './eventos-activos-inactivos.component.html',
  styleUrl: './eventos-activos-inactivos.component.scss'
})
export class EventosActivosInactivosComponent {

  columnaBotonesTabla: ColumnaBotonConfig[] = [
  {
    columna: 'dias',
    texto: 'Ver',
    clase: 'btn-ver',
    accion: (evento: Evento) => this.navigateDias(evento.id)
  },
  {
    columna: 'localidades',
    texto: 'Ver',
    clase: 'btn-ver',
    accion: (evento: Evento) => this.navigateLocalidades(evento.id)
  },
  {
    columna: 'imagenes',
    texto: 'Imágenes',
    clase: 'btn-ver',
    accion: (evento: Evento) => this.abrirImagenes(evento)
  }
];

  columnaSelectsTabla: ColumnaSelectConfig[] = [
  {
    columna: 'estado',
    nombreCampo: 'estado',
    opciones: [
      { value: 0, label: 'Creado' },
      { value: 1, label: 'Oculto' },
      { value: 2, label: 'Visible' },
      { value: 3, label: 'Terminado' }
    ],
    clase: 'estado-select',
    action: (evento: Evento, newValue: any) => this.cambiarEstado(evento)
  }
];


  expandableConfig = {
    infoFields: [
      { label: 'PULEP', property: 'pulep' },
      { label: 'Nombre', property: 'nombre' },
      { label: 'Tipo', property: 'tipoNombre' }
    ],
    actionButtons: [
      { text: 'Editar', class: 'btn-editar', action: (evento: Evento) => this.editarEvento(evento) },
      { text: 'Eliminar', class: 'btn-eliminar', action: (evento: Evento) => this.eliminarEvento(evento.id) },
      { text: 'Días', class: 'btn-dias', action: (evento: Evento) => this.navigateDias(evento.id) },
      { text: 'Localidades', class: 'btn-localidades', action: (evento: Evento) => this.navigateLocalidades(evento.id) },
      { text: 'Imágenes', class: 'btn-ver', action: (evento: Evento) => this.abrirImagenes(evento) }
    ],
    selectConfig: {
      property: 'estado',
      options: [
        { value: 0, label: 'Creado' },
        { value: 1, label: 'Oculto' },
        { value: 2, label: 'Visible' },
        { value: 3, label: 'Terminado' }
      ],
      action: (evento: Evento) => this.cambiarEstado(evento)
    }
  };

  selectedItem: number | null = null
  cargando: boolean
  eventos: Evento[] = []
  nombre: string
  idTemporada: number
  esRutaActivos: boolean;
  estadoActual: number = 0;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();

    this.route.parent?.paramMap.subscribe(params => {
      this.idTemporada = Number(params.get('idTemporada'))
      this.determinarRuta()
      this.refrescar()
    })
  }

  private getEstadoPorRuta(ruta: string): number {
  switch (ruta) {
    case 'creados':
      return 0;
    case 'ocultos':
      return 1;
    case 'visibles':
      return 2;
    case 'terminados':
      return 3;
    default:
      return 0; 
  }
}

get mensajeVacio(): string {
  const estadoPorRuta = {
    0: 'creados',
    1: 'ocultos',
    2: 'visibles',
    3: 'terminados'
  };
  return `No tiene eventos ${estadoPorRuta[this.estadoActual] ?? ''}`;
}


determinarRuta(): void {
  const segments = this.router.url.split('/');
  const lastSegment = segments[segments.length - 1];
  this.estadoActual = this.getEstadoPorRuta(lastSegment);
}



  refrescar() {
    this.cargarEventos()
  }

  cargarEventos() {
  this.cargando = true;
  this.eventoService.listarPorEstado(this.idTemporada, this.estadoActual).subscribe({
    next: (response) => {
      this.eventos = (response || []).map(e => ({
        ...e,
        tipoNombre: e.tipo?.nombre ?? ''
      }));
      this.cargando = false;
    },
    error: (error) => {
      console.error('Error cargando eventos', error);
      this.cargando = false;
    }
  });
}

  cambiarEstado(evento: Evento): void {
    const estadoAnterior = evento.estado;
    this.cargando = true
    this.eventoService.editarEstadoDeEvento(evento).subscribe({
      next: (response) => {
        this.cargando = false
        const index = this.eventos.findIndex(e => e.id === response.id);
        if (index !== -1) {
          this.eventos[index] = response;
          this.openMensaje('Estado de evento cambiado correctamente')
          this.cargarEventos()
        }
      },
      error: (err) => {
        console.error('Error al cambiar el estado: ', err)
        this.cargando = false
        evento.estado = estadoAnterior;
        this.openMensaje('No se pudo cambiar el estado');
      }
    })
  }

  eliminarEvento(id: number): void {
    this.openMensaje("¿Desea borrar el evento?", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true
        this.eventoService.getPorId(id).subscribe({
          next: (evento) => {
            if (evento.dias && evento.dias.length > 0) {
              this.cargando = false
              this.openMensaje("No se puede eliminar el evento porque tiene días asociados").subscribe();
            } else {
              this.eventoService.borrarEvento(id).subscribe({
                next: (response) => {
                  if (!response) {
                    this.cargando = false
                    this.openMensaje("Se borró exitosamente el evento").subscribe();
                    this.refrescar();
                  } else {
                    this.cargando = false
                    this.openMensaje(response.mensaje).subscribe();
                  }
                },
                error: () => {
                  this.cargando = false
                  this.openMensaje("Sucedió un error, por favor vuelva a intentar").subscribe();
                }
              });
            }
          },
          error: () => {
            this.cargando = false
            this.openMensaje("No se pudo obtener la información del evento").subscribe();
          }
        });
      }
    });
  }


  editarEvento(evento: Evento) {
    this.router.navigate(['/administradores/admin', this.nombre, 'temporada', this.idTemporada, 'eventos', 'editar', evento.id])
  }

  toggleItem(index: number): void {
    this.selectedItem = this.selectedItem === index ? null : index;
  }

  navigateDias(idEvento: number): void {
    this.router.navigate([
      '/administradores', 'admin', this.nombre, 'temporada', this.idTemporada, 'evento', idEvento, 'dias'
    ])
  }

  navigateLocalidades(idEvento: number): void {
    this.router.navigate([
      '/administradores', 'admin', this.nombre, 'temporada', this.idTemporada, 'evento', idEvento, 'localidades'
    ]);
  }

  abrirImagenes(evento: Evento): void {
    this.dialog.open(ImagenesEventosComponent, {
      width: '90%',
      maxWidth: '850px',
      data: { evento }
    });
  }

  openMensaje(mensajeT: string, confirmacion: boolean = false): Observable<Boolean> {
    let screenWidth = screen.width;
    let anchoDialog: string = '500px';
    let anchomax: string = '80vw';
    let altoDialog: string = '250';
    if (screenWidth <= 600) {
      anchoDialog = '100%';
      anchomax = '100%';
      altoDialog = 'auto';
    }
    const dialogRef = this.dialog.open(MensajeComponent, {
      width: anchoDialog,
      maxWidth: anchomax,
      height: altoDialog,
      data: {
        mensaje: mensajeT,
        mostrarBotones: confirmacion
      }
    });
    return dialogRef.afterClosed();
  }






}
