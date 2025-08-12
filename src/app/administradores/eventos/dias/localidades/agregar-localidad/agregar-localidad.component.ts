import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Localidad } from '../../../../../models/localidad.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalidadDataService } from '../../../../../service/data/localidad-data.service';
import { MatDialog } from '@angular/material/dialog';
import { DiaDataService } from '../../../../../service/data/dia-data.service';
import { Dia } from '../../../../../models/dia.model';
import { MensajeComponent } from '../../../../../mensaje/mensaje.component';
import { Tarifa } from '../../../../../models/tarifa.model';
import { TarifaDataService } from '../../../../../service/data/tarifa-data.service';
import { Observable } from 'rxjs';
import { HardcodedAutheticationService } from '../../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-agregar-localidad',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-localidad.component.html',
  styleUrl: './agregar-localidad.component.scss'
})
export class AgregarLocalidadComponent {

  localidad: Localidad
  formEnviado = false;
  loading = false;
  nombre: string;
  modoEdicion = false;
  diaId: number;
  eventoId: number;
  temporadaId: number;
  diaAgregar: Dia | null = null
  dias: Dia[] = []
  diasLocalidad: Dia[] = []
  tarifaAgregar: Tarifa | null = null
  tarifas: Tarifa[] = []
  esRutaPorEvento: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localidadService: LocalidadDataService,
    private diaService: DiaDataService,
    private tarifaService: TarifaDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) {
    this.localidad = new Localidad()
    this.localidad.tipo = 0; // Venta estándar por defecto
    this.localidad.aporteMinimo = 0;
  }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.temporadaId = Number(params.get('idTemporada'));
      this.eventoId = Number(params.get('idEvento'));

      // Determinar si viene de días o de evento
      this.esRutaPorEvento = !params.has('idDia');
      this.diaId = this.esRutaPorEvento ? null : Number(params.get('idDia'));

      this.cargarDias();

      // Si viene de días, agregar automáticamente el día correspondiente
      if (!this.esRutaPorEvento && this.diaId && !id) {
        this.diaService.getPorId(this.diaId).subscribe({
          next: (dia) => {
            this.diaAgregar = dia;
            this.agregarALista('dia');
          },
          error: (error) => {
            console.error('Error al cargar el día', error);
          }
        });
      }

      if (id) {
        this.modoEdicion = true;
        this.localidadService.getByIdEdicion(id).subscribe({
          next: (data) => {
            console.log(data)
            this.localidad = data.localidad;
            this.diasLocalidad = data.dias || [];
          },
          error: (error) => {
            console.error('Error al cargar la localidad:', error);
            this.openMensaje('Error al cargar la localidad');
            this.goBack()
          }
        });
      }
    });


  }

  cargarDias() {
    this.loading = true;
    this.diaService.listarPorEvento(this.eventoId).subscribe({
      next: (data) => {
        this.dias = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar los dias', error)
        this.loading = false;
        this.openMensaje('Error al cargar los dias');
        this.goBack()
      }
    })
  }

  crearLocalidad() {
    this.formEnviado = true;
    this.loading = true;

    if (this.isFormValid()) {
      this.modoEdicion ? this.actualizarLocalidad() : this.crearNuevaLocalidad();
    } else {
      this.loading = false;
      if (!this.diasLocalidad.length) {
        this.openMensaje('Debes asignarle al menos un día a la localidad');
      }
    }
  }

  isFormValid(): boolean {
    return !!this.localidad.nombre && this.diasLocalidad.length > 0;
  }

  crearNuevaLocalidad(forzarCreacion = false) {
    this.localidad.dias = [...this.diasLocalidad];
    this.localidadService.crearLocalidad(this.localidad, forzarCreacion).subscribe({
      next: () => {
        this.loading = false;
        this.openMensaje('Localidad creada exitosamente');
        this.goBack();
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 409) {
          this.openMensaje('Ya existe una localidad con ese nombre. ¿Desea crearla de todas formas?', true).subscribe(confirmado => {
            confirmado ? (this.loading = true, this.crearNuevaLocalidad(true)) : this.goBack();
          });
        }
      }
    });
  }

  actualizarLocalidad(forzarActualizacion = false) {
    this.localidad.dias = [...this.diasLocalidad];
    this.localidadService.editarLocalidad(this.localidad, forzarActualizacion).subscribe({
      next: () => {
        this.loading = false;
        this.openMensaje('Localidad actualizada exitosamente');
        this.goBack();
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 409) {
          this.openMensaje('Ya existe otra localidad con ese nombre. ¿Desea actualizarla de todas formas?', true).subscribe(confirmado => {
            if (confirmado) {
              this.loading = true;
              this.actualizarLocalidad(true);
            }
          });
        } else {
          console.error('Error al actualizar la localidad:', error);
          this.openMensaje('Error al actualizar la localidad');
        }
      }
    });
  }

  quitarLista(index: number, tipo: 'dia' | 'tarifa'): void {
    if (tipo === 'dia') {
      this.diasLocalidad.splice(index, 1);
      this.localidad.dias = [...this.diasLocalidad];
    }
  }

  onTipoChange(): void {
    if (this.localidad.tipo == 0) this.localidad.aporteMinimo = 0;
  }

  agregarALista(tipo: 'dia' | 'tarifa'): void {
    if (tipo === 'dia' && this.diaAgregar) {
      const diaYaExiste = this.diasLocalidad.some(dia => dia.nombre === this.diaAgregar.nombre);
      if (diaYaExiste) {
        this.openMensaje('El día ya está agregado');
      } else {
        this.diasLocalidad.push(this.diaAgregar);
        this.localidad.dias = [...this.diasLocalidad];
        this.diaAgregar = null;
      }
    }
  }



  openMensaje(mensajeT: string, confirmacion: boolean = false): Observable<Boolean> {
    const screenWidth = screen.width;
    const isSmallScreen = screenWidth <= 600;
    const dialogRef = this.dialog.open(MensajeComponent, {
      width: isSmallScreen ? '100%' : '500px',
      maxWidth: isSmallScreen ? '100%' : '80vw',
      height: isSmallScreen ? 'auto' : '250',
      data: { mensaje: mensajeT, mostrarBotones: confirmacion }
    });
    return dialogRef.afterClosed();
  }

  goBack() {
    const basePath = ['/administradores/admin', this.nombre, 'temporada', this.temporadaId, 'evento', this.eventoId];
    const path = this.esRutaPorEvento ? [...basePath, 'localidades'] : [...basePath, 'dia', this.diaId, 'localidades'];
    this.router.navigate(path);
  }

}
