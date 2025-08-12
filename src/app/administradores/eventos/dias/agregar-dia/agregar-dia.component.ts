import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Dia } from '../../../../models/dia.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DiaDataService } from '../../../../service/data/dia-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { EventoDataService } from '../../../../service/data/evento-data.service';
import { Evento } from '../../../../models/evento.model';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-agregar-dia',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-dia.component.html',
  styleUrl: './agregar-dia.component.scss'
})
export class AgregarDiaComponent {

  @ViewChild('horaInicioInput') horaInicioInput: ElementRef;
  @ViewChild('horaFinInput') horaFinInput: ElementRef;
  @ViewChild('fechaInicioInput') fechaInicioInput: ElementRef;
  @ViewChild('fechaFinInput') fechaFinInput: ElementRef;

  dia: Dia;
  formEnviado = false;
  evento: Evento;
  fechaError = false;
  loading = false;
  nombre: string;
  modoEdicion = false;
  diaId: number;
  eventoId: number;
  temporadaId: number;
  private horaInicioPicker: any;
  private horaFinPicker: any;
  private fechaInicioPicker: any;
  private fechaFinPicker: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private diaService: DiaDataService,
    private eventoService: EventoDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) {
    this.dia = new Dia();
    this.evento = new Evento();
  }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();

    this.route.paramMap.subscribe(params => {
      this.eventoId = Number(params.get('idEvento'))
      this.temporadaId = Number(params.get('idTemporada'))

      if (this.eventoId) {
        this.eventoService.getPorId(this.eventoId).subscribe({
          next: (data) => {
            this.evento = data;
          },
          error: (error) => {
            console.error('Error al cargar el evento:', error);
            this.openMensaje('Error al cargar los datos del evento');
          }
        });
      }


      const id = params.get('id')
      if (id) {
        this.diaId = +id;
        this.modoEdicion = true;
        this.cargarDia(this.diaId)

      }
    })
  }

  ngAfterViewInit(): void {
    this.initTimePickers();
    this.initDatePickers()
  }

  cargarDia(id: number) {
    this.loading = true;
    this.diaService.getPorId(id).subscribe({
      next: (data) => {
        this.dia = data;
        this.loading = false;

        // Establecer valores en los date/time pickers si ya están inicializados
        if (this.horaInicioPicker && this.dia.horaInicio) {
          this.horaInicioPicker.setDate(this.dia.horaInicio, true);
        }
        if (this.horaFinPicker && this.dia.horaFin) {
          this.horaFinPicker.setDate(this.dia.horaFin, true);
        }
        if (this.fechaInicioPicker && this.dia.fechaInicio) {
          this.fechaInicioPicker.setDate(new Date(this.dia.fechaInicio), true);
        }
        if (this.fechaFinPicker && this.dia.fechaFin) {
          this.fechaFinPicker.setDate(new Date(this.dia.fechaFin), true);
        }

      },
      error: (error) => {
        console.error('Error al cargar el dia:', error);
        this.loading = false;
        this.openMensaje('Error al cargar los datos del dia');
        this.router.navigate([
          '/administradores/admin', this.nombre, 'temporada', this.temporadaId, 'evento', this.eventoId, 'dias'
        ]);
      }
    });
  }

  crearDia() {
    this.formEnviado = true;
    this.fechaError = false;
    this.loading = true;


    if (this.isFormValid()) {
      if (this.dia.fechaInicio && this.dia.fechaFin) {
        const inicio = new Date(this.dia.fechaInicio)
        const fin = new Date(this.dia.fechaFin)

        if (inicio >= fin) {
          this.fechaError = true;
          this.loading = false;
          this.openMensaje('La fecha inicio no puede ser mayor a la fecha fin');
          return;
        }
      }

      if (this.modoEdicion) {
        this.actualizarDia();
      } else {
        this.crearNuevoDia();
      }
    } else {
      this.loading = false
    }
  }

  isFormValid(): boolean {
    return !!this.dia.nombre &&
      !!this.dia.fechaInicio &&
      !!this.dia.fechaFin &&
      !!this.dia.horaInicio &&
      !!this.dia.horaFin;
  }

  crearNuevoDia() {
    this.dia.evento = new Evento();
    this.dia.evento.id = this.eventoId;
    this.dia.estado = 1;
    
    this.formatearFecha();

    this.diaService.crear(this.dia).subscribe({
      next: (response) => {
        this.loading = false
        this.openMensaje("Dia creado exitosamente")
        this.router.navigate([
          '/administradores/admin', this.nombre, 'temporada', this.temporadaId, 'evento', this.eventoId, 'dias', 'inactivos'
        ])
      }
    })
  }

  actualizarDia() {
    this.formatearFecha();
    
    this.diaService.editarDia(this.dia).subscribe({
      next: (response) => {

        this.loading = false
        this.openMensaje("Dia actualizado exitosamente");
        if (response.estado == 1) {
          this.router.navigate([
            '/administradores/admin', this.nombre, 'temporada', this.temporadaId, 'evento', this.eventoId, 'dias', 'inactivos'
          ])
        }
        this.router.navigate([
          '/administradores/admin', this.nombre, 'temporada', this.temporadaId, 'evento', this.eventoId, 'dias'
        ])
      },
      error: (err) => {
        this.loading = false
        console.error('Error', err)
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

  private initTimePickers(): void {
    // Configuración común para ambos pickers
    const timePickerOptions = {
      enableTime: true,
      noCalendar: true,
      dateFormat: "h:i K",
      minuteIncrement: 15,
      allowInput: true,
      static: true
    };

    // Inicializar picker para hora de inicio
    this.horaInicioPicker = flatpickr(this.horaInicioInput.nativeElement, {
      ...timePickerOptions,
      onChange: (selectedDates, dateStr) => {
        this.dia.horaInicio = dateStr;
      }
    });

    // Inicializar picker para hora de fin
    this.horaFinPicker = flatpickr(this.horaFinInput.nativeElement, {
      ...timePickerOptions,
      onChange: (selectedDates, dateStr) => {
        this.dia.horaFin = dateStr;
      }
    });

    // Si estamos en modo edición, establecer los valores iniciales
    if (this.modoEdicion && this.dia.horaInicio) {
      this.horaInicioPicker.setDate(this.dia.horaInicio);
    }
    if (this.modoEdicion && this.dia.horaFin) {
      this.horaFinPicker.setDate(this.dia.horaFin);
    }
  }

  private initDatePickers(): void {
    // Configuración común para ambos date pickers
    const datePickerOptions = {
      enableTime: false,
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d-m-Y", // Este formato es solo para mostrar
      allowInput: true,
      locale: Spanish,
      static: true
    };

    // Inicializar picker para fecha de inicio
    this.fechaInicioPicker = flatpickr(this.fechaInicioInput.nativeElement, {
      ...datePickerOptions,
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          this.dia.fechaInicio = selectedDates[0].toISOString().slice(0, 10) + 'T00:00:00';
          
          if (this.dia.fechaFin && new Date(this.dia.fechaInicio) > new Date(this.dia.fechaFin)) {
            this.fechaFinPicker.setDate(selectedDates[0]);
            this.dia.fechaFin = this.dia.fechaInicio;
          }
        }
      },
      onReady: (selectedDates, dateStr, instance) => {
        const original = instance.input;
        const altInput = instance.altInput;

        if (altInput && original) {
          altInput.classList.add('input-field', 'input-select-field');

          const computedStyle = window.getComputedStyle(original);
          const props = ['width', 'padding', 'border', 'borderRadius', 'fontSize', 'fontFamily', 'backgroundColor', 'background-image', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize'];

          props.forEach(prop => {
            (altInput.style as any)[prop] = computedStyle.getPropertyValue(prop);
          });
        }
      }
    });

    // Inicializar picker para fecha de fin
    this.fechaFinPicker = flatpickr(this.fechaFinInput.nativeElement, {
      ...datePickerOptions,
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          this.dia.fechaFin = selectedDates[0].toISOString().slice(0, 10) + 'T00:00:00';
        }
      },
      onReady: (selectedDates, dateStr, instance) => {
        const original = instance.input;
        const altInput = instance.altInput;

        if (altInput && original) {
          altInput.classList.add('input-field', 'input-select-field');

          const computedStyle = window.getComputedStyle(original);
          const props = ['width', 'padding', 'border', 'borderRadius', 'fontSize', 'fontFamily', 'backgroundColor', 'background-image', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize'];

          props.forEach(prop => {
            (altInput.style as any)[prop] = computedStyle.getPropertyValue(prop);
          });
        }
      }
    });

    // Si estamos en modo edición, establecer los valores iniciales
    // Convertir string a Date para el picker
    if (this.modoEdicion && this.dia.fechaInicio) {
      this.fechaInicioPicker.setDate(new Date(this.dia.fechaInicio));
    }
    if (this.modoEdicion && this.dia.fechaFin) {
      this.fechaFinPicker.setDate(new Date(this.dia.fechaFin));
    }
  }

  private formatearFecha() {
    if (this.dia.fechaInicio && !this.dia.fechaInicio.includes('T')) {
      this.dia.fechaInicio += 'T00:00:00';
    }
    if (this.dia.fechaFin && !this.dia.fechaFin.includes('T')) {
      this.dia.fechaFin += 'T00:00:00';
    }
  }

  goBack() {
    this.router.navigate(['/administradores/admin', this.nombre, 'temporada', this.temporadaId, 'evento', this.eventoId, 'dias']);
  }




}





