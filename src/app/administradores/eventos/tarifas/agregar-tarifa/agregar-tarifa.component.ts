import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tarifa } from '../../../../models/tarifa.model';
import { Evento } from '../../../../models/evento.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TarifaDataService } from '../../../../service/data/tarifa-data.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MensajeComponent } from '../../../../mensaje/mensaje.component';
import { EventoDataService } from '../../../../service/data/evento-data.service';
import { Localidad } from '../../../../models/localidad.model';
import { LocalidadDataService } from '../../../../service/data/localidad-data.service';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-agregar-tarifa',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-tarifa.component.html',
  styleUrl: './agregar-tarifa.component.scss'
})
export class AgregarTarifaComponent {

  tarifa: Tarifa
  localidad: Localidad
  formEnviado = false
  loading = false
  nombre: string
  modoEdicion = false
  tarifaId: number
  eventoId: number
  diaId: number
  localidadId: number
  temporadaId: number
  esRutaPorEvento: boolean = false;
  ivaSugerido = false;
  tarifaParaCupon = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tarifaService: TarifaDataService,
    private localidadService: LocalidadDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) {
    this.tarifa = new Tarifa()
  }


  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin()

    this.route.paramMap.subscribe(params => {
      this.eventoId = Number(params.get('idEvento'))
      this.temporadaId = Number(params.get('idTemporada'))
      this.localidadId = Number(params.get('idLocalidad'))
      this.diaId = params.has('idDia') ? Number(params.get('idDia')) : null;
      this.esRutaPorEvento = this.diaId === null;
      this.localidadService.getPorId(this.eventoId).subscribe({
        next: (response) => {
          this.localidad = response
        }
      })
      const id = params.get('id')
      if (id) {
        this.tarifaId = +id;
        this.modoEdicion = true;
        this.cargarTarifa(this.tarifaId)
      }
    })
  }

  cargarTarifa(id: number) {
    this.loading = true
    this.tarifaService.getPorId(id).subscribe({
      next: (data) => {
        this.tarifa = data
        this.loading = false
      },
      error: (error) => {
        console.error("Error al carga la tarifa", error)
        this.loading = false
        this.openMensaje('Error al cargar los datos de la tarifa')
        this.router.navigate([
          '/administradores/admin', this.nombre, 'temporada', this.temporadaId, 'evento', this.eventoId, 'tarifas'
        ])
      }
    })
  }

  crearTarifa() {
    this.formEnviado = true;
    this.loading = true;

    if (!this.isFormValid()) {
      this.loading = false;
      return;
    }

    const { precio, servicio, iva } = this.tarifa;
    let mensaje: string | null = null;

    // Evaluar las condiciones y preparar mensaje
    if (precio < servicio) {
      mensaje = 'El precio es menor que el servicio. ¿Desea crear la tarifa de todas formas?';
    }

    // Ejecutar lógica según se requiera confirmación o no
    if (mensaje) {
      this.openMensaje(mensaje, true).subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.procederConGuardado();
        } else {
          this.loading = false;
        }
      });
    } else {
      this.procederConGuardado();
    }
  }


  procederConGuardado() {
    if (this.modoEdicion) {
      this.actualizarTarifa();
    } else {
      this.crearNuevaTarifa();
    }
  }

  isFormValid(): boolean {
    return !!this.tarifa.nombre &&
      !!this.tarifa.precio &&
      !!this.tarifa.servicio &&
      !!this.tarifa.iva;
  }

  crearNuevaTarifa() {
    this.tarifa.localidad = new Localidad()
    this.tarifa.localidad.id = this.localidadId
    this.tarifa.estado = this.tarifaParaCupon ? 3 : 0

    this.tarifaService.crear(this.tarifa).subscribe({
      next: (response) => {
        this.loading = false
        this.openMensaje('Tarifa creada exitosamente')
        this.goBack()
      }
    })
  }


  actualizarTarifa() {
    this.tarifaService.editarTarifa(this.tarifa).subscribe({
      next: (response) => {
        this.loading = false
        this.openMensaje("Tarifa actualizada exitosamente")
        this.goBack()
      },
      error: (error) => {
        this.loading = false
        console.error('Error', error)
        this.openMensaje('Error al actualizar el dia')
      }
    })
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

  onInputTarifa(event: Event, campo: 'precio' | 'servicio'): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/[^\d]/g, '');

    let numericValue = rawValue ? parseInt(rawValue, 10) : null;

    if (numericValue != null && numericValue > 1000000000) {
      numericValue = 1000000000;
    }

    this.tarifa[campo] = numericValue;
    input.value = this.formatNumber(numericValue);

    // Calcular automáticamente el IVA solo si el checkbox está activado
    if (campo === 'servicio' && numericValue !== null && this.ivaSugerido) {
      this.calcularIva();
    }
  }

  toggleIvaSugerido(): void {
    if (this.ivaSugerido) {
      this.calcularIva();
    } else {
      this.tarifa.iva = null;
    }
  }

  calcularIva(): void {
    if (this.tarifa.servicio !== null) {
      this.tarifa.iva = Math.round(this.tarifa.servicio * 0.19);
    } else {
      this.tarifa.iva = null;
    }
  }

  onInputIva(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/[^\d]/g, '');

    let numericValue = rawValue ? parseInt(rawValue, 10) : null;

    if (numericValue != null && numericValue > 1000000000) {
      numericValue = 1000000000;
    }

    this.tarifa.iva = numericValue;
    input.value = this.formatNumber(numericValue);

    // Desactivar el checkbox cuando se edita manualmente el IVA
    this.ivaSugerido = false;
  }

  formatNumber(value: number | null): string {
    if (value == null) return '';
    return value.toLocaleString('es-CO'); // ejemplo: 12.345
  }



  formatIva(value: number | null): string {
    if (value == null) return '';
    return this.formatNumber(value);
  }


  goBack() {
    if (this.esRutaPorEvento) {
      // Ruta SIN día (por evento)
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'temporada', this.temporadaId,
        'evento', this.eventoId,
        'localidad', this.localidadId,
        'tarifas'
      ]);
    } else {
      // Ruta CON día
      this.router.navigate([
        '/administradores/admin',
        this.nombre,
        'temporada', this.temporadaId,
        'evento', this.eventoId,
        'dia', this.diaId,
        'localidad', this.localidadId,
        'tarifas'
      ]);
    }
  }



}
