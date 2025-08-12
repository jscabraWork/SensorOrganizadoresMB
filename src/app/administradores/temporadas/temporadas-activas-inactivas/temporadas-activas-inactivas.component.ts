import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemporadaDataService } from '../../../service/data/temporada-data.service';
import { Temporada } from '../../../models/temporada.model';
import { FormsModule } from '@angular/forms';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TablaBotonConfig, TableComponent } from '../../../commons-ui/table/table.component';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-temporadas-activas-inactivas',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableComponent
  ],
  providers: [CurrencyPipe],
  templateUrl: './temporadas-activas-inactivas.component.html',
  styleUrl: './temporadas-activas-inactivas.component.scss'
})
export class TemporadasActivasInactivasComponent {

  botonesTabla = [
    {
      texto: 'Ver',
      clase: 'btn-ver',
      accion: (temporada: Temporada) => this.irAEventos(temporada.id)
    }
  ];

  selectsTabla = [
    {
      nombreCampo: 'estado',
      opciones: [
        { value: 1, label: 'Activada' },
        { value: 0, label: 'Desactivada' }
      ],
      clase: 'estado-select',
      action: (temporada: Temporada) => this.cambiarEstado(temporada)
    }
  ];

  expandableConfig = {
    infoFields: [
      { label: 'Nombre', property: 'nombre' },
      { label: 'Fecha Inicio', property: 'fechaInicio' },
      { label: 'Fecha Finalización', property: 'fechaFin' }
    ],
    actionButtons: [
      {
        text: 'Editar',
        class: 'btn-editar',
        action: (temporada: Temporada) => this.editarTemporada(temporada)
      },
      {
        text: 'Eliminar',
        class: 'btn-eliminar',
        action: (temporada: Temporada) => this.eliminarTemporada(temporada.id)
      },
      {
        text: 'Eventos',
        class: 'btn-eventos',
        action: (temporada: Temporada) => this.irAEventos(temporada.id)
      }
    ],
    selectConfig: {
      property: 'estado',
      options: [
        { value: 1, label: 'Activada' },
        { value: 0, label: 'Desactivada' }
      ],
      action: (temporada: Temporada) => this.cambiarEstado(temporada)
    }
  };

  selectedItem: number | null = null;
  cargando: boolean
  temporadas: Temporada[] = []
  nombre: string;
  esRutaActivos: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private temporadaService: TemporadaDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin()
    this.determinarRuta()
    this.cargarTemporadas()

  }

  determinarRuta(): void {
    const segments = this.router.url.split('/');
    const lastSegment = segments[segments.length - 1];
    this.esRutaActivos = lastSegment === 'activas';
  }


  refrescar() {
    this.cargarTemporadas()
  }

  cargarTemporadas(): void {
    this.cargando = true
    const estado = this.esRutaActivos ? 1 : 0;
    this.temporadaService.listarPorEstado(estado).subscribe({
      next: (response) => {
        this.temporadas = response;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false
        if(error.status >= 500) {
          this.openMensaje('Ocurrio un error, intenta mas tarde.')
        }
      }
    })
  }

  editarTemporada(temporada: Temporada) {
    this.router.navigate(['/administradores/admin', this.nombre, 'temporadas', 'editar', temporada.id]);
  }

  toggleItem(index: number): void {
    this.selectedItem = this.selectedItem === index ? null : index;
  }

 cambiarEstado(temporada: Temporada): void {
  const estadoAnterior = temporada.estado;
  this.cargando = true
  this.temporadaService.editarEstadoDeTemporada(temporada).subscribe({
    next: (response) => {
      this.cargando = false
      const index = this.temporadas.findIndex(t => t.id === response.id);
      if (index !== -1) {
        this.temporadas[index] = response;
        
        // Mensaje dinámico basado en el nuevo estado
        const mensaje = response.estado === 1 ? 'Temporada activada correctamente' : 'Temporada desactivada correctamente';
        this.openMensaje(mensaje);
        
        this.cargarTemporadas();
      }
    },
    error: (err) => {
      console.error('Error al cambiar el estado:', err);
      this.cargando = false
      temporada.estado = estadoAnterior;
      this.openMensaje('No se pudo cambiar el estado');
    }
  });
}


  eliminarTemporada(id: number): void {
    this.openMensaje("¿Desea borrar la temporada?", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true;
        this.temporadaService.getPorId(id).subscribe({
          next: (temporada) => {
            if (temporada.eventos && temporada.eventos.length > 0) {
              this.cargando = false;
              this.openMensaje("No se puede eliminar la temporada porque tiene eventos asociados");
            } else {
              this.temporadaService.borrarTemporada(id).subscribe({
                next: (response) => {
                  if (!response) {
                    this.cargando = false;
                    this.openMensaje("Se borró exitosamente la temporada");
                    this.refrescar();
                  } else {
                    this.openMensaje(response.mensaje);
                  }
                },
                error: () => {
                  this.cargando = false;
                  this.openMensaje("Sucedió un error, por favor vuelva a intentar.");
                }
              });
            }
          },
          error: () => {
            this.cargando = false;
            this.openMensaje("No se pudo obtener la información de la temporada.");
          }
        });
      } else {
        this.cargando = false
        this.openMensaje("No se realizó el borrado");
      }
    });
  }



  formatearFecha(fecha: string | Date): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  irAEventos(idTemporada: number): void {
    this.router.navigate([
      '/administradores', 'admin', this.nombre, 'temporada', idTemporada, 'eventos'
    ]);

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
