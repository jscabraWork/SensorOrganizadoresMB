import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Localidad } from '../../../../../models/localidad.model';
import { LocalidadDataService } from '../../../../../service/data/localidad-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { HardcodedAutheticationService } from '../../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-localidades-activas-inactivas',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  providers: [CurrencyPipe],
  templateUrl: './localidades-activas-inactivas.component.html',
  styleUrl: './localidades-activas-inactivas.component.scss'
})
export class LocalidadesActivasInactivasComponent {

  selectedItem: number | null = null
  cargando: boolean
  localidades: Localidad[] = []
  nombre: string
  idTemporada: number
  idEvento: number
  idDia: number | null = null
  esRutaPorEvento: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localidadService: LocalidadDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();

    this.route.parent?.paramMap.subscribe(params => {
      this.idTemporada = Number(params.get('idTemporada'))
      this.idEvento = Number(params.get('idEvento'))
      this.idDia = params.has('idDia') ? Number(params.get('idDia')) : null
      this.esRutaPorEvento = this.idDia === null;
      this.refrescar()
    })
  }


  refrescar() {
    this.cargarLocalidades()
  }


  cargarLocalidades() {
    this.cargando = true;

    if (this.esRutaPorEvento) {
      // Cargar por evento (ruta sin idDia)
      this.localidadService.listarPorEventoId(this.idEvento).subscribe({
        next: (response) => {
          this.localidades = response;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando localidades desde eventos', error);
          this.cargando = false;
        }
      });
    } else {
      // Cargar por día (ruta con idDia)
      if (this.idDia) {
        this.localidadService.listarPorDia(this.idDia).subscribe({
          next: (response) => {
            this.localidades = response;
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error cargando localidades', error);
            this.cargando = false;
          }
        });
      }
    }
  }


  eliminarLocalidad(id: number) {
    this.openMensaje("¿Desea borrar la localidad?", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true;
        this.localidadService.borrarLocalidad(id).subscribe({
          next: () => {
            this.cargando = false;
            this.openMensaje("Se borró exitosamente la localidad").subscribe();
            this.refrescar();
          },
          error: (err) => {
            this.cargando = false;
            const mensaje = err?.error?.message || "Ocurrió un error al intentar eliminar la localidad.";
            this.openMensaje(mensaje).subscribe();
          }
        });
      }
    });
  }


  editarLocalidad(localidad: Localidad) {
    if (this.esRutaPorEvento) {
      // Ruta SIN diaId (por evento): /temporada/:idTemporada/evento/:idEvento/localidades/editar/:id
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'temporada', this.idTemporada,
        'evento', this.idEvento,
        'localidades', 'editar', localidad.id  // <- localidades/editar/:id
      ]);
    } else {
      // Ruta CON diaId (por día): /temporada/:idTemporada/evento/:idEvento/dia/:idDia/localidades/editar/:id
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'temporada', this.idTemporada,
        'evento', this.idEvento,
        'dia', this.idDia,
        'localidades', 'editar', localidad.id  // <- localidades/editar/:id
      ]);
    }
  }

  toggleItem(index: number): void {
    this.selectedItem = this.selectedItem === index ? null : index
  }

  irATarifas(localidadId: number) {
    if (this.esRutaPorEvento) {
      // Navegar a ruta SIN diaId (por evento)
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'temporada', this.idTemporada,
        'evento', this.idEvento,
        'localidad', localidadId,
        'tarifas'
      ]);
    } else {
      // Navegar a ruta CON diaId (por día)
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'temporada', this.idTemporada,
        'evento', this.idEvento,
        'dia', this.idDia,
        'localidad', localidadId,
        'tarifas'
      ]);
    }
  }

  irATickets(localidadId: number) {
    if (this.esRutaPorEvento) {
      // Ruta SIN día (por evento)
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'temporada', this.idTemporada,
        'evento', this.idEvento,
        'localidad', localidadId,
        'tickets'
      ]);
    } else {
      // Ruta CON día
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'temporada', this.idTemporada,
        'evento', this.idEvento,
        'dia', this.idDia,
        'localidad', localidadId,
        'tickets'
      ]);
    }
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
