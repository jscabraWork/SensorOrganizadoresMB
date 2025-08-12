import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TarifaDataService } from './tarifa-data.service';
import { Tarifa } from '../../models/tarifa.model';

describe('TarifaDataService', () => {
  let service: TarifaDataService;
  let httpMock: HttpTestingController;
  const mockApiUrl = 'http://localhost:8090/api/eventos/tarifas';

  const mockTarifa: Tarifa = {
    id: 1,
    nombre: 'Tarifa General',
    precio: 100.0,
    servicio: 10.0,
    iva: 21.0,
    estado: 1,
    localidad: null
  };

  const mockTarifaActualizada: Tarifa = {
    id: 1,
    nombre: 'Tarifa General Actualizada',
    precio: 120.0,
    servicio: 12.0,
    iva: 21.0,
    estado: 0,
    localidad: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TarifaDataService]
    });

    service = TestBed.inject(TarifaDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarPorEstado', () => {
    it('debería hacer una petición GET al endpoint correcto con los parámetros localidadId y estado', () => {
      const localidadId = 1;
      const estado = 1;
      const mockResponse: Tarifa[] = [mockTarifa];

      service.listarPorEstado(localidadId, estado).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/listar/estado?localidadId=${localidadId}&pEstado=${estado}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('listarPorEvento', () => {
    it('debería hacer una petición GET al endpoint correcto con el parámetro eventoId', () => {
      const eventoId = 1;
      const mockResponse: Tarifa[] = [mockTarifa];

      service.listarPorEvento(eventoId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/listar/${eventoId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('editarEstadoDeDia', () => {
    it('debería hacer una petición PUT al endpoint correcto con el parámetro estado', () => {
      service.editarEstadoDeTarifa(mockTarifa).subscribe(response => {
        expect(response).toEqual(mockTarifa);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/estado/${mockTarifa.id}?estado=${mockTarifa.estado}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush(mockTarifa);
    });
  });

  describe('editarTarifa', () => {
    it('debería hacer una petición PUT al endpoint correcto con los datos de la tarifa', () => {
      service.editarTarifa(mockTarifaActualizada).subscribe(response => {
        expect(response).toEqual(mockTarifaActualizada);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/actualizar/${mockTarifaActualizada.id}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockTarifaActualizada);
      req.flush(mockTarifaActualizada);
    });
  });

  describe('borrarTarifa', () => {
    it('debería hacer una petición DELETE al endpoint correcto', () => {
      const tarifaId = 1;

      service.borrarTarifa(tarifaId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/borrar/${tarifaId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // Pruebas para los métodos heredados de CommonDataService
  describe('Métodos heredados de CommonDataService', () => {
    it('debería implementar crear', () => {
      expect(service.crear).toBeDefined();
    });

    it('debería implementar listar', () => {
      expect(service.listar).toBeDefined();
    });


  });
});
