import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Ticket } from '../../../../../../models/ticket.model';
import { Localidad } from '../../../../../../models/localidad.model';
import { Tarifa } from '../../../../../../models/tarifa.model';
import { TicketDataService } from '../../../../../../service/data/ticket-data.service';
import { LocalidadDataService } from '../../../../../../service/data/localidad-data.service';
import { TarifaDataService } from '../../../../../../service/data/tarifa-data.service';
import { MensajeComponent } from '../../../../../../mensaje/mensaje.component';
import { HardcodedAutheticationService } from '../../../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-agregar-tickets',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './agregar-tickets.component.html',
  styleUrl: './agregar-tickets.component.scss'
})
export class AgregarTicketsComponent {
  // Datos básicos
  ticket: Ticket = new Ticket();
  formEnviado = false;
  loading = false;
  nombre: string;
  modoEdicion = false;

  // IDs de rutas
  ticketId: number;
  eventoId: number;
  // temporadaId: number;
  localidadId: number;
  diaId: number;
  esRutaPorEvento: boolean = false;

  // Relacionados
  localidad: Localidad;
  tarifas: Tarifa[] = [];

  // Campos del formulario
  cantidadTicket: number;
  numerados: boolean | null = null;
  cantidadPersona: number;
  numeroArriba: number;
  numeroAbajo: number;
  letra: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketDataService,
    private localidadService: LocalidadDataService,
    private tarifaService: TarifaDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();

    this.route.paramMap.subscribe(params => {
      this.eventoId = Number(params.get('idEvento'));
      // this.temporadaId = Number(params.get('idTemporada'));
      this.localidadId = Number(params.get('idLocalidad'));
      this.diaId = Number(params.get('idDia'));
      this.esRutaPorEvento = !params.has('idDia');

      // Cargar la localidad
      this.cargarLocalidad();

      const id = params.get('id');
      if (id) {
        this.ticketId = +id;
        this.modoEdicion = true;
        this.cargarTicket(this.ticketId);
      } else {
        this.cargarTarifas();
      }
    });
  }

  cargarLocalidad(): void {
    this.loading = true;
    this.localidadService.getPorId(this.localidadId).subscribe({
      next: (localidad: Localidad) => {
        this.localidad = localidad;
        this.ticket.localidad = localidad;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar localidad:', error);
        this.loading = false;
        this.openMensaje('Error al cargar la localidad');
        this.goBack();
      }
    });
  }

  cargarTarifas(callback?: () => void): void {
    this.loading = true;
    this.tarifaService.listarPorLocalidadId(this.localidadId).subscribe({
      next: (tarifas) => {
        this.tarifas = tarifas;
        this.loading = false;
        if (callback) callback();
      },
      error: (error) => {
        console.error('Error al cargar tarifas:', error);
        this.loading = false;
        if (callback) callback();
      }
    });
  }

  cargarTicket(id: number): void {
    this.loading = true;
    this.ticketService.getPorId(id).subscribe({
      next: (ticket: Ticket) => {
        this.ticket = ticket;
        this.cargarTarifas(() => {
          // Asignar la tarifa correspondiente si existe
          if (ticket.tarifa?.id) {
            const tarifaExistente = this.tarifas.find(t => t.id === ticket.tarifa.id);
            this.ticket.tarifa = tarifaExistente || null;
          }
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Error al cargar ticket:', error);
        this.loading = false;
        this.openMensaje('Error al cargar el ticket');
        this.goBack();
      }
    });
  }

  crearOActualizarTicket(): void {
    this.formEnviado = true;
    this.loading = true;

    if (!this.validarFormulario()) {
      this.loading = false;
      return;
    }

    if (this.modoEdicion) {
      this.actualizarTicket();
    } else {
      this.crearTicket();
    }
  }

  validarFormulario(): boolean {
    // Validaciones comunes
    if (!this.localidad) {
      this.openMensaje('Localidad no cargada');
      return false;
    }

    if (this.modoEdicion) {
      // Solo validaciones de edición
      if (!this.ticket.numero) {
        this.openMensaje('El número de ticket es obligatorio');
        return false;
      }
      if (!this.ticket.tarifa) {
        this.openMensaje('Debe seleccionar una tarifa');
        return false;
      }
      // No valides cantidadPersona ni campos de agregar aquí
    } else {
      // Solo validaciones de alta
      if (!this.cantidadPersona) {
        this.openMensaje('La cantidad de personas es obligatoria');
        return false;
      }
      if (this.numerados === null) {
        this.openMensaje('Debe especificar si los tickets son numerados');
        return false;
      }
      if (!this.numerados) {
        this.numeroArriba = this.cantidadTicket
        this.numeroAbajo = 1
      }
      if (!this.cantidadTicket) {
        this.openMensaje('La cantidad de tickets es obligatoria');
        return false;
      }
      if (this.numerados && (!this.numeroAbajo || !this.numeroArriba)) {
        this.openMensaje('Para tickets numerados debe especificar rango');
        return false;
      }
      if (this.numerados && this.numeroAbajo > this.numeroArriba) {
        this.openMensaje('El número mínimo no puede ser mayor al máximo');
        return false;
      }
    }

    return true;
  }




  crearTicket(): void {
    const numerados = this.numerados ?? false;
    if (!this.numerados) {
      this.numeroArriba = this.cantidadTicket
      this.numeroAbajo = 1
    }

    this.ticketService.crearTicketsNumerados(
      this.localidadId,
      this.numeroArriba,
      this.numeroAbajo,
      this.letra,
      numerados,
      this.cantidadPersona
    ).subscribe({
      next: (response) => {
        const cantidad = numerados ? (this.numeroArriba - this.numeroAbajo + 1) : this.cantidadTicket;
        this.openMensaje(`${cantidad} Tickets agregados a la localidad ${this.localidad.nombre}`);
        this.goBack();
      },
      error: (error) => {
        console.error('Error al crear tickets:', error);
        this.openMensaje('Error al crear tickets');
        this.loading = false;
      }
    });
  }

  actualizarTicket(forzar: boolean = false): void {
    this.loading = true;
    this.ticketService.actualizarTicket(this.ticket, forzar).subscribe({
      next: (response: any) => {
        // Si el backend retorna advertencia en 200 (poco común, pero por si acaso)
        if (response && response.advertencia) {
          this.openMensaje(response.advertencia, true).subscribe((confirmado) => {
            if (confirmado) {
              this.actualizarTicket(true);
            } else {
              this.loading = false;
            }
          });
        } else {
          this.openMensaje('Ticket actualizado exitosamente').subscribe(() => {
            this.goBack();
          });
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        // Manejo especial para advertencia (409)
        if (error.status === 409) {
          const advertencia = error.error?.advertencia || error.error?.mensaje || 'Hay advertencias. ¿Desea continuar?';
          this.openMensaje(advertencia, true).subscribe((confirmado) => {
            if (confirmado) {
              this.actualizarTicket(true);
            }
          });
        } else if (error.status === 404) {
          this.openMensaje('El ticket no fue encontrado').subscribe();
        } else {
          const mensaje = error?.error?.mensaje || 'Error al actualizar ticket';
          this.openMensaje(mensaje).subscribe();
        }
      }
    });
  }



  onNumeradosChange(): void {
    this.numerados = this.numerados ?? false;
    if (this.numerados) {
      // Calcular cantidad automáticamente para numerados
      if (this.numeroAbajo && this.numeroArriba) {
        this.cantidadTicket = this.numeroArriba - this.numeroAbajo + 1;
      }
    } else {
      // Resetear valores para no numerados
      this.numeroArriba = null;
      this.numeroAbajo = null;
      this.letra = '';
    }
  }

  onInputNumber(event: Event, campo: 'cantidadT' | 'cantidadP' | 'minimo' | 'maximo'): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/[^\d]/g, '');
    let numericValue = rawValue ? parseInt(rawValue, 10) : null;

    if (numericValue != null && numericValue > 1000000000) {
      numericValue = 1000000000;
    }

    input.value = numericValue?.toString() ?? '';

    // Asignar a la propiedad correspondiente
    switch (campo) {
      case 'cantidadT': this.cantidadTicket = numericValue; break;
      case 'cantidadP': this.cantidadPersona = numericValue; break;
      case 'minimo':
        this.numeroAbajo = numericValue;
        if (this.numerados && this.numeroArriba) {
          this.cantidadTicket = this.numeroArriba - this.numeroAbajo + 1;
        }
        break;
      case 'maximo':
        this.numeroArriba = numericValue;
        if (this.numerados && this.numeroAbajo) {
          this.cantidadTicket = this.numeroArriba - this.numeroAbajo + 1;
        }
        break;
    }
  }

  goBack(): void {
    if (this.esRutaPorEvento) {
      this.router.navigate([
        '/administradores/admin', this.nombre,
        'evento', this.eventoId, 'localidad', this.localidadId, 'tickets'
      ]);
    } else {
      this.router.navigate([
        '/administradores/admin', this.nombre,
        'evento', this.eventoId, 'dia', this.diaId, 'localidad', this.localidadId, 'tickets'
      ]);
    }
  }

  openMensaje(mensaje: string, confirmacion: boolean = false): Observable<boolean> {
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
        mensaje: mensaje,
        mostrarBotones: confirmacion
      }
    });
    return dialogRef.afterClosed();
  }
}