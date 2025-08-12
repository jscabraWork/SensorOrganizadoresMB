import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Dia } from '../../../../models/dia.model';
import { DiaDataService } from '../../../../service/data/dia-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-dias-activos-inactivos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  providers: [CurrencyPipe],
  templateUrl: './dias-activos-inactivos.component.html',
  styleUrl: './dias-activos-inactivos.component.scss'
})
export class DiasActivosInactivosComponent {

  selectedItem: number | null = null
  cargando: boolean
  dias: Dia[] = []
  nombre: string
  idTemporada: number
  idEvento: number
  esRutaActivos: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diaService: DiaDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();

    this.route.parent?.paramMap.subscribe(params => {
      this.idTemporada = Number(params.get('idTemporada'))
      this.idEvento = Number(params.get('idEvento'))
      this.determinarRuta()
      this.refrescar()
    })
  }

  determinarRuta(): void {
    const segments = this.router.url.split('/');
    const lastSegment = segments[segments.length - 1];
    this.esRutaActivos = lastSegment === 'activos';
  }

  refrescar() {
    this.cargarDias()
  }

  cargarDias(): void {
    this.cargando = true;
    const estado = this.esRutaActivos ? 1 : 0;

    this.diaService.listarPorEstado(this.idEvento, estado).subscribe({
      next: (response) => {
        this.dias = response;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando días', error);
        this.cargando = false;
      }
    });
  }

  cambiarEstado(dia: Dia): void {
    const estadoAnterior = dia.estado === 1 ? 0 : 1;
    this.cargando = true
    this.diaService.editarEstadoDeDia(dia).subscribe({
      next: (response) => {
        this.cargando = false
        const index = this.dias.findIndex(d => d.id === response.id);
        if (index !== -1) {
          this.dias[index] = response;
          this.openMensaje('Estado de dia cambiado correctamente');
          this.cargarDias();
        }
      },
      error: (err) => {
        console.error('Error al cambiar el estado: ', err)
        this.cargando = false
        dia.estado = estadoAnterior;
        this.openMensaje('No se pudo cambiar el estado')
      }
    })
  }

  eliminarDia(id: number): void {
    this.openMensaje("¿Desea borrar el dia?", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true
        this.diaService.getPorId(id).subscribe({
          next: (dia) => {
            if (dia.localidades && dia.localidades.length > 0) {
              this.cargando = false
              this.openMensaje("No se puede eliminar el dia porque tiene localidades asociadas").subscribe();
              return;
            } else {
              this.diaService.borrarDia(id).subscribe({
                next: (response) => {
                  if (!response) {
                    this.cargando = false
                    this.openMensaje("Se borró exitosamente el dia").subscribe();
                    this.refrescar();
                  } else {
                    this.cargando = false
                    this.openMensaje(response.mensaje).subscribe();
                  }
                },
                error: (error) => {
                  this.cargando = false
                  const mensaje = error?.error?.mensaje || "Sucedió un error, por favor vuelva a intentar";
                  this.openMensaje(mensaje).subscribe();
                }
              })
            }
          },
          error: () => {
            this.cargando = false
            this.openMensaje("No se pudo obtener la información del dia").subscribe();
          }
        })
      }
    })
  }

  editarDia(dia: Dia) {
    this.router.navigate(['/administradores/admin', this.nombre, 'temporada', this.idTemporada, 'evento', this.idEvento, 'dias', 'editar', dia.id])
  }

  toggleItem(index: number): void {
    this.selectedItem = this.selectedItem === index ? null : index;
  }

  irALocalidades(idDia: number): void {
    this.router.navigate([
      '/administradores', 'admin', this.nombre, 'temporada', this.idTemporada, 'evento', this.idEvento, 'dia', idDia, 'localidades'
    ])
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
