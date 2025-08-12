import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdenDataService } from './orden-data.service';
import { Orden } from '../../models/orden.model';
import { API_URL_PAGOS } from '../../app.constants';

describe('OrdenDataService', () => {
  let service: OrdenDataService;
  let httpMock: HttpTestingController;
  const mockApiUrl = 'http://localhost:8090/api/pagos';
  const mockOrden: Orden = {
    id: 1,
    estado:1,
    tipo: 1,
    evento: null,
    valorOrden: 1000,
    transacciones:[],
    tickets:[],
    cliente:[],
    creationDate:''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OrdenDataService,
        { provide: API_URL_PAGOS, useValue: mockApiUrl }
      ]
    });

    service = TestBed.inject(OrdenDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cambiarEstadoOrden', () => {
    it('debería cambiar el estado de una orden', () => {
      const ordenActualizada = { ...mockOrden, estado: 3 };

      service.cambiarEstadoOrden(ordenActualizada).subscribe(orden => {
        expect(orden).toEqual(ordenActualizada);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/ordenes/estado/${ordenActualizada.id}?estado=${ordenActualizada.estado}`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(ordenActualizada);
    });

    it('muestra si hay un error al cambiar estado', () => {
      const ordenActualizada = { ...mockOrden, estado: 3 };
      const mockError = { status: 400, statusText: 'Bad Request' };

      service.cambiarEstadoOrden(ordenActualizada).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/ordenes/estado/${ordenActualizada.id}?estado=${ordenActualizada.estado}`
      );
      req.flush(null, mockError);
    });
  });

  describe('agregarTicketAorden', () => {
    it('debería agregar un ticket a una orden', () => {
      const ordenId = 1;
      const ticketId = 5;
      const mockResponse = { success: true };

      service.agregarTicketAorden(ordenId, ticketId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/ordenes/agregar/orden/${ordenId}/ticket/${ticketId}`
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('eliminarTicketDeOrden', () => {
    it('debería eliminar un ticket de una orden', () => {
      const ordenId = 1;
      const ticketId = 5;
      const mockResponse = { success: true };

      service.eliminarTicketDeOrden(ordenId, ticketId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/ordenes/eliminar/orden/${ordenId}/ticket/${ticketId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('debería mostrar si hay un error al eliminar ticket', () => {
      const ordenId = 1;
      const ticketId = 5;
      const mockError = { status: 404, statusText: 'Not Found' };

      service.eliminarTicketDeOrden(ordenId, ticketId).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/ordenes/eliminar/orden/${ordenId}/ticket/${ticketId}`
      );
      req.flush(null, mockError);
    });
  });

  describe('validarContraPtpTrx', () => {
  it('debería hacer una petición GET para validar contra PTP', () => {
    const ordenId = 1;
    const mockResponse = { valid: true };

    service.validarContraPtpTrx(ordenId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${mockApiUrl}/ordenes/manejo-orden/${ordenId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería mostrar el error si hay un problema con el servicio', () => {
    const ordenId = 1;
    const mockError = { status: 500, statusText: 'Server Error' };

    service.validarContraPtpTrx(ordenId).subscribe({
      next: () => fail('debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(
      `${mockApiUrl}/ordenes/manejo-orden/${ordenId}`
    );
    req.flush(null, mockError);
  });
  });

  describe('ordenesPorClienteId', () => {
  it('debería obtener las órdenes por cliente ID', () => {
    const clienteId = "1";
    const mockResponse = [
      { id: 1, estado: 1, cliente: [{ id: "1" }] },
      { id: 2, estado: 2, cliente: [{ id: "1 "}] }
    ];

    service.ordenesPorClienteId(clienteId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${mockApiUrl}/ordenes/ordenes/cliente/${clienteId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería manejar el error cuando no se encuentran órdenes para el cliente', () => {
    const clienteId = "999";
    const mockError = { status: 404, statusText: 'Not Found' };

    service.ordenesPorClienteId(clienteId).subscribe({
      next: () => fail('debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(404);
      }
    });
    const req = httpMock.expectOne(
      `${mockApiUrl}/ordenes/ordenes/cliente/${clienteId}`
    );
    req.flush(null, mockError);
  });

  // En tu archivo orden-data.service.spec.ts
describe('ordenesPorClienteId', () => {
  it('debería devolver un objeto con array vacío si el servidor responde con 204 No Content', () => {
    const clienteId = "2";

    service.ordenesPorClienteId(clienteId).subscribe(response => {
      expect(response).toEqual({ ordenes: [] });
    });
    const req = httpMock.expectOne(
      `${mockApiUrl}/ordenes/ordenes/cliente/${clienteId}`
    );
    req.flush({ ordenes: [] }, { status: 204, statusText: 'No Content' });
  });
});
});

});
