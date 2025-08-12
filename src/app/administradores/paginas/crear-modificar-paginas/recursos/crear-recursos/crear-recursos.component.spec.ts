import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CrearRecursosComponent } from './crear-recursos.component';
import { RecursosDataService } from '../../../../../service/data/recursos-data.service';
import { Recurso } from '../../../../../models/pagina.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

/**
 * Tests optimizados para CrearRecursosComponent con herencia de CommonAgregarComponent
 * 
 * ENFOQUE:
 * - Tests específicos del componente
 * - Validaciones de URL multimedia
 * - Manejo de archivos con límite de 20MB
 * - Uso del sistema de mensajes heredado
 */
describe('CrearRecursosComponent', () => {
  let component: CrearRecursosComponent;
  let fixture: ComponentFixture<CrearRecursosComponent>;
  let mockService: jasmine.SpyObj<RecursosDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockRecurso: Recurso = {
    id: 1,
    nombre: 'Test Resource',
    url: 'http://test.com/image.jpg',
    tipo: 0,
    formato: 'jpg'
  } as Recurso;

  const createMockFile = (name: string, type: string, size: number = 1024): File => {
    const file = new File(['test'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('RecursosDataService', ['subir', 'crearUrl']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    // Mock del diálogo para que devuelva un observable
    mockDialog.open.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    await TestBed.configureTestingModule({
      imports: [CrearRecursosComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: RecursosDataService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    mockService.subir.and.returnValue(of({ recurso: mockRecurso }));
    mockService.crearUrl.and.returnValue(of({ recurso: mockRecurso }));

    fixture = TestBed.createComponent(CrearRecursosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Tests de inicialización
  describe('Initialization', () => {
    it('should set tipo when tipoRecurso is specified', () => {
      component.tipoRecurso = 1;
      
      component.ngOnInit();
      
      expect(component.nuevoRecurso.tipo).toBe(1);
    });

    it('should not override tipo when tipoRecurso is -1', () => {
      component.tipoRecurso = -1;
      const tipoOriginal = component.nuevoRecurso.tipo;
      
      component.ngOnInit();
      
      expect(component.nuevoRecurso.tipo).toBe(tipoOriginal);
    });
  });

  // Tests de validación de URL multimedia (nueva funcionalidad)
  describe('validarUrlMultimedia', () => {
    it('should accept YouTube URLs', () => {
      const youtubeUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://youtube.com/embed/dQw4w9WgXcQ'
      ];
      
      youtubeUrls.forEach(url => {
        expect((component as any).validarUrlMultimedia(url)).toBe(true);
      });
    });

    it('should accept Vimeo URLs', () => {
      const vimeoUrls = [
        'https://vimeo.com/123456789',
        'https://www.vimeo.com/123456789'
      ];
      
      vimeoUrls.forEach(url => {
        expect((component as any).validarUrlMultimedia(url)).toBe(true);
      });
    });

    it('should accept direct multimedia file URLs', () => {
      const validUrls = [
        'https://example.com/image.jpg',
        'https://example.com/video.mp4',
        'https://example.com/audio.webm',
        'https://example.com/photo.png'
      ];
      
      validUrls.forEach(url => {
        expect((component as any).validarUrlMultimedia(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://example.com/document.pdf',
        'https://example.com/text.txt',
        'https://example.com/page.html'
      ];
      
      invalidUrls.forEach(url => {
        expect((component as any).validarUrlMultimedia(url)).toBe(false);
      });
    });
  });

  // Tests de manejo de archivos con límite actualizado
  describe('File Processing with 20MB limit', () => {
    it('should accept files under 20MB', () => {
      const validFile = createMockFile('test.jpg', 'image/jpeg', 15 * 1024 * 1024); // 15MB
      const mockFiles = { length: 1, 0: validFile } as any;
      
      component.tipoRecurso = -1;
      (component as any).procesarArchivos(mockFiles);
      
      expect(component.archivos).toHaveSize(1);
    });

    it('should reject files over 20MB with message', () => {
      spyOn(component, 'mensaje');
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 25 * 1024 * 1024); // 25MB
      const mockFiles = { length: 1, 0: largeFile } as any;
      
      (component as any).procesarArchivos(mockFiles);
      
      expect(component.archivos).toHaveSize(0);
      expect(component.mensaje).toHaveBeenCalledWith('large.jpg excede el límite de 20MB');
    });

    it('should validate file types with messages', () => {
      spyOn(component, 'mensaje');
      
      // Solo imágenes - rechazar video
      component.tipoRecurso = 0;
      expect((component as any).esArchivoValido(createMockFile('test.mp4', 'video/mp4'))).toBe(false);
      expect(component.mensaje).toHaveBeenCalledWith('Solo se permiten imágenes');
    });
  });

  // Tests de creación por URL con validaciones mejoradas
  describe('crearPorUrl with enhanced validation', () => {
    beforeEach(() => {
      component.paginaId = 123;
      component.nuevoRecurso.nombre = 'Test Resource';
    });

    it('should create resource with valid YouTube URL', () => {
      spyOn(component.recursoCreado, 'emit');
      spyOn(component, 'mensaje');
      component.nuevoRecurso.url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      
      component.crearPorUrl();
      
      expect(mockService.crearUrl).toHaveBeenCalled();
      expect(component.recursoCreado.emit).toHaveBeenCalledWith(mockRecurso);
      expect(component.mensaje).toHaveBeenCalledWith('Recurso creado correctamente');
    });

    it('should create resource with valid direct file URL', () => {
      spyOn(component.recursoCreado, 'emit');
      component.nuevoRecurso.url = 'https://example.com/image.jpg';
      
      component.crearPorUrl();
      
      expect(mockService.crearUrl).toHaveBeenCalled();
      expect(component.recursoCreado.emit).toHaveBeenCalledWith(mockRecurso);
    });

    it('should reject invalid multimedia URL', () => {
      spyOn(component, 'mensaje');
      component.nuevoRecurso.url = 'https://example.com/document.pdf';
      
      component.crearPorUrl();
      
      expect(mockService.crearUrl).not.toHaveBeenCalled();
      expect(component.mensaje).toHaveBeenCalledWith(
        'La URL debe ser de YouTube, Vimeo o contener una extensión de archivo multimedia válida (.jpg, .mp4, etc.)'
      );
    });

    it('should validate required fields', () => {
      spyOn(component, 'mensaje');
      
      // Sin URL
      component.nuevoRecurso.url = '';
      component.crearPorUrl();
      expect(component.mensaje).toHaveBeenCalledWith('URL y nombre son obligatorios');
      
      // Sin nombre
      component.nuevoRecurso.url = 'https://youtube.com/watch?v=123';
      component.nuevoRecurso.nombre = '';
      component.crearPorUrl();
      expect(component.mensaje).toHaveBeenCalledWith('URL y nombre son obligatorios');
    });

    it('should handle malformed URLs', () => {
      spyOn(component, 'mensaje');
      component.nuevoRecurso.url = 'not-a-valid-url';
      
      component.crearPorUrl();
      
      expect(component.mensaje).toHaveBeenCalledWith('URL no válida');
    });

    it('should handle service errors with messages', () => {
      spyOn(component, 'mensaje');
      mockService.crearUrl.and.returnValue(throwError(() => ({ message: 'Server error' })));
      component.nuevoRecurso.url = 'https://youtube.com/watch?v=123';
      
      component.crearPorUrl();
      
      expect(component.mensaje).toHaveBeenCalledWith('Error al crear recurso: Server error');
    });
  });

  // Tests de subida de archivos con mensajes
  describe('subirArchivos with messaging', () => {
    beforeEach(() => {
      component.paginaId = 123;
      component.archivos = [createMockFile('test.jpg', 'image/jpeg')];
    });

    it('should upload files successfully', () => {
      spyOn(component.recursoCreado, 'emit');
      spyOn(component, 'mensaje');
      
      component.subirArchivos();
      
      expect(mockService.subir).toHaveBeenCalled();
      expect(component.recursoCreado.emit).toHaveBeenCalledWith(mockRecurso);
    });

    it('should show error message when no files or page ID', () => {
      spyOn(component, 'mensaje');
      
      component.archivos = [];
      component.subirArchivos();
      
      expect(component.mensaje).toHaveBeenCalledWith('No hay archivos para subir o página no especificada');
    });

    it('should handle upload errors with messages', () => {
      spyOn(component, 'mensaje');
      mockService.subir.and.returnValue(throwError(() => ({ message: 'Upload failed' })));
      
      component.subirArchivos();
      
      expect(component.mensaje).toHaveBeenCalledWith('Error al subir test.jpg: Upload failed');
    });
  });

  // Tests del método save override
  describe('save method override', () => {
    it('should call subirArchivos when in archivo mode', () => {
      spyOn(component, 'subirArchivos');
      component.modo = 'archivo';
      
      component.save();
      
      expect(component.subirArchivos).toHaveBeenCalled();
    });

    it('should call crearPorUrl when in url mode', () => {
      spyOn(component, 'crearPorUrl');
      component.modo = 'url';
      
      component.save();
      
      expect(component.crearPorUrl).toHaveBeenCalled();
    });
  });

  // Tests de funcionalidad básica
  describe('Basic functionality', () => {
    it('should change mode and clean form', () => {
      component.archivos = [createMockFile('test.jpg', 'image/jpeg')];
      component.nuevoRecurso.nombre = 'test';
      
      component.cambiarModo('url');
      
      expect(component.modo).toBe('url');
      expect(component.archivos).toEqual([]);
      expect(component.nuevoRecurso.nombre).toBe('');
    });

    it('should handle drag and drop events', () => {
      const mockEvent = { preventDefault: jasmine.createSpy() } as any;
      
      component.onDragOver(mockEvent);
      expect(component.dragging).toBe(true);
      
      component.onDragLeave(mockEvent);
      expect(component.dragging).toBe(false);
    });

    it('should format file sizes correctly', () => {
      expect(component.formatearTamano(500)).toBe('500 B');
      expect(component.formatearTamano(1536)).toBe('1.5 KB');
      expect(component.formatearTamano(2097152)).toBe('2.0 MB');
    });
  });
});