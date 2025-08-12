import { TestBed } from '@angular/core/testing';

import { LocalidadDataService } from './localidad-data.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Localidad } from '../../models/localidad.model';

describe('LocalidadDataService', () => {
  let service: LocalidadDataService;
  let httpMock: HttpTestingController;
  const mockApiUrl = 'http://localhost:8090/api/eventos/localidades';

  const mockLocalidad: Localidad = {
    id: 1,
    nombre: 'Localidad de prueba',
    estado: 1,
    tarifas: [],
    dias: [],
    aporte_minimo: 0,
    tipo: 0
  };

  const mockLocalidadActualizada: Localidad = {
    id: 1,
    nombre: 'Localidad actualizada',
    estado: 0,
    tarifas: [],
    dias: [],
    aporte_minimo: 0,
    tipo: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LocalidadDataService]
    });

    service = TestBed.inject(LocalidadDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crearLocalidad', () => {
    it('debería hacer una petición POST al endpoint correcto', () => {
      const forzarCreacion = false;
      
      service.crearLocalidad(mockLocalidad, forzarCreacion).subscribe(response => {
        expect(response).toEqual(mockLocalidad);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/crear?forzarCreacion=${forzarCreacion}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLocalidad);
      req.flush(mockLocalidad);
    });

    it('debería incluir el parámetro forzarCreacion cuando es true', () => {
      const forzarCreacion = true;
      
      service.crearLocalidad(mockLocalidad, forzarCreacion).subscribe();

      const req = httpMock.expectOne(
        `${mockApiUrl}/crear?forzarCreacion=${forzarCreacion}`
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockLocalidad);
    });
  });

  describe('listarPorEstado', () => {
    it('debería hacer una petición GET al endpoint correcto con los parámetros diaId y estado', () => {
      const diaId = 1;
      const estado = 1;
      const mockResponse: Localidad[] = [mockLocalidad];

      service.listarPorEstado(diaId, estado).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/listar/estado?diaId=${diaId}&pEstado=${estado}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('editarEstadoDeLocalidad', () => {
    it('debería hacer una petición PUT al endpoint correcto con el parámetro estado', () => {
      service.editarEstadoDeLocalidad(mockLocalidad).subscribe(response => {
        expect(response).toEqual(mockLocalidad);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/estado/${mockLocalidad.id}?estado=${mockLocalidad.estado}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush(mockLocalidad);
    });
  });

  describe('editarLocalidad', () => {
    it('debería hacer una petición PUT al endpoint correcto con los datos de la localidad', () => {
      const forzarActualizacion = false;
      
      service.editarLocalidad(mockLocalidadActualizada, forzarActualizacion).subscribe(response => {
        expect(response).toEqual(mockLocalidadActualizada);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/actualizar/${mockLocalidadActualizada.id}?forzarActualizacion=${forzarActualizacion}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockLocalidadActualizada);
      req.flush(mockLocalidadActualizada);
    });

    it('debería incluir el parámetro forzarActualizacion cuando es true', () => {
      const forzarActualizacion = true;
      
      service.editarLocalidad(mockLocalidadActualizada, forzarActualizacion).subscribe();

      const req = httpMock.expectOne(
        `${mockApiUrl}/actualizar/${mockLocalidadActualizada.id}?forzarActualizacion=${forzarActualizacion}`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(mockLocalidadActualizada);
    });
  });

  describe('borrarLocalidad', () => {
    it('debería hacer una petición DELETE al endpoint correcto', () => {
      const localidadId = 1;

      service.borrarLocalidad(localidadId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${mockApiUrl}/borrar/${localidadId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // Pruebas para los métodos heredados de CommonDataService
  describe('Métodos heredados de CommonDataService', () => {
    it('debería implementar crear', () => {
      expect(service.crear).toBeDefined();
    });

  });
});
