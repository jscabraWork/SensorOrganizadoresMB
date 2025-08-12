import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { RecursosComponent } from './recursos.component';
import { RecursosDataService } from '../../../../service/data/recursos-data.service';
import { Recurso } from '../../../../models/pagina.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/**
 * Tests unitarios optimizados para RecursosComponent
 * 
 * ENFOQUE:
 * - Solo testear lógica específica del componente
 * - Mockear completamente dependencias externas
 * - Tests simples y directos
 */
describe('RecursosComponent', () => {
  let component: RecursosComponent;
  let fixture: ComponentFixture<RecursosComponent>;
  let mockService: jasmine.SpyObj<RecursosDataService>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  // Datos de prueba simplificados
  const mockRecurso: Recurso = {
    id: 1,
    nombre: 'Test Image',
    url: 'http://test.com/image.jpg',
    tipo: 0,
    size: 1024,
    formato: 'jpg'
  } as Recurso;

  const mockVideoRecurso: Recurso = {
    id: 2,
    nombre: 'Test Video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tipo: 1,
    size: 2048,
    formato: 'mp4'
  } as Recurso;

  beforeEach(async () => {
    // Mocks simplificados
    mockService = jasmine.createSpyObj('RecursosDataService', [
      'listarPorAtributo', 'delete'
    ]);
    
    mockSanitizer = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustResourceUrl'
    ]);

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    const mockActivatedRoute = {
      parent: {
        paramMap: of(new Map([['paginaId', '123']]))
      }
    };

    await TestBed.configureTestingModule({
      imports: [RecursosComponent, HttpClientTestingModule],
      providers: [
        { provide: RecursosDataService, useValue: mockService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: MatDialog, useValue: mockDialog }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RecursosComponent);
    component = fixture.componentInstance;
    
    // Configurar respuestas por defecto
    mockService.listarPorAtributo.and.returnValue(of({ lista: [mockRecurso] }));
    mockSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe-url' as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test de inicialización básica
  describe('Initialization', () => {
    it('should set id from paginaId input', () => {
      component.paginaId = 456;
      
      component.ngOnInit();
      
      expect((component as any).id).toBe(456);
    });

    it('should get id from route when paginaId not provided', () => {
      component.paginaId = null;
      
      component.ngOnInit();
      
      expect((component as any).id).toBe(123);
    });
  });

  // Test del método manejar (override específico)
  describe('manejar method override', () => {
    it('should filter resources by allowed types', () => {
      const recursos = [mockRecurso, mockVideoRecurso];
      component.tiposPermitidos = [0]; // Solo imágenes
      
      component.manejar({ lista: recursos });
      
      expect(component.lista).toEqual([mockRecurso]);
    });

    it('should show all resources when no type filter', () => {
      const recursos = [mockRecurso, mockVideoRecurso];
      component.tiposPermitidos = [];
      
      component.manejar({ lista: recursos });
      
      expect(component.lista).toEqual(recursos);
    });

    it('should handle null response', () => {
      component.manejar(null);
      
      expect(component.lista).toEqual([]);
    });
  });

  // Tests de funcionalidad específica
  describe('Component specific functionality', () => {
    it('should emit recursoSeleccionado on selection', () => {
      spyOn(component.recursoSeleccionado, 'emit');
      
      component.seleccionarRecurso(mockRecurso);
      
      expect(component.recursoSeleccionado.emit).toHaveBeenCalledWith(mockRecurso);
    });

    it('should toggle form creation', () => {
      expect(component.mostrarFormularioCreacion).toBe(false);
      
      component.toggleFormularioCreacion();
      expect(component.mostrarFormularioCreacion).toBe(true);
      
      component.toggleFormularioCreacion();
      expect(component.mostrarFormularioCreacion).toBe(false);
    });

    it('should add created resource when type allowed', () => {
      component.tiposPermitidos = [1]; // Solo videos
      component.lista = [];
      
      component.onRecursoCreado(mockVideoRecurso);
      
      expect(component.lista).toEqual([mockVideoRecurso]);
      expect(component.mostrarFormularioCreacion).toBe(false);
    });

    it('should not add created resource when type not allowed', () => {
      component.tiposPermitidos = [1]; // Solo videos
      component.lista = [];
      
      component.onRecursoCreado(mockRecurso); // Es imagen
      
      expect(component.lista).toEqual([]);
    });
  });

  // Tests de utilidades
  describe('Utility methods', () => {
    it('should format file sizes correctly', () => {
      expect(component.formatearTamano(500)).toBe('500 B');
      expect(component.formatearTamano(1536)).toBe('1.5 KB');
      expect(component.formatearTamano(2097152)).toBe('2.0 MB');
      expect(component.formatearTamano(0)).toBe('');
    });

    it('should detect direct video URLs', () => {
      expect(component.esVideoDirecto('video.mp4')).toBe(true);
      expect(component.esVideoDirecto('https://youtube.com/watch')).toBe(false);
    });

    it('should convert YouTube URLs to embed format', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      
      const result = component.getEmbedUrl(url);
      
      expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should extract YouTube ID correctly', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      
      const result = (component as any).extractYouTubeId(url);
      
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid YouTube URLs', () => {
      const result = (component as any).extractYouTubeId('invalid-url');
      
      expect(result).toBeNull();
    });
  });

  // Test de eliminación (usa el método del padre)
  describe('Delete functionality', () => {
    it('should call parent delete method when confirmed', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy() } as any;
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'delete'); // Mockear el método del padre
      
      component.deleteById(mockRecurso, mockEvent);
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de eliminar "Test Image"?');
      expect(component.delete).toHaveBeenCalledWith(1);
    });

    it('should not delete when cancelled', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy() } as any;
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(component, 'delete');
      
      component.deleteById(mockRecurso, mockEvent);
      
      expect(component.delete).not.toHaveBeenCalled();
    });
  });
});