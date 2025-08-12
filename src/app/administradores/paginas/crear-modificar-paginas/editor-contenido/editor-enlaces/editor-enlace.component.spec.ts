import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { EditorEnlaceComponent } from './editor-enlace.component';
import { Enlace, EstiloContenido } from '../../../../../models/pagina.model';

// Mock del componente de propiedades comunes
@Component({
  selector: 'app-editor-propiedades-comunes',
  template: '',
  standalone: true
})
class MockEditorPropiedadesComunesComponent {
  @Input() contenido: any;
}

/**
 * Tests unitarios optimizados para EditorEnlaceComponent
 */
describe('EditorEnlaceComponent', () => {
  let component: EditorEnlaceComponent;
  let fixture: ComponentFixture<EditorEnlaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditorEnlaceComponent, 
        FormsModule,
        MockEditorPropiedadesComunesComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditorEnlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.enlace).toBeInstanceOf(Enlace);
      expect(component.enlace.url).toBe('');
      expect(component.enlace.texto).toBe('');
      expect(component.enlace.color).toBe('#007bff');
      expect(component.enlace.target).toBe('_self');
      expect(component.enlace.fontSize).toBe(16);
    });

    it('should have textAlign options available', () => {
      expect(Array.isArray(component.textAlignOptions)).toBe(true);
      expect(component.textAlignOptions.length).toBeGreaterThan(0);
    });
  });

  describe('inicializarDesdeContenidoExistente', () => {
    it('should initialize from existing content', () => {
      const existingEnlace = new Enlace();
      existingEnlace.url = 'https://test.com';
      existingEnlace.texto = 'Test Link';
      existingEnlace.color = '#ff0000';
      
      component.contenidoExistente = existingEnlace;
      component.inicializarDesdeContenidoExistente();
      
      expect(component.enlace.url).toBe('https://test.com');
      expect(component.enlace.texto).toBe('Test Link');
      expect(component.enlace.color).toBe('#ff0000');
    });

    it('should ensure estilos object exists', () => {
      const existingEnlace = { url: 'https://test.com' } as any;
      component.contenidoExistente = existingEnlace;
      
      component.inicializarDesdeContenidoExistente();
      
      expect(component.enlace.estilos).toBeInstanceOf(EstiloContenido);
    });
  });

  describe('esUrlValida', () => {
    it('should validate URLs correctly', () => {
      expect(component.esUrlValida('https://example.com')).toBe(true);
      expect(component.esUrlValida('http://test.com')).toBe(true);
      expect(component.esUrlValida('invalid-url')).toBe(false);
      expect(component.esUrlValida(null as any)).toBe(false);
    });
  });

  describe('obtenerElementoActual', () => {
    it('should return current enlace instance', () => {
      expect(component.obtenerElementoActual()).toBe(component.enlace);
    });
  });

  describe('guardar', () => {
    beforeEach(() => {
      spyOn(component.contenidoCreado, 'emit');
      spyOn(window, 'alert');
    });

    it('should save valid enlace', () => {
      component.enlace.url = 'https://example.com';
      component.enlace.texto = 'Example Link';
      
      component.guardar();
      
      expect(component.contenidoCreado.emit).toHaveBeenCalledWith(jasmine.any(Enlace));
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should not save with invalid URL', () => {
      component.enlace.url = 'invalid-url';
      component.enlace.texto = 'Example Link';
      
      component.guardar();
      
      expect(component.contenidoCreado.emit).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Por favor, ingrese una URL válida. Debe incluir http:// o https://');
    });

    it('should create new instance when saving', () => {
      component.enlace.url = 'https://example.com';
      component.enlace.texto = 'Test';
      component.enlace.color = '#ff0000';
      
      component.guardar();
      
      const emitted = (component.contenidoCreado.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emitted).not.toBe(component.enlace);
      expect(emitted.url).toBe('https://example.com');
      expect(emitted.color).toBe('#ff0000');
    });
  });
});

