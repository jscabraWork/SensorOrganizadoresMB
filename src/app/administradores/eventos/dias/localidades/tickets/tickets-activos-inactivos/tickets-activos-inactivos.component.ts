import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableComponent } from '../../../../../../commons-ui/table/table.component';
import { Ticket } from '../../../../../../models/ticket.model';
import { TicketDataService } from '../../../../../../service/data/ticket-data.service';
import { MatDialog } from '@angular/material/dialog';
import { Page } from '../../../../../../models/page.mode';
import { MensajeComponent } from '../../../../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { Filter, SearchFilterComponent } from '../../../../../../commons-ui/search-filter/search-filter.component';
import { AgregarClienteTicketComponent } from '../agregar-cliente-ticket/agregar-cliente-ticket.component';
import { tick } from '@angular/core/testing';
import { HardcodedAutheticationService } from '../../../../../../service/hardcoded-authetication.service';


@Component({
  selector: 'app-tickets-activos-inactivos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableComponent,
    SearchFilterComponent
  ],
  templateUrl: './tickets-activos-inactivos.component.html',
  styleUrl: './tickets-activos-inactivos.component.scss'
})
export class TicketsActivosInactivosComponent {


  paginaActual: number = 0;
  tamañoPagina: number = 25;
  totalTickets: number = 0;
  ticketsPage!: Page<Ticket>;
  cantidadAgregar: number
  documentoAdmin: any
  private ultimoEstadoCargado: number | null = null;
  private ultimaLocalidadCargada: number | null = null;

  searchFilters: Filter[] = [
    {
      key: 'search',
      value: '',
      placeholder: 'Buscar por ID',
      label: 'Buscar'
    }
  ];

  ESTADOS_TICKET = {
    DISPONIBLE: 0,
    VENDIDO: 1,
    RESERVADO: 2,
    EN_PROCESO: 3,
    NO_DISPONIBLE: 4
  };

  selectsTabla = [
    {
      nombreCampo: 'estado',
      opciones: [
        { value: this.ESTADOS_TICKET.DISPONIBLE, label: 'Disponible' },
        { value: this.ESTADOS_TICKET.VENDIDO, label: 'Vendido' },
        { value: this.ESTADOS_TICKET.RESERVADO, label: 'Reservado' },
        { value: this.ESTADOS_TICKET.EN_PROCESO, label: 'En Proceso' },
        { value: this.ESTADOS_TICKET.NO_DISPONIBLE, label: 'No Disponible' }
      ],
      clase: 'estado-select',
      action: (ticket: Ticket, newValue: number) => {
        this.cambiarEstado(ticket, newValue);
      }
    },
  ];

  expandableConfig = {
    infoFields: [
      { label: 'Número', property: 'numero' },
      { label: 'Precio total', property: 'precioTotal' },
      { label: 'Personas en el ticket', property: 'personasPorTicket' },
      { label: 'Utilizado', property: 'utilizadoPorDia' },
      {
        label: 'Cliente',
        property: 'clienteNombre',
        isNested: 'cliente',
        showWhen: (ticket: Ticket) => ticket.estado === this.ESTADOS_TICKET.VENDIDO
      },
      {
        label: 'Documento Cliente',
        property: 'clienteDocumento',
        isNested: 'cliente',
        showWhen: (ticket: Ticket) => ticket.estado === this.ESTADOS_TICKET.VENDIDO
      },
      {
        label: 'Email Cliente',
        property: 'clienteEmail',
        isNested: 'cliente',
        showWhen: (ticket: Ticket) => ticket.estado === this.ESTADOS_TICKET.VENDIDO
      },
      {
        label: 'Teléfono Cliente',
        property: 'clienteTelefono',
        isNested: 'cliente',
        showWhen: (ticket: Ticket) => ticket.estado === this.ESTADOS_TICKET.VENDIDO
      }
    ],
    actionButtons: [
      {
        text: 'Editar',
        class: 'btn-editar',
        action: (ticket: Ticket) => this.editarTicket(ticket),
      },
      {
        text: 'Eliminar',
        class: 'btn-eliminar',
        action: (ticket: Ticket) => this.eliminarTicket(ticket.id)
      },
      {
        text: 'Asignar Persona',
        class: 'btn-cliente',
        action: (ticket: Ticket) => this.asignarCliente(ticket)
      },
      {
        text: 'Asignar Promotor',
        class: 'btn-promotor',
        action: (ticket: Ticket) => this.eliminarTicket(ticket.id)
      },
      {
        text: 'Agregar Tickets',
        class: 'btn-tickets',
        action: (ticket: Ticket) => this.agregarTickets(ticket.id),
        mostrar: (parent: Ticket) => parent.tipo === 0 && Array.isArray(parent.asientos) && parent.asientos.length > 0
      }
    ],
    selects: [
      {
        property: 'estado',
        options: [
          { value: this.ESTADOS_TICKET.DISPONIBLE, label: 'Disponible' },
          { value: this.ESTADOS_TICKET.VENDIDO, label: 'Vendido' },
          { value: this.ESTADOS_TICKET.RESERVADO, label: 'Reservado' },
          { value: this.ESTADOS_TICKET.EN_PROCESO, label: 'En Proceso' },
          { value: this.ESTADOS_TICKET.NO_DISPONIBLE, label: 'No Disponible' }
        ],
        action: (item: any, value: any) => {
          this.cambiarEstado(item, value);
        }
      },
      {
        property: 'tipo',
        options: [
          { value: 0, label: 'Ticket Completo' },
          { value: 1, label: 'Ticket Palco' }
        ],
        action: (ticket: Ticket) => this.cambiarTipo(ticket)
      }
    ],
    // Configuración de la subtabla
    subTableConfig: {
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'numero', label: 'Número' },
        { key: 'precioTotal', label: 'Precio Total' },
      ],
      dataProperty: 'asientos', // La propiedad donde se almacenarán los hijos
      buttons: [
        {
          text: 'Editar',
          class: 'btn-editar',
          action: (parent: Ticket, child: Ticket) => this.editarTicket(child),
          mostrar: (parent: Ticket, child: Ticket) => child.tipo === 1
        },
        {
          text: 'Eliminar',
          class: 'btn-eliminar',
          action: (parent: Ticket, child: Ticket) => this.eliminarTicket(child.id)
        },
        {
          text: 'Asignar Persona',
          class: 'btn-cliente',
          action: (ticket: Ticket) => this.asignarCliente(ticket)
        },
        {
          text: 'Asignar Promotor',
          class: 'btn-promotor',
          action: (ticket: Ticket) => this.eliminarTicket(ticket.id)
        }
      ],
      selects: [
        {
          property: 'estado',
          options: [
            { value: this.ESTADOS_TICKET.DISPONIBLE, label: 'Disponible' },
            { value: this.ESTADOS_TICKET.VENDIDO, label: 'Vendido' },
            { value: this.ESTADOS_TICKET.RESERVADO, label: 'Reservado' },
            { value: this.ESTADOS_TICKET.EN_PROCESO, label: 'En Proceso' },
            { value: this.ESTADOS_TICKET.NO_DISPONIBLE, label: 'No Disponible' }
          ],
          action: (parent: Ticket, child: Ticket, value: any) => {
            child.estado = value;
            action: (ticket: Ticket, newValue: number) => this.cambiarEstado(ticket, newValue)
          }
        }
      ],
      expandableConfig: {
        infoFields: [
          { label: 'Número', property: 'numero' },
          { label: 'Precio total', property: 'precioTotal' },
          { label: 'Personas en el ticket', property: 'personasPorTicket' },
          { label: 'Utilizado', property: 'diasUtilizados' },
          {
            label: 'Cliente',
            property: 'clienteNombre',
            isNested: true,
            showWhen: (parent: Ticket, child: Ticket) => child.estado === this.ESTADOS_TICKET.VENDIDO
          },
          {
            label: 'Documento Cliente',
            property: 'clienteDocumento',
            isNested: true,
            showWhen: (parent: Ticket, child: Ticket) => child.estado === this.ESTADOS_TICKET.VENDIDO
          },
          {
            label: 'Email Cliente',
            property: 'clienteEmail',
            isNested: true,
            showWhen: (parent: Ticket, child: Ticket) => child.estado === this.ESTADOS_TICKET.VENDIDO
          },
          {
            label: 'Teléfono Cliente',
            property: 'clienteTelefono',
            isNested: true,
            showWhen: (parent: Ticket, child: Ticket) => child.estado === this.ESTADOS_TICKET.VENDIDO
          }
        ]
      }
    }
  };

  selectedItem: number | null = null;
  cargando: boolean
  tickets: Ticket[] = []
  nombre: string;
  // temporadaId: number
  eventoId: number
  diaId: number | null
  localidadId: number
  estadoActual: number | null = null;
  esRutaPorEvento: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin();

    this.route.parent?.paramMap.subscribe(params => {
      // this.temporadaId = Number(params.get('idTemporada'));
      this.eventoId = Number(params.get('idEvento'));
      this.localidadId = Number(params.get('idLocalidad'));

      this.diaId = params.has('idDia') ? Number(params.get('idDia')) : null;
      this.esRutaPorEvento = this.diaId === null;
      this.documentoAdmin = this.autenticado.getCC()

      this.determinarRuta();
      if (this.localidadId !== null && this.estadoActual !== null) {
        this.cargarTickets();
      }
    });
  }

  determinarRuta(): void {
    const segments = this.router.url.split('/');
    const lastSegment = segments[segments.length - 1];

    // Mapeo de segmentos de URL a estados
    const estadoPorRuta = {
      'disponibles': this.ESTADOS_TICKET.DISPONIBLE,
      'vendidos': this.ESTADOS_TICKET.VENDIDO,
      'reservados': this.ESTADOS_TICKET.RESERVADO,
      'proceso': this.ESTADOS_TICKET.EN_PROCESO,
      'no-disponibles': this.ESTADOS_TICKET.NO_DISPONIBLE
    };

    const nuevoEstado = estadoPorRuta[lastSegment] ?? null;
    // Solo resetear la página si cambió el estado o la localidad
    if (nuevoEstado !== this.ultimoEstadoCargado || this.localidadId !== this.ultimaLocalidadCargada) {
      this.paginaActual = 0;
    }

    this.estadoActual = nuevoEstado;
    this.ultimoEstadoCargado = nuevoEstado;
    this.ultimaLocalidadCargada = this.localidadId;
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.cargarTickets();
  }


  cargarTickets(page: number = this.paginaActual, size: number = this.tamañoPagina) {
    if (this.localidadId === null || this.estadoActual === null) return;

    this.cargando = true;

    this.ticketService.listarPorLocalidadYEstado(this.localidadId, this.estadoActual, page, size).subscribe({
      next: (response) => {
        if (response && response.content) {
          this.ticketsPage = {
            ...response,
            content: response.content.map(ticket => this.procesarTicket(ticket))
          };
          this.totalTickets = response.totalElements;
          this.paginaActual = response.number;
          this.tamañoPagina = response.size;
        } else {
          // Si no hay datos, inicializar con valores vacíos
          this.ticketsPage = {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: this.tamañoPagina,
            number: this.paginaActual
          };
          this.totalTickets = 0;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando tickets', error);
        // En caso de error, también inicializar con valores vacíos
        this.ticketsPage = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: this.tamañoPagina,
          number: this.paginaActual
        };
        this.totalTickets = 0;
        this.cargando = false;
      }
    });
  }

  procesarTicket(ticket: Ticket): any {

    let ingresosPorDia = '';
    if (ticket.ingresos && ticket.ingresos.length > 0) {
      const diasInfo = ticket.ingresos.map(ingreso => {
        const nombreDia = 'Dia ' + ingreso.dia?.nombre || '';
        const estado = ingreso.utilizada ? 'Si' : 'No';
        return `${nombreDia} - ${estado}`;
      });
      ingresosPorDia = diasInfo.join(', ');
    } else {
      ingresosPorDia = 'Sin ingresos';
    }

    return {
      ...ticket,
      numero: ticket.numero || ticket.id.toString(),
      precioTotal: (ticket.tarifa && ticket.tarifa.precio !== null && ticket.tarifa.precio !== undefined)
        ? ticket.tarifa.precio + ticket.tarifa.servicio + ticket.tarifa.iva
        : 'Sin Asignar',
      personasEnElTicket: ticket.personasPorTicket || 1,
      clienteNombre: ticket.cliente?.nombre,
      clienteEmail: ticket.cliente?.correo,
      clienteTelefono: ticket.cliente?.celular,
      clienteDocumento: ticket.cliente?.numeroDocumento,
      utilizadoPorDia: ingresosPorDia
    };
  }

  onExpandRow(ticket: Ticket | undefined): void {
    if (ticket && (!ticket.asientos || ticket.asientos.length === 0)) {
      this.ticketService.obtenerHijosDelPalco(ticket.id).subscribe({
        next: (hijos) => {
          const ticketEncontrado = this.ticketsPage?.content.find(t => t.id === ticket.id);
          if (!ticketEncontrado) {
            console.error('No se encontró el ticket en la página actual');
            return;
          }

          ticketEncontrado.asientos = hijos.map(hijo => this.procesarTicket(hijo));

          this.ticketsPage = { ...this.ticketsPage }; // Para forzar detección de cambios
        },
        error: (err) => {
          console.error('Error al cargar tickets hijos:', err);
          this.openMensaje('Error al cargar los asientos del palco').subscribe();
        }
      });
    }
  }

  cambiarTipo(ticket: Ticket) {
  }

  cambiarEstado(ticket: Ticket, estado: number, forzar: boolean = false): void {
  const estadoAnterior = ticket.estado;
  this.cargando = true;

  // Mapeo de estado a segmento de ruta
  const estadoToRuta: { [key: number]: string } = {
    [this.ESTADOS_TICKET.DISPONIBLE]: 'disponibles',
    [this.ESTADOS_TICKET.VENDIDO]: 'vendidos',
    [this.ESTADOS_TICKET.RESERVADO]: 'reservados',
    [this.ESTADOS_TICKET.EN_PROCESO]: 'proceso'
  };

  this.ticketService.editarEstadoTicket(ticket.id, estado, forzar).subscribe({
    next: (response) => {
      this.cargando = false;

      if (response.exito || response.ticketsActualizados) {
        this.openMensaje(response.mensaje || 'Estado(s) actualizado(s) correctamente');

        // Redirección según el nuevo estado
        const segmentoRuta = estadoToRuta[estado];
        if (segmentoRuta) {
          let ruta: any[] = [];
          if (this.esRutaPorEvento) {
            ruta = [
              '/administradores', 'admin', this.nombre,
              'evento', this.eventoId,
              'localidad', this.localidadId,
              'tickets', segmentoRuta
            ];
          } else {
            ruta = [
              '/administradores', 'admin', this.nombre,
              'evento', this.eventoId,
              'dia', this.diaId,
              'localidad', this.localidadId,
              'tickets', segmentoRuta
            ];
          }
          this.router.navigate(ruta);
        }

        this.cargarTickets();
      }
      else {
        this.openMensaje('Error al intentar cambiar el estado');
        ticket.estado = estadoAnterior;
        this.cargarTickets();
      }
    },

    error: (error) => {
      this.cargando = false;
      console.error('Error al cambiar estado:', error);

      ticket.estado = estadoAnterior;

      if (error.status === 409 && error.error?.requiereConfirmacion) {
        // Manejar caso de confirmación requerida
        this.openMensaje(error.error.advertencia, true).subscribe({
          next: (confirmado) => {
            if (confirmado) {
              this.cambiarEstado(ticket, estado, true);
            } else {
              ticket.estado = estadoAnterior;
              this.cargarTickets();
            }
          },
          error: () => {
            this.openMensaje("Sucedio un error vuelve a intentar o comunicate con tu administrador")
            ticket.estado = estadoAnterior;
            this.cargarTickets();
          }
        });
      }
      else if (error.status === 404) {
        this.openMensaje('El ticket no fue encontrado');
        this.cargarTickets();
      } else if (error.status === 500) {
        this.openMensaje('Error interno del servidor al cambiar el estado');
        this.cargarTickets();
      } else if (error.status === 400) {
        this.openMensaje('Datos inválidos para cambiar el estado');
        this.cargarTickets();
      } else {
        this.openMensaje(
          error.error?.mensaje ||
          error.error?.message ||
          'Error inesperado al cambiar el estado de los tickets'
        );
        this.cargarTickets();
      }
    }
  });
}


  filtrar(filtros: { [key: string]: string }) {
    const terminoBusqueda = filtros['search'] || '';

    if (terminoBusqueda) {
      const ticketId = Number(terminoBusqueda);

      if (isNaN(ticketId)) {
        this.openMensaje('Por favor ingrese un ID válido (número)').subscribe();
        return;
      }

      this.cargando = true;
      this.ticketService.buscarPorLocalidadYEstado(
        ticketId, // pId
        this.localidadId, // localidadId 
        this.estadoActual // pEstado
      ).subscribe({
        next: (ticket) => {
          if (ticket) {
            // Crear una página con un solo ticket
            this.ticketsPage = {
              content: [this.procesarTicket(ticket)],
              totalElements: 1,
              totalPages: 1,
              size: 1,
              number: 0
            };
            this.totalTickets = 1;
          } else {
            // No se encontró el ticket
            this.ticketsPage = {
              content: [],
              totalElements: 0,
              totalPages: 0,
              size: this.tamañoPagina,
              number: this.paginaActual
            };
            this.totalTickets = 0;
            this.openMensaje('No se encontró ningún ticket ' + this.getTextoEstado() + ' con ese ID').subscribe(() => {
              this.searchFilters.find(f => f.key === 'search')!.value = '';
              this.cargarTickets();
            });
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al buscar ticket', error);
          this.ticketsPage = {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: this.tamañoPagina,
            number: this.paginaActual
          };
          this.totalTickets = 0;
          this.cargando = false;
          if (error.status === 404) {
            this.openMensaje('No se encontró ningún ticket ' + this.getTextoEstado() + ' con el ID ' + ticketId).subscribe(() => {
              this.searchFilters.find(f => f.key === 'search')!.value = '';
              this.cargarTickets();
            });
          } else {
            this.openMensaje('Error al buscar el ticket').subscribe();
          }
        }
      });
    } else {
      // Si no hay término de búsqueda, cargar todos los tickets normalmente
      this.cargarTickets();
    }
  }

  editarTicket(ticket: Ticket): void {
    if (ticket.estado != 0 && ticket.tipo === 1) {
      this.openMensaje('No se puede modificar el ticket porque no esta disponible')
      return
    }
    const basePath = this.esRutaPorEvento
      ? `administradores/admin/${this.nombre}/evento/${this.eventoId}/localidad/${this.localidadId}`
      : `administradores/admin/${this.nombre}/evento/${this.eventoId}/dia/${this.diaId}/localidad/${this.localidadId}`;

    this.router.navigate([`${basePath}/ticket/editar/${ticket.id}`]);
  }

  agregarTickets(ticketId: number): void {
    const dialogRef = this.dialog.open(MensajeComponent, {
      width: '400px',
      data: {
        mensaje: 'Ingrese la cantidad de tickets a agregar',
        mostrarBotones: true,
        mostrarInputNumero: true
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && resultado.confirmado && resultado.numero > 0) {
        // Si la cantidad es mayor a 100, pide confirmación extra
        if (resultado.numero > 100) {
          this.openMensaje('¿Está seguro de agregar más de 100 tickets?', true).subscribe((confirmado) => {
            if (confirmado) {
              this.ticketService.agregarHijos(ticketId, resultado.numero).subscribe({
                next: () => {
                  this.openMensaje('Tickets agregados correctamente').subscribe();
                  this.cargarTickets();
                },
                error: () => {
                  this.openMensaje('Ocurrió un error al agregar los tickets').subscribe();
                }
              });
            }
          });
        } else {
          // Si la cantidad es 100 o menos, agrega directamente
          this.ticketService.agregarHijos(ticketId, resultado.numero).subscribe({
            next: () => {
              this.openMensaje('Tickets agregados correctamente').subscribe();
              this.cargarTickets();
            },
            error: () => {
              this.openMensaje('Ocurrió un error al agregar los tickets').subscribe();
            }
          });
        }
      }
    });
  }

  asignarCliente(ticket: Ticket) {
    const dialogRef = this.dialog.open(AgregarClienteTicketComponent, {
      width: '600px',
      height: 'auto',
      data: {
        ticket: ticket,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.dialog.closeAll();
    });
  }


  eliminarTicket(id: number) {
    this.openMensaje("¿Desea borrar el ticket?", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true
        this.ticketService.eliminarSiNoTieneOrdenes(id).subscribe({
          next: () => {
            this.cargando = false
            this.openMensaje('Se borró exitosamente el ticket').subscribe();
            this.cargarTickets();
          },
          error: (error) => {
            this.cargando = false
            const mensaje = error?.error?.error || "Ocurrió un error al intentar eliminar el ticket"
            this.openMensaje(mensaje).subscribe()
          }
        })
      }
    })
  }

  getTextoEstado(): string {
    if (this.estadoActual === null) return '';

    const estadoTexto = {
      [this.ESTADOS_TICKET.DISPONIBLE]: 'disponible',
      [this.ESTADOS_TICKET.VENDIDO]: 'vendido',
      [this.ESTADOS_TICKET.RESERVADO]: 'reservado',
      [this.ESTADOS_TICKET.EN_PROCESO]: 'en proceso',
      [this.ESTADOS_TICKET.NO_DISPONIBLE]: 'no disponible'
    };

    return estadoTexto[this.estadoActual] || '';
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

  openDialogCantidadTickets(ticket: Ticket): void {
    const dialogRef = this.dialog.open(MensajeComponent, {
      width: '400px',
      data: {
        mensaje: 'Ingrese la cantidad de tickets a agregar',
        mostrarBotones: true,
        mostrarInputNumero: true,
        placeholderInput: 'Cantidad de tickets',
        ticketId: ticket.id
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && typeof resultado === 'object' && resultado.confirmado && resultado.numero > 0) {
        this.agregarTickets(ticket.id);
      }
    });
  }



}
