import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Evento } from '../../../models/evento.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoDataService } from '../../../service/data/evento-data.service';
import { MatDialog } from '@angular/material/dialog';
import { TipoDataService } from '../../../service/data/tipo-data.service';
import { Tipo } from '../../../models/tipo.model';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { CiudadDataService } from '../../../service/data/ciudad-data.service';
import { Ciudad } from '../../../models/ciudad.model';
import { Venue } from '../../../models/venue.model';
import { OrganizadorDataService } from '../../../service/data/organizador-data.service';
import { Organizador } from '../../../models/organizador.model';
import { VenueDataService } from '../../../service/data/venue-data.service';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { StorageService } from '../../../service/data/storage.service';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-agregar-evento',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-evento.component.html',
  styleUrl: './agregar-evento.component.scss'
})
export class AgregarEventoComponent {

  evento: Evento;
  formEnviado = false;
  loading = false;
  // idTemporada: number; // Removed - no longer using temporada routes
  modoEdicion = false;
  eventoId: number;
  nombre: string;
  organizadorAgregar: Organizador | null = null;
  tipos: Tipo[] = []
  organizadores: Organizador[] = []
  organizadoresEvento: Organizador[] = [];
  ciudades: Ciudad[] = []
  venues: Venue[] = []
  organizadorRepetido = false;
  venuesDeCiudadSeleccionada: Venue[] = []
  ciudadSeleccionadaId: number | null = null
  venueSeleccionadoId: number | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventoService: EventoDataService,
    private tipoService: TipoDataService,
    private ciudadService: CiudadDataService,
    private venueService: VenueDataService,
    private organizadorService: OrganizadorDataService,
    private dialog: MatDialog,
    private storageService: StorageService,
    private autenticado: HardcodedAutheticationService,

  ) {
    this.evento = new Evento()
    this.evento.tipo = null;
  }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      // this.idTemporada = +params.get('idTemporada'); // Removed - no longer using temporada routes

      // Primero cargar los datos maestros
      Promise.all([
        this.cargarTipos(),
        this.cargarCiudades(),
        this.cargarOrganizadores()
      ]).then(() => {

        if (!id) {
          this.restaurarEstadoFormulario()
        }

        if (id) {
          this.eventoId = +id;
          this.modoEdicion = true;
          this.cargarEvento();
        }
      }).catch(error => {
        console.error('Error cargando datos iniciales:', error);
      });
    });

  }

  cargarEvento(): void {
    this.loading = true;
    this.eventoService.buscarEvento(this.eventoId).subscribe({
      next: (response: any) => {
        this.evento = response.evento;
        this.organizadoresEvento = response.organizadores;

        const venue = this.evento.venue;
        const ciudad = this.evento.venue?.ciudad;
        const ciudadSeleccionadaId = ciudad ? ciudad.id : null;


        if (this.evento.tipo) {
          const tipoEncontrado = this.tipos.find(t => t.id === this.evento.tipo.id);
          if (tipoEncontrado) {
            this.evento.tipo = tipoEncontrado;
          }
        }

        if (venue) {
          this.venueSeleccionadoId = this.evento.venue.id;

          if (ciudad) {
            this.evento.venue.ciudad = ciudad;
            this.ciudadSeleccionadaId = ciudadSeleccionadaId || ciudad.id;


            if (this.ciudadSeleccionadaId) {
              this.loading = true;
              this.venueService.listarVenuesByCiudadId(this.ciudadSeleccionadaId).subscribe({
                next: (venues: Venue[]) => {
                  this.venuesDeCiudadSeleccionada = venues || [];


                  const venueEncontrado = this.venuesDeCiudadSeleccionada.find(v => v.id === this.venueSeleccionadoId);
                  if (venueEncontrado) {

                    venueEncontrado.ciudad = ciudad;
                    this.evento.venue = venueEncontrado;
                  }

                  this.loading = false;
                },
                error: (error) => {
                  console.error('Error al cargar venues', error);
                  this.venuesDeCiudadSeleccionada = [];
                  this.loading = false;
                }
              });
            }
          }
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando evento', err);
        this.loading = false;
      }
    });
  }




  cargarOrganizadores(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.organizadorService.getOrganizadores().subscribe({
        next: (organizadores: Organizador[]) => {
          this.organizadores = organizadores;

          if (this.modoEdicion && this.evento.organizadores && this.evento.organizadores.length > 0) {
            this.organizadoresEvento = this.evento.organizadores.map(orgEvento => {
              const orgEncontrado = this.organizadores.find(o => o.numeroDocumento === orgEvento.numeroDocumento);
              return orgEncontrado ? orgEncontrado : orgEvento;
            });

            this.evento.organizadores = [...this.organizadoresEvento];
          }
          this.loading = false;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar organizadores: ', error);
          this.loading = false;
          this.openMensaje('Error al cargar los organizadores del evento');
          this.router.navigate(['/administradores/admin', this.nombre, 'eventos']);
          reject(error);
        }
      });
    });
  }

  agregarALista(): void {
    if (this.organizadorAgregar) {
      const organizadorYaExiste = this.organizadoresEvento.some(
        org => org.numeroDocumento === this.organizadorAgregar.numeroDocumento
      );

      if (organizadorYaExiste) {
        this.openMensaje('El organizador ya esta agregado')
      } else {
        this.organizadoresEvento.push(this.organizadorAgregar);
        this.evento.organizadores = [...this.organizadoresEvento];
        this.organizadorAgregar = {} as Organizador;
      }
    }
  }

  quitarLista(index: number): void {
    this.organizadoresEvento.splice(index, 1);
    this.evento.organizadores = [...this.organizadoresEvento];
  }

  cargarTipos(): Promise<void> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.tipoService.listar().subscribe({
        next: (tipos: Tipo[]) => {
          this.tipos = tipos;
          if (this.modoEdicion && this.evento.tipo && typeof this.evento.tipo === 'number') {
            this.evento.tipo = this.tipos.find(t => t.id === this.evento.tipo.id) || null;
          }
          this.loading = false;
          resolve()
        },
        error: (error) => {
          console.error('Error al cargar tipos:', error);
          this.loading = false;
          this.openMensaje('Error al cargar los tipos de evento');
          this.router.navigate(['/administradores/admin', this.nombre, 'eventos']);
        }
      });
    });
  }

  cargarCiudades(): Promise<void> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.ciudadService.listar().subscribe({
        next: (ciudades: Ciudad[]) => {
          this.ciudades = ciudades;
          this.loading = false;
          resolve()
        },
        error: (error) => {
          console.error('Error al cargar las ciudades: ', error);
          this.loading = false;
          this.openMensaje('Error al cargar las ciudades');
          this.router.navigate(['/administradores/admin', this.nombre, 'eventos']);
        }
      })
    })
  }

  onCiudadChange(ciudadId: number, desdeEdicion: boolean = false): void {
    if (!ciudadId) {
      this.venuesDeCiudadSeleccionada = [];
      return;
    }
    this.ciudadSeleccionadaId = ciudadId;
    this.evento.venue = null;
    this.venueSeleccionadoId = null;
    this.loading = true;

    this.venueService.listarVenuesByCiudadId(this.ciudadSeleccionadaId).subscribe({
      next: (venues: Venue[]) => {
        this.venuesDeCiudadSeleccionada = venues || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar lugares', error);
        this.venuesDeCiudadSeleccionada = []
        this.loading = false
        this.openMensaje('Error al cargar los lugares disponibles')
      }
    })


  }


  onVenueChange(venueId: number): void {
    if (!venueId) {
      return;
    }

    const venueSeleccionado = this.venuesDeCiudadSeleccionada.find(v => Number(v.id) === Number(venueId));

    if (venueSeleccionado) {
      this.evento.venue = venueSeleccionado;
    } else {
      console.log("No se encontró el venue");
    }
  }

  crearTipoEvento() {

    this.guardarEstadoFormulario();

    this.router.navigate([
      '/administradores/admin', this.nombre, 'eventos', 'agregar', 'tipo']);
  }

  private guardarEstadoFormulario() {
    const estadoFormulario = {
      evento: this.evento,
      ciudadSeleccionadaId: this.ciudadSeleccionadaId,
      venueSeleccionadoId: this.venueSeleccionadoId,
      organizadoresEvento: this.organizadoresEvento
    };

    this.storageService.guardarDatosEvento(estadoFormulario);
  }

  private restaurarEstadoFormulario() {
    const datosGuardados = this.storageService.obtenerDatosEvento();

    // Si no hay datos guardados o ya es un objeto, no hacemos parse
    if (!datosGuardados) return;

    // Verificamos si ya es un objeto (podría venir parseado del servicio)
    if (typeof datosGuardados === 'object') {
      this.aplicarDatosGuardados(datosGuardados);
    }
    // Si es string, intentamos parsear
    else if (typeof datosGuardados === 'string') {
      try {
        const datosParseados = JSON.parse(datosGuardados);
        this.aplicarDatosGuardados(datosParseados);
      } catch (e) {
        console.error('Error al parsear datos guardados:', e);
      }
    }

    this.storageService.limpiarDatosEvento();
  }

  private aplicarDatosGuardados(datos: any) {
    this.evento = datos.evento || new Evento();
    this.ciudadSeleccionadaId = datos.ciudadSeleccionadaId || null;
    this.venueSeleccionadoId = datos.venueSeleccionadoId || null;
    this.organizadoresEvento = datos.organizadoresEvento || [];

    // Si hay ciudad seleccionada, cargar sus venues
    if (this.ciudadSeleccionadaId) {
      this.onCiudadChange(this.ciudadSeleccionadaId, true);
    }
  }

  crearEvento(): void {
    this.formEnviado = true;

    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;

    if (this.modoEdicion) {
      this.actualizarEvento()
    } else {
      this.crearNuevoEvento()
    }
  }

  validarFormulario(): boolean {
    const camposRequeridos = [
      this.evento.nombre?.trim(),
      this.evento.tipo,
      this.ciudadSeleccionadaId,
      this.evento.venue
    ];

    return camposRequeridos.every(campo => !!campo);
  }

  openMensaje(mensajeT: string, openD?: string): void {
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
        mensaje: mensajeT
      }
    });
  }

  actualizarEvento() {
    this.eventoService.editarEvento(this.evento).subscribe({
      next: (eventoActualizado) => {
        if (eventoActualizado) {
          this.loading = false;
          this.openMensaje('Evento modificado correctamente')
        }
        this.router.navigate(['/administradores/admin', this.nombre, 'eventos']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al actualizar evento:', error);
        this.openMensaje('Error al actualizar el evento');
      }
    });
  }

  crearNuevoEvento() {
    this.eventoService.crear(this.evento).subscribe({
      next: (eventoCreado) => {
        if (eventoCreado) {
          this.loading = false;
          this.openMensaje('Se creo el evento exitosamente')
        }
        this.router.navigate(['/administradores/admin', this.nombre, 'eventos']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al crear evento:', error);
        this.openMensaje('Error al crear el evento');
      }
    });
  }

  abrirSelectorFechaHora(event: MouseEvent) {
    if (navigator.userAgent.toLowerCase().includes('firefox')) {
      event.preventDefault();

      const input = event.target as HTMLInputElement;

      if ((input as any)._flatpickr) {
        (input as any)._flatpickr.open();
        return;
      }

      input.classList.add('input-field');

      const instance = flatpickr(input, {
        enableTime: true,
        dateFormat: "Y-m-d\\TH:i",
        defaultDate: this.evento.fechaApertura || new Date(),
        altInput: true,
        altFormat: "d/m/Y H:i",
        static: true,
        clickOpens: true,
        locale: Spanish,

        onReady: function (selectedDates, dateStr, instance) {
          if (instance.altInput) {
            instance.altInput.classList.add('input-field');

            const wrapper = document.createElement('div');
            wrapper.className = 'inputs';

            const parent = instance.altInput.parentNode;

            if (parent) {
              parent.insertBefore(wrapper, instance.altInput);
              wrapper.appendChild(instance.altInput);
            }

            const computedStyle = window.getComputedStyle(document.querySelector('.input-field') || document.createElement('div'));

            for (const prop of ['width', 'padding', 'border', 'borderRadius', 'fontSize', 'fontFamily', 'backgroundColor']) {
              if (computedStyle[prop]) {
                instance.altInput.style[prop] = computedStyle[prop];
              }
            }
          }

          setTimeout(() => instance.open(), 10);
        }
      });


    }
  }

  goBack() {
    this.router.navigate(['/administradores/admin', this.nombre, 'eventos']);
  }
}
