import { TestBed } from '@angular/core/testing';

import { EventoDataService } from './evento-data.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Evento } from '../../models/evento.model';

describe('EventoDataService', () => {
  let service: EventoDataService;
  let httpMock: HttpTestingController;
  const mockApiUrl = 'http://localhost:8090/api/eventos';

  const mockEvento: Evento = {
    id: 1,
    pulep: 'PU123',
    artistas: 'Artista 1',
    nombre: 'Evento de prueba',
    recomendaciones: 'Recomendación de prueba',
    video: 'http://video.com',
    fechaApertura: new Date(),
    estado: 1,
    venue: { id: 1, nombre: 'Lugar', urlMapa: '', ciudad: null, eventos: [] },
    organizadores: [],
    dias: [],
    tipo: { id: 1, nombre: 'Tipo 1' }, // Asegúrate de crear un mock para el tipo también
    temporada: { id: 1, nombre: 'Temporada 2023', estado: 1, fechaInicio: new Date(), fechaFin: new Date(), eventos: [] }
  };

  const mockNuevoEvento: Evento = {
    id: 2,
    pulep: 'PU456',
    artistas: 'Artista 2',
    nombre: 'Nuevo Evento',
    recomendaciones: 'Nuevas recomendaciones',
    video: 'http://new-video.com',
    fechaApertura: new Date(),
    estado: 1,
    venue: { id: 2, nombre: 'Lugar', urlMapa: '', ciudad: null, eventos: [] },
    organizadores: [],
    dias: [],
    tipo: { id: 2, nombre: 'Tipo 2' },
    temporada: { id: 1, nombre: 'Temporada 2023', estado: 1, fechaInicio: new Date(), fechaFin: new Date(), eventos: [] }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventoDataService]
    });

    service = TestBed.inject(EventoDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crear', () => {
    it('debería hacer una petición POST al endpoint correcto con los datos del nuevo evento', () => {
      service.crear(mockNuevoEvento).subscribe(respuesta => {
        expect(respuesta).toEqual(mockEvento); // Asumiendo que el backend devuelve el evento con ID
      });

      const req = httpMock.expectOne(`${mockApiUrl}/eventos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(mockNuevoEvento);

      // Simulamos que el backend responde con el evento creado (incluyendo ID)
      req.flush(mockEvento);
    });

  });


  describe('listarPorEstado', () => {
    it('debería hacer una petición GET al endpoint correcto', () => {
      const estado = 1;
      const mockRespuesta: Evento[] = [mockEvento];

      service.listarPorEstado(mockEvento.temporada.id, estado).subscribe(respuesta => {
        expect(respuesta).toEqual(mockRespuesta);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/eventos/listar/estado?temporadaId=${mockEvento.temporada.id}&pEstado=${estado}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRespuesta);
    });
  });

  describe('editarEstadoDeEvento', () => {
    it('debería hacer una petición PUT al endpoint correcto con el parámetro estado', () => {
      const eventoConNuevoEstado = { ...mockEvento, estado: 2 };

      service.editarEstadoDeEvento(eventoConNuevoEstado).subscribe(respuesta => {
        expect(respuesta).toEqual(eventoConNuevoEstado);
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}/eventos/estado/${eventoConNuevoEstado.id}?estado=${eventoConNuevoEstado.estado}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBeNull();
      req.flush(eventoConNuevoEstado);
    });
  });

  describe('editarEvento', () => {
    it('debería hacer una petición PUT al endpoint correcto con los datos del evento', () => {
      const eventoActualizado = { ...mockEvento, nombre: 'Evento Actualizado' };

      service.editarEvento(eventoActualizado).subscribe(respuesta => {
        expect(respuesta).toEqual(eventoActualizado);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/eventos/actualizar/${eventoActualizado.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(eventoActualizado);
      req.flush(eventoActualizado);
    });
  });
});
