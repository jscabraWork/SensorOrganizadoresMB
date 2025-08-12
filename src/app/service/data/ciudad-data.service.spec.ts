import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { CiudadDataService } from './ciudad-data.service';
import { Ciudad } from '../../models/ciudad.model';
import { API_URL_EVENTO } from '../../app.constants';

describe('CiudadDataService', () => {
  let service: CiudadDataService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  // Mock data
  const mockCiudad: Ciudad = {
    id: 1,
    nombre: 'Ciudad de Prueba',
    venues:[]
  };
  const mockCiudades: Ciudad[] = [
    mockCiudad,
    { id: 2, nombre: 'Otra Ciudad',venues:[] }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CiudadDataService]
    });

    service = TestBed.inject(CiudadDataService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no hayan requests pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarCiudades', () => {
    it('debería retornar un array de ciudades', () => {
      service.listarCiudades().subscribe(ciudades => {
        expect(ciudades).toEqual(mockCiudades);
        expect(ciudades.length).toBe(2);
      });

      const req = httpMock.expectOne(`${API_URL_EVENTO}/ciudades/listarCiudades`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCiudades);
    });

    it('debería manejar errores correctamente', () => {
      const errorMessage = 'Error en la solicitud';

      service.listarCiudades().subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        }
      });

      const req = httpMock.expectOne(`${API_URL_EVENTO}/ciudades/listarCiudades`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('editarCiudad', () => {
    it('debería actualizar una ciudad correctamente', () => {
      const ciudadActualizada = { ...mockCiudad, nombre: 'Ciudad Actualizada' };

      service.editarCiudad(ciudadActualizada).subscribe(ciudad => {
        expect(ciudad).toEqual(ciudadActualizada);
      });

      const req = httpMock.expectOne(`${API_URL_EVENTO}/ciudades/actualizar/${ciudadActualizada.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ciudadActualizada);
      req.flush(ciudadActualizada);
    });

    it('debería manejar errores al editar', () => {
      const ciudadActualizada = { ...mockCiudad, nombre: 'Ciudad Actualizada' };
      const errorMessage = 'Error al actualizar';

      service.editarCiudad(ciudadActualizada).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${API_URL_EVENTO}/ciudades/actualizar/${ciudadActualizada.id}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('crearCiudad', () => {
    it('debería crear una nueva ciudad correctamente', () => {
      const nuevaCiudad: Ciudad = {
        id:1,
        nombre: 'Nueva Ciudad',
        venues:[]
        // otras propiedades requeridas
      };

      service.crearCiudad(nuevaCiudad).subscribe(ciudad => {
        expect(ciudad).toEqual({ ...nuevaCiudad, id: 3 });
      });

      const req = httpMock.expectOne(`${API_URL_EVENTO}/ciudades/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevaCiudad);
      req.flush({ ...nuevaCiudad, id: 3 });
    });

    it('debería manejar errores al crear', () => {
      const nuevaCiudad: Ciudad = { id:1,
        nombre: 'Nueva Ciudad',
        venues:[] };
      const errorMessage = 'Error al crear';

      service.crearCiudad(nuevaCiudad).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${API_URL_EVENTO}/ciudades/crear`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });
});
