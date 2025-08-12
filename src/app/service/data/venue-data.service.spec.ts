import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { VenueDataService } from './venue-data.service';
import { Venue } from '../../models/venue.model';
import { API_URL_EVENTO } from '../../app.constants';
import { Ciudad } from '../../models/ciudad.model';

describe('VenueDataService', () => {
  let service: VenueDataService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  // Mock data SIMPLIFICADO
  const mockVenue: Venue = {
    id: 1,
    nombre: 'Venue de Prueba',
    urlMapa: 'https://maps.example.com/venue1',
    eventos:[],
    ciudad:null
  };

  const mockVenues: Venue[] = [
    mockVenue,
    {
      id: 2,
      nombre: 'Otro Venue',
      urlMapa: 'https://maps.example.com/venue2',
      eventos:[],
      ciudad:null
    }
  ];

  const ciudadId = 1;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VenueDataService]
    });

    service = TestBed.inject(VenueDataService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no hayan requests pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarVenuesByCiudadId', () => {
    it('debería hacer GET al endpoint correcto', () => {
      service.listarVenuesByCiudadId(ciudadId).subscribe();

      const req = httpMock.expectOne(`${API_URL_EVENTO}/venues/listarVenues/${ciudadId}`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('debería retornar array de venues', () => {
      service.listarVenuesByCiudadId(ciudadId).subscribe(venues => {
        expect(venues.length).toBe(2);
        expect(venues[0].nombre).toBe('Venue de Prueba');
      });

      const req = httpMock.expectOne(`${API_URL_EVENTO}/venues/listarVenues/${ciudadId}`);
      req.flush(mockVenues);
    });
  });

  describe('editarVenue', () => {
    it('debería hacer PUT al endpoint correcto', () => {
      const venueActualizado = { ...mockVenue, nombre: 'Nombre Actualizado' };

      service.editarVenue(venueActualizado, ciudadId).subscribe();

      const req = httpMock.expectOne(`${API_URL_EVENTO}/venues/actualizar/${ciudadId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(venueActualizado);
      req.flush({});
    });
  });

  describe('crearVenue', () => {
    it('debería hacer POST al endpoint correcto', () => {
      const nuevoVenue: Venue = {
        id:1,
        nombre: 'Nuevo Venue',
        urlMapa: 'https://maps.example.com/nuevo',
        eventos:[],
        ciudad:null
      };

      service.crearVenue(nuevoVenue, ciudadId).subscribe();

      const req = httpMock.expectOne(`${API_URL_EVENTO}/venues/crear/${ciudadId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoVenue);
      req.flush({});
    });
  });
});
