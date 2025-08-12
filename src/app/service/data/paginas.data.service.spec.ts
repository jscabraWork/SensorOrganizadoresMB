import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Pagina } from '../../models/pagina.model';
import { API_URL_HTML } from '../../app.constants';
import { PaginasDataService } from './paginas.data.service';


describe('PaginasDataService', () => {
  let service: PaginasDataService;
  let httpMock: HttpTestingController;
  const baseUrl = API_URL_HTML + '/paginas';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaginasDataService]
    });
    service = TestBed.inject(PaginasDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('Configuración del servicio', () => {
    it('debería tener baseEndpoint correcto', () => {
      expect(service['baseEndpoint']).toBe(baseUrl);
    });

    it('debería tener atributoListado correcto', () => {
      expect(service['atributoListado']).toBe('estado');
    });
  });

  describe('actualizarEstado', () => {
    it('debería actualizar estado de página correctamente', () => {
      const pagina: Pagina = {
        id: 1,
        nombre: 'Página Test',
        estado: 1
      } as Pagina;

      const respuestaEsperada = {
        id: 1,
        nombre: 'Página Test',
        estado: 1
      };

      service.actualizarEstado(pagina).subscribe(response => {
        expect(response).toEqual(respuestaEsperada);
        expect(response.estado).toBe(1);
      });

      // Corregir expectOne para incluir parámetros
      const req = httpMock.expectOne(request => 
        request.url === `${baseUrl}/actualizar-estado` &&
        request.method === 'PUT' &&
        request.params.get('pId') === '1' &&
        request.params.get('pEstado') === '1'
      );
      expect(req.request.body).toBeNull();
      req.flush(respuestaEsperada);
    });

    it('debería manejar diferentes valores de estado', () => {
      const paginaInactiva: Pagina = {
        id: 1,
        estado: 0
      } as Pagina;

      const respuestaEsperada = {
        id: 1,
        estado: 0
      };

      service.actualizarEstado(paginaInactiva).subscribe(response => {
        expect(response.estado).toBe(0);
      });

      // Corregir expectOne para incluir parámetros
      const req = httpMock.expectOne(request => 
        request.url === `${baseUrl}/actualizar-estado` &&
        request.method === 'PUT' &&
        request.params.get('pEstado') === '0'
      );
      req.flush(respuestaEsperada);
    });

    it('debería manejar errores del servidor', () => {
      const pagina: Pagina = {
        id: 999,
        estado: 1
      } as Pagina;

      const mensajeError = 'No se encontró la página con ID: 999';

      service.actualizarEstado(pagina).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      // Corregir expectOne para incluir parámetros
      const req = httpMock.expectOne(request => 
        request.url === `${baseUrl}/actualizar-estado` &&
        request.method === 'PUT' &&
        request.params.get('pId') === '999' &&
        request.params.get('pEstado') === '1'
      );
      req.flush({ mensaje: mensajeError }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('actualizar', () => {
    it('debería actualizar página completa correctamente', () => {
      const pagina: Pagina = {
        id: 1,
        nombre: 'Página Actualizada',
        estado: 1
      } as Pagina;

      const respuestaEsperada = {
        id: 1,
        nombre: 'Página Actualizada',
        estado: 1
      };

      service.actualizar(pagina).subscribe(response => {
        expect(response).toEqual(respuestaEsperada);
        expect(response.nombre).toBe('Página Actualizada');
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(pagina);
      req.flush(respuestaEsperada);
    });

    it('debería manejar errores de validación', () => {
      const paginaInvalida: Pagina = {
        id: 1,
        nombre: '' // Nombre vacío
      } as Pagina;

      service.actualizar(paginaInvalida).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(paginaInvalida);
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });

    it('debería enviar datos en el cuerpo de la petición', () => {
      const pagina: Pagina = {
        id: 1,
        nombre: 'Página Test',
        estado: 1
      } as Pagina;

      service.actualizar(pagina).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.body).toEqual(pagina);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
  });
});