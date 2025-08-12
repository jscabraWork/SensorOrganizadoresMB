import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecursosDataService } from './recursos-data.service';
import { Recurso } from '../../models/pagina.model';
import { API_URL_HTML } from '../../app.constants';

/**
 * Tests unitarios optimizados para RecursosDataService
 * 
 * ENFOQUE:
 * - Tests en español para mejor comprensión
 * - Solo métodos específicos del servicio (no heredados)
 * - Objetos mock simplificados
 * - Casos esenciales sin redundancia
 */
describe('RecursosDataService', () => {
  let service: RecursosDataService;
  let httpMock: HttpTestingController;
  const baseUrl = API_URL_HTML + '/recursos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecursosDataService]
    });
    service = TestBed.inject(RecursosDataService);
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
      expect(service['atributoListado']).toBe('pagina');
    });
  });

  describe('subir', () => {
    it('debería subir archivo correctamente', () => {
      const mockFile = new File(['contenido test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('nombre', 'Imagen Test');
      formData.append('paginaId', '1');

      const respuestaEsperada = {
        recurso: {
          id: 1,
          nombre: 'test.jpg',
          url: 'https://example.com/test.jpg',
          tipo: 0,
          formato: 'jpg'
        }
      };

      service.subir(formData).subscribe(response => {
        expect(response).toEqual(respuestaEsperada);
        expect(response.recurso.nombre).toBe('test.jpg');
        expect(response.recurso.tipo).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(respuestaEsperada);
    });

    it('debería manejar errores de subida', () => {
      const formData = new FormData();
      const mensajeError = 'El archivo está vacío';

      service.subir(formData).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/crear`);
      expect(req.request.method).toBe('POST');
      req.flush({ mensaje: mensajeError }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('crearUrl', () => {
    it('debería crear recurso con URL de YouTube correctamente', () => {
      const recurso: Recurso = {
        id: 0,
        nombre: 'Video YouTube',
        url: 'https://www.youtube.com/watch?v=test',
        tipo: 1
      } as Recurso;
      const paginaId = 1;

      const respuestaEsperada = {
        recurso: {
          id: 2,
          nombre: 'Video YouTube',
          url: 'https://www.youtube.com/watch?v=test',
          tipo: 1
        }
      };

      service.crearUrl(recurso, paginaId).subscribe(response => {
        expect(response).toEqual(respuestaEsperada);
        expect(response.recurso.url).toBe('https://www.youtube.com/watch?v=test');
        expect(response.recurso.tipo).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/crear-url/${paginaId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(recurso);
      req.flush(respuestaEsperada);
    });

    it('debería crear recurso con URL multimedia directa', () => {
      const recurso: Recurso = {
        id: 0,
        nombre: 'Imagen Externa',
        url: 'https://example.com/imagen.jpg',
        tipo: 0
      } as Recurso;
      const paginaId = 1;

      const respuestaEsperada = {
        recurso: {
          id: 3,
          nombre: 'Imagen Externa',
          url: 'https://example.com/imagen.jpg',
          tipo: 0
        }
      };

      service.crearUrl(recurso, paginaId).subscribe(response => {
        expect(response).toEqual(respuestaEsperada);
        expect(response.recurso.url).toContain('.jpg');
      });

      const req = httpMock.expectOne(`${baseUrl}/crear-url/${paginaId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(recurso);
      req.flush(respuestaEsperada);
    });

    it('debería manejar errores de URL inválida', () => {
      const recurso: Recurso = {
        id: 0,
        nombre: 'URL Inválida',
        url: 'https://example.com/document.pdf',
        tipo: 0
      } as Recurso;
      const paginaId = 1;
      const mensajeError = 'La URL debe ser de YouTube o terminar con extensión multimedia';

      service.crearUrl(recurso, paginaId).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/crear-url/${paginaId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(recurso);
      req.flush({ mensaje: mensajeError }, { status: 400, statusText: 'Bad Request' });
    });

    it('debería enviar paginaId correctamente en la URL', () => {
      const recurso: Recurso = { nombre: 'Test' } as Recurso;
      const paginaId = 5;

      service.crearUrl(recurso, paginaId).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/crear-url/5`);
      expect(req.request.url).toContain('/crear-url/5');
      req.flush({});
    });
  });
});