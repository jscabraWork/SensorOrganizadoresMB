import { TestBed } from '@angular/core/testing';

import { DiaDataService } from './dia-data.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Dia } from '../../models/dia.model';

describe('DiaDataService', () => {
  let service: DiaDataService;
  let httpMock: HttpTestingController;
  const mockApiUrl = 'http://localhost:8090/api/eventos/dias';

  const mockDia: Dia = {
    id: 1,
    nombre: 'Día de prueba',
    estado: 1,
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 86400000),
    horaInicio: '09:00',
    horaFin: '18:00',
    localidades: [],
    evento: null
  };

  const mockDiaActualizado: Dia = {
    id: 1,
    nombre: 'Día actualizado',
    estado: 0,
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 86400000),
    horaInicio: '10:00',
    horaFin: '19:00',
    localidades: [],
    evento: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DiaDataService]
    });

    service = TestBed.inject(DiaDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarPorEstado', () => {
    it('debería hacer una petición GET al endpoint correcto con los parámetros eventoId y estado', () => {
      const eventoId = 1;
      const estado = 1;
      const mockResponse: Dia[] = [mockDia];

      service.listarPorEstado(eventoId, estado).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/listar/estado?eventoId=${eventoId}&pEstado=${estado}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
});

  describe('editarEstadoDeDia', () => {
    it('debería hacer una petición PUT al endpoint correcto con el parámetro estado', () => {
      service.editarEstadoDeDia(mockDia).subscribe(response => {
        expect(response).toEqual(mockDia);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/estado/${mockDia.id}?estado=${mockDia.estado}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush(mockDia);
    });
  });

  describe('editarDia', () => {
    it('debería hacer una petición PUT al endpoint correcto con los datos del día', () => {
      service.editarDia(mockDiaActualizado).subscribe(response => {
        expect(response).toEqual(mockDiaActualizado);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/actualizar/${mockDiaActualizado.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockDiaActualizado);
      req.flush(mockDiaActualizado);
    });
  });

  describe('borrarDia', () => {
    it('debería hacer una petición DELETE al endpoint correcto', () => {
      const diaId = 1;

      service.borrarDia(diaId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${mockApiUrl}/borrar/${diaId}`);
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
