import { TestBed } from '@angular/core/testing';

import { TemporadaDataService } from './temporada-data.service';
import { Temporada } from '../../models/temporada.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_URL_EVENTO } from '../../app.constants';

describe('TemporadaDataService', () => {
  let service: TemporadaDataService;
  let httpMock: HttpTestingController;
  const mockApiUrl = 'http://localhost:8090/api/eventos';
  
  const mockTemporada: Temporada = {
    id: 1,
    nombre: 'Temporada 2023',
    estado: 1,
    fechaInicio: new Date(),
    fechaFin: new Date(),
    eventos: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TemporadaDataService,
        { provide: API_URL_EVENTO, useValue: mockApiUrl }
      ]
    });
    
    service = TestBed.inject(TemporadaDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería tener baseEndpoint configurado correctamente', () => {
    expect(service['baseEndpoint']).toBe(`${mockApiUrl}/temporadas`);
  });

  describe('listarPorEstado', () => {
    it('debería hacer una petición GET al endpoint correcto', () => {
      const estado = 1;
      const mockRespuesta: Temporada[] = [mockTemporada];

      service.listarPorEstado(estado).subscribe(respuesta => {
        expect(respuesta).toEqual(mockRespuesta);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/temporadas/listar/estado?pEstado=${estado}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRespuesta);
    });
  });

  describe('editarTemporada', () => {
    it('debería hacer una petición PUT al endpoint correcto con los datos de la temporada', () => {
      const temporadaActualizada = { ...mockTemporada, nombre: 'Temporada Actualizada' };

      service.editarTemporada(temporadaActualizada).subscribe(respuesta => {
        expect(respuesta).toEqual(temporadaActualizada);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/temporadas/actualizar/${temporadaActualizada.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(temporadaActualizada);
      req.flush(temporadaActualizada);
    });
  });

  describe('editarEstadoDeTemporada', () => {
    it('debería hacer una petición PUT al endpoint correcto con el parámetro estado', () => {
      const estado = 2;
      const temporadaConNuevoEstado = { ...mockTemporada, estado };

      service.editarEstadoDeTemporada(temporadaConNuevoEstado).subscribe(respuesta => {
        expect(respuesta).toEqual(temporadaConNuevoEstado);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/temporadas/estado/${temporadaConNuevoEstado.id}?estado=${temporadaConNuevoEstado.estado}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush(temporadaConNuevoEstado);
    });
  });

  describe('borrarTemporada', () => {
    it('debería hacer una petición DELETE al endpoint correcto', () => {
      const id = 1;
      const mockRespuesta = {};

      service.borrarTemporada(id).subscribe(respuesta => {
        expect(respuesta).toEqual(mockRespuesta);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/temporadas/borrar/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockRespuesta);
    });
  });

  // Pruebas para métodos heredados de CommonDataService (si necesitas probarlos)
  describe('getPorId', () => {
    it('debería hacer una petición GET al endpoint correcto', () => {
      const id = 1;
      
      service.getPorId(id).subscribe(respuesta => {
        expect(respuesta).toEqual(mockTemporada);
      });
      
      const req = httpMock.expectOne(`${mockApiUrl}/temporadas/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTemporada);
    });
  });
});
