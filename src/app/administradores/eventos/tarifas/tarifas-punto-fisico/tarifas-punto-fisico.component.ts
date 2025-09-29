import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Tarifa } from '../../../../models/tarifa.model';
import { TarifaDataService } from '../../../../service/data/tarifa-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-tarifas-punto-fisico',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  providers: [CurrencyPipe],
  templateUrl: './tarifas-punto-fisico.component.html',
  styleUrl: './tarifas-punto-fisico.component.scss'
})
export class TarifasPuntoFisicoComponent {

  selectedItem: number | null = null
  cargando: boolean
  tarifas: Tarifa[] = []
  nombre: string
  idLocalidad: number
  idEvento: number
  idDia: number | null;
  estadoTarifa: number = 4; // Estado específico para punto físico
  tipoTarifa: string = 'punto físico'
  esRutaPorEvento: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tarifaService: TarifaDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin()

    this.route.parent?.paramMap.subscribe(params => {
      this.idLocalidad = Number(params.get('idLocalidad'))
      this.idEvento = Number(params.get('idEvento'))
      this.idDia = params.has('idDia') ? Number(params.get('idDia')) : null;
      this.esRutaPorEvento = this.idDia === null;
      this.refrescar()
    })
  }

  refrescar() {
    this.cargarTarifas()
  }

  toggleItem(index: number): void {
    this.selectedItem = this.selectedItem === index ? null : index;
  }

  cargarTarifas(): void {
    this.cargando = true;
    // Usar el mismo servicio pero con estado 4 para punto físico
    this.tarifaService.listarPorEstado(this.idLocalidad, this.estadoTarifa).subscribe({
      next: (response) => {
        this.tarifas = response;
        this.cargando = false
      },
      error: (error) => {
        this.cargando = false;
      }
    })
  }

  cambiarEstado(tarifa: Tarifa): void {
    const estadoAnterior = tarifa.estado;

    this.cargando = true
    this.tarifaService.editarEstadoDeTarifa(tarifa).subscribe({
      next: (response) => {
        this.cargando = false
        this.openMensaje('Estado de la tarifa cambiado correctamente');
        this.cargarTarifas();
      },
      error: (err) => {
        this.cargando = false
        tarifa.estado = estadoAnterior;
        const mensaje = err.error?.mensaje || 'No se pudo cambiar el estado';
        this.openMensaje(mensaje);
      }
    })
  }

  eliminarTarifa(id: number): void {
    this.openMensaje("¿Desea borrar la tarifa de punto físico?", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true
        this.tarifaService.getPorId(id).subscribe({
          next: (tarifa) => {
            if (tarifa.localidad) {
              this.cargando = false
              this.openMensaje("No se puede eliminar la tarifa porque tiene una localidad asociada").subscribe();
              return;
            } else {
              this.tarifaService.borrarTarifa(id).subscribe({
                next: (response) => {
                  if (!response) {
                    this.cargando = false
                    this.openMensaje("Se borró exitosamente la tarifa").subscribe();
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
            this.openMensaje("No se pudo obtener la información de la tarifa").subscribe();
          }
        })
      }
    })
  }

  editarTarifa(tarifa: Tarifa) {
    this.tarifaService.tieneTicketsAsociados(tarifa.id!).subscribe({
      next: (tieneTickets: boolean) => {
        if (tieneTickets) {
          this.openMensaje('No se puede editar esta tarifa porque tiene tickets asociados.');
          return;
        }

        if (this.esRutaPorEvento) {
          this.router.navigate([
            '/administradores/admin',
            this.nombre,
            'evento', this.idEvento,
            'localidades', this.idLocalidad,
            'tarifas', 'editar', tarifa.id
          ]);
        } else {
          this.router.navigate([
            '/administradores/admin',
            this.nombre,
            'evento', this.idEvento,
            'dia', this.idDia,
            'localidades', this.idLocalidad,
            'tarifas', 'editar', tarifa.id
          ]);
        }
      },
      error: () => {
        this.openMensaje('Error al validar la tarifa. Intenta nuevamente.');
      }
    });
  }

  calcularTotalConIva(tarifa: any): number {
    return tarifa.servicio + tarifa.iva;
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