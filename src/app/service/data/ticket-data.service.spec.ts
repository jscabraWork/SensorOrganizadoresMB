import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TicketDataService } from './ticket-data.service';
import { Ticket } from '../../models/ticket.model';
import { API_URL_PAGOS } from '../../app.constants';
import { Page } from '../../models/page.mode';

fdescribe('TicketDataService', () => {
  let service: TicketDataService;
  let httpMock: HttpTestingController;

  const mockApiUrl = API_URL_PAGOS;
  const mockTickets: Ticket[] = [
    {
      id: 1,
      estado: 2,
      tipo: 0,
      numero: "T001",
      ordenes: [],        
      servicios: [],      
      asientos: [],       
      palco: null,        
      localidad: null,
      tarifa: null,
      ingresos:null,
      seguro: null,
      cliente: null,
      personasPorTicket: 0
    },
    {
      id: 2,
      estado: 2,
      tipo: 0,
      numero: "T002",
      ordenes: [],        
      servicios: [],      
      asientos: [],       
      palco: null,        
      localidad: null,
      seguro: null,
      tarifa: null,
      ingresos:null,
      cliente: null,
      personasPorTicket: 0
    }
  ];

  const mockPage: Page<Ticket> = {
  content: mockTickets,
  totalElements: 2,
  totalPages: 1,
  size: 10,
  number: 0
};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TicketDataService,
        { provide: API_URL_PAGOS, useValue: mockApiUrl }
      ]
    });

    service = TestBed.inject(TicketDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTickets', () => {
    it('debería retornar un array de tickets', () => {
      const ordenId = 1;
      service.listarTickets(ordenId).subscribe(tickets => {
        expect(tickets).toEqual(mockTickets);
        expect(tickets.length).toBe(2);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/tickets/listarTickets/${ordenId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTickets);
    });

    it('si falla devuelve un error', () => {
      const errorMessage = 'Error en la solicitud';
      const ordenId = 1;

      service.listarTickets(ordenId).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
          expect(error.statusText).toBe('Server Error');
        }
      });
      const req = httpMock.expectOne(`${mockApiUrl}/tickets/listarTickets/${ordenId}`);
      req.flush(errorMessage, {
        status: 500,
        statusText: 'Server Error'
      });
    });
  });

  describe('buscarPorLocalidadYEstado', () => {
    it('debería retornar un ticket por localidad y estado', () => {
      const pId = 1;
      const localidadId = 2;
      const pEstado = 3;
      const mockTicket: Ticket = mockTickets[0];

      service.buscarPorLocalidadYEstado(pId, localidadId, pEstado).subscribe(ticket => {
        expect(ticket).toEqual(mockTicket);
      });

      const req = httpMock.expectOne(
        req => req.url === `${mockApiUrl}/tickets/buscar/${pId}` &&
               req.params.get('localidadId') === localidadId.toString() &&
               req.params.get('pEstado') === pEstado.toString()
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTicket);
    });

    it('debería manejar errores en buscarPorLocalidadYEstado', () => {
      const pId = 1;
      const localidadId = 2;
      const pEstado = 3;
      const errorMessage = 'Error en la búsqueda';

      service.buscarPorLocalidadYEstado(pId, localidadId, pEstado).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(
        req => req.url === `${mockApiUrl}/tickets/buscar/${pId}` &&
               req.params.get('localidadId') === localidadId.toString() &&
               req.params.get('pEstado') === pEstado.toString()
      );
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('listarPorLocalidadYEstado', () => {
    it('debería retornar una página de tickets por localidad y estado', () => {
      const localidadId = 1;
      const estado = 2;
      const page = 0;
      const size = 10;

      service.listarPorLocalidadYEstado(localidadId, estado, page, size).subscribe(result => {
        expect(result).toEqual(mockPage);
        expect(result.content.length).toBe(2);
      });

      const req = httpMock.expectOne(
        req => req.url === `${mockApiUrl}/tickets/listar/estado/${localidadId}` &&
               req.params.get('pEstado') === estado.toString() &&
               req.params.get('page') === page.toString() &&
               req.params.get('size') === size.toString()
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('debería manejar errores en listarPorLocalidadYEstado', () => {
      const localidadId = 1;
      const estado = 2;
      const errorMessage = 'Error en la lista';

      service.listarPorLocalidadYEstado(localidadId, estado).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(
        req => req.url === `${mockApiUrl}/tickets/listar/estado/${localidadId}` &&
               req.params.get('pEstado') === estado.toString()
      );
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('crearTicketsNumerados', () => {
    it('debería crear tickets numerados correctamente', () => {
      const localidadId = 1;
      const numeroArriba = 1;
      const numeroAbajo = 10;
      const letra = 'A';
      const numerado = true;
      const personas = 2;
      const mockResponse = { message: 'Tickets creados exitosamente' };

      service.crearTicketsNumerados(localidadId, numeroArriba, numeroAbajo, letra, numerado, personas)
        .subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        req => req.url === `${mockApiUrl}/tickets/crear` &&
               req.method === 'POST' &&
               req.params.get('localidadId') === localidadId.toString() &&
               req.params.get('numeroArriba') === numeroArriba.toString() &&
               req.params.get('numeroAbajo') === numeroAbajo.toString() &&
               req.params.get('letra') === letra &&
               req.params.get('numerado') === numerado.toString() &&
               req.params.get('personas') === personas.toString()
      );
      req.flush(mockResponse);
    });

    it('debería manejar errores al crear tickets numerados', () => {
      const localidadId = 1;
      const errorMessage = 'Error al crear tickets';
      const numeroArriba = 1;
      const numeroAbajo = 10;
      const letra = 'A';
      const numerado = true;
      const personas = 2;
      
      service.crearTicketsNumerados(localidadId, numeroArriba, numeroAbajo, letra, numerado, personas).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      });

      // Cambiar esta línea:
      const req = httpMock.expectOne(
        req => req.url === `${mockApiUrl}/tickets/crear` &&
              req.method === 'POST' &&
              req.params.get('numeroArriba') === numeroArriba.toString() &&
              req.params.get('numeroAbajo') === numeroAbajo.toString() &&
              req.params.get('letra') === letra &&
              req.params.get('numerado') === numerado.toString() &&
              req.params.get('personas') === personas.toString()
      );
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('obtenerHijosDelPalco', () => {
    it('debería obtener los hijos de un palco', () => {
      const ticketId = 1;
      const mockHijos: Ticket[] = [mockTickets[1]];

      service.obtenerHijosDelPalco(ticketId).subscribe(hijos => {
        expect(hijos).toEqual(mockHijos);
        expect(hijos.length).toBe(1);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/tickets/${ticketId}/hijos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHijos);
    });

    it('debería manejar errores al obtener hijos del palco', () => {
      const ticketId = 1;
      const errorMessage = 'Palco no encontrado';

      service.obtenerHijosDelPalco(ticketId).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/tickets/${ticketId}/hijos`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('eliminarSiNoTieneOrdenes', () => {
    it('debería eliminar un ticket si no tiene órdenes', () => {
      const ticketId = 1;

      service.eliminarSiNoTieneOrdenes(ticketId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${mockApiUrl}/tickets/borrar/${ticketId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('debería manejar errores al eliminar ticket', () => {
      const ticketId = 1;
      const errorMessage = 'El ticket tiene órdenes asociadas';

      service.eliminarSiNoTieneOrdenes(ticketId).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/tickets/borrar/${ticketId}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('agregarHijos', () => {
    it('debería agregar hijos a un ticket', () => {
      const ticketId = 1;
      const cantidad = 2;

      service.agregarHijos(ticketId, cantidad).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(
        req => req.url === `${mockApiUrl}/tickets/${ticketId}/agregar-hijos` &&
               req.method === 'POST' &&
               req.params.get('cantidad') === cantidad.toString()
      );
      req.flush(null);
    });

    it('debería manejar errores al agregar hijos', () => {
      const ticketId = 1;
      const cantidad = 2;
      const errorMessage = 'Error al agregar hijos';

      service.agregarHijos(ticketId, cantidad).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      });

      // Cambiar esta línea:
      const req = httpMock.expectOne(
        req => req.url === `${mockApiUrl}/tickets/${ticketId}/agregar-hijos` &&
              req.method === 'POST' &&
              req.params.get('cantidad') === cantidad.toString()
      );
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('editarEstadoTicket', () => {
  it('debería actualizar el estado de un ticket sin forzar', () => {
    const id = mockTickets[0].id;
    const estado = 3;
    const forzar = false;
    const mockResponse = { success: true };
    
    service.editarEstadoTicket(id, estado, forzar).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    
    const req = httpMock.expectOne(
      req => req.url === `${mockApiUrl}/tickets/estado/${id}` &&
             req.params.get('estado') === estado.toString() &&
             req.params.get('forzar') === forzar.toString()
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBeNull();
    req.flush(mockResponse);
  });

  it('debería actualizar el estado de un ticket forzadamente', () => {
    const id = mockTickets[0].id;
    const estado = 4;
    const forzar = true;
    const mockResponse = { success: true };
    
    service.editarEstadoTicket(id, estado, forzar).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    
    const req = httpMock.expectOne(
      req => req.url === `${mockApiUrl}/tickets/estado/${id}` &&
             req.params.get('estado') === estado.toString() &&
             req.params.get('forzar') === forzar.toString()
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('debería usar false como valor por defecto para forzar', () => {
    const id = mockTickets[0].id;
    const estado = 2;
    const mockResponse = { success: true };
    
    service.editarEstadoTicket(id, estado).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    
    const req = httpMock.expectOne(
      req => req.url === `${mockApiUrl}/tickets/estado/${id}` &&
             req.params.get('estado') === estado.toString() &&
             req.params.get('forzar') === 'false' // Siempre será 'false' por defecto
    );
    req.flush(mockResponse);
  });

  it('debería manejar errores al actualizar el estado', () => {
    const id = mockTickets[0].id;
    const estado = 3;
    const forzar = false;
    const errorMessage = 'Error al actualizar estado';
    
    service.editarEstadoTicket(id, estado, forzar).subscribe({
      next: () => fail('debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.error).toBe(errorMessage);
      }
    });
    
    const req = httpMock.expectOne(
      req => req.url === `${mockApiUrl}/tickets/estado/${id}` &&
             req.params.get('estado') === estado.toString() &&
             req.params.get('forzar') === forzar.toString()
    );
    req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
  });

  it('debería manejar errores del servidor', () => {
    const id = mockTickets[0].id;
    const estado = 3;
    const forzar = true;
    const errorMessage = 'Error interno del servidor';
    
    service.editarEstadoTicket(id, estado, forzar).subscribe({
      next: () => fail('debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.error).toBe(errorMessage);
      }
    });
    
    const req = httpMock.expectOne(
      req => req.url === `${mockApiUrl}/tickets/estado/${id}` &&
             req.params.get('estado') === estado.toString() &&
             req.params.get('forzar') === forzar.toString()
    );
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
  });
});

});