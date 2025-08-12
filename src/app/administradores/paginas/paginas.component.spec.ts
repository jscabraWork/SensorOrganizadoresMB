import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { PaginasComponent } from './paginas.component';
import { PaginasDataService } from '../../service/data/paginas.data.service';
import { Pagina, Seccion } from '../../models/pagina.model';

// Mock del componente de título
@Component({
  selector: 'app-title',
  template: '',
  standalone: true
})
class MockTitleComponent {
  @Input() title: string;
  @Input() showBackButton: boolean;
}

// Mock del componente de tabla
@Component({
  selector: 'app-table',
  template: '<div>Mock Table</div>',
  standalone: true
})
class MockTableComponent {
  @Input() data: any;
  @Input() cargando: boolean;
  @Input() columnas: string[];
  @Input() headers: string[];
  @Input() botones: any[];
  @Input() selects: any[];
  @Input() expandableConfig: any;
  @Input() mensajeVacio: string;
}

/**
 * Tests unitarios optimizados para PaginasComponent
 * 
 * ENFOQUE:
 * - Tests en español para mejor comprensión
 * - Mock explícito de dependencias externas
 * - Solo funcionalidad específica del componente
 * - Enfoque en lógica de negocio
 */
describe('PaginasComponent', () => {
  let component: PaginasComponent;
  let fixture: ComponentFixture<PaginasComponent>;
  let mockService: jasmine.SpyObj<PaginasDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const paginaEjemplo: Pagina = {
    ...new Pagina(),
    id: 1,
    nombre: 'Página de Prueba',
    estado: 1,
    secciones: [
      { ...new Seccion(), id: 1, nombre: 'Sección 1' },
      { ...new Seccion(), id: 2, nombre: 'Sección 2' }
    ]
  };

  const respuestaEjemplo = {
    lista: [paginaEjemplo]
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PaginasDataService', [
      'listarPorAtributo',
      'actualizarEstado',
      'delete'
    ]);
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      snapshot: { params: {} }
    };
    
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    // Mock del diálogo para devolver observable
    mockDialog.open.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    await TestBed.configureTestingModule({
      imports: [
        PaginasComponent,
        HttpClientTestingModule,
        MockTitleComponent,
        MockTableComponent
      ],
      providers: [
        { provide: PaginasDataService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginasComponent);
    component = fixture.componentInstance;

    mockService.listarPorAtributo.and.returnValue(of(respuestaEjemplo));
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('debería inicializar con estado 1 y llamar refrescar', () => {
      spyOn(component, 'refrescar');
      
      component.ngOnInit();
      
      expect(component.estado).toBe(1);
      expect(component.refrescar).toHaveBeenCalled();
    });
  });

  describe('manejar - Procesamiento específico de páginas', () => {
    it('debería agregar conteo de secciones a cada página', () => {
      const respuesta = {
        lista: [
          { 
            ...new Pagina(),
            id: 1, 
            nombre: 'Página 1', 
            secciones: [
              { ...new Seccion(), id: 1 }, 
              { ...new Seccion(), id: 2 }
            ] 
          },
          { 
            ...new Pagina(),
            id: 2, 
            nombre: 'Página 2', 
            secciones: null 
          }
        ]
      };

      component.manejar(respuesta);

      expect(component.lista[0]['seccionesCount']).toBe(2);
      expect(component.lista[1]['seccionesCount']).toBe(0);
    });

    it('debería manejar lista vacía sin errores', () => {
      const respuesta = { lista: [] };

      component.manejar(respuesta);

      expect(component.lista).toEqual([]);
    });
  });

  describe('toggleMenu - Cambio de estado', () => {
    it('debería actualizar estado y refrescar lista', () => {
      spyOn(component, 'refrescar');
      
      component.toggleMenu(2);

      expect(component.estado).toBe(2);
      expect((component as any).id).toBe(2); // Acceso usando cast para propiedad protegida
      expect(component.refrescar).toHaveBeenCalled();
    });
  });

  describe('navigateToCrear', () => {
    it('debería navegar a la ruta de crear', () => {
      component.navigateToCrear();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['crear'], { 
        relativeTo: mockActivatedRoute 
      });
    });
  });

  describe('actualizarEstado - Lógica específica', () => {
    beforeEach(() => {
      spyOn(component, 'refrescar');
      spyOn(component, 'mensaje');
    });

    it('debería actualizar estado exitosamente', () => {
      const pagina = { ...paginaEjemplo };
      mockService.actualizarEstado.and.returnValue(of({ success: true }));

      component.actualizarEstado(pagina);

      expect(component.cargando).toBe(false);
      expect(mockService.actualizarEstado).toHaveBeenCalledWith(pagina);
      expect(component.refrescar).toHaveBeenCalled();
      expect(component.mensaje).toHaveBeenCalledWith('Se actualizó el estado de la página');
    });

    it('debería manejar errores al actualizar estado', () => {
      const pagina = { ...paginaEjemplo };
      mockService.actualizarEstado.and.returnValue(throwError(() => new Error('Error')));

      component.actualizarEstado(pagina);

      expect(component.cargando).toBe(false);
      expect(component.mensaje).toHaveBeenCalledWith('Sucedio un error por favor vuelve a intentar');
      expect(component.refrescar).not.toHaveBeenCalled();
    });
  });

  describe('Configuración de botones y acciones', () => {
    it('debería navegar a modificar cuando se hace clic en Ver', () => {
      const pagina = { ...paginaEjemplo };
      
      component.botonesConfig[0].accion(pagina);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['modificar', pagina.id], { 
        relativeTo: mockActivatedRoute 
      });
    });

    it('debería llamar actualizarEstado desde configuración de select', () => {
      spyOn(component, 'actualizarEstado');
      const pagina = { ...paginaEjemplo };

      component.selectsConfig[0].action(pagina);

      expect(component.actualizarEstado).toHaveBeenCalledWith(pagina);
    });

    it('debería tener opciones correctas de estado en select', () => {
      const selectConfig = component.selectsConfig[0];

      expect(selectConfig.opciones).toEqual([
        { value: 0, label: 'Inactiva' },
        { value: 1, label: 'Activa' },
        { value: 2, label: 'Oculta' }
      ]);
    });
  });

  describe('Configuración expandible', () => {
    it('debería llamar delete desde botón eliminar', () => {
      spyOn(component, 'delete');
      const pagina = { ...paginaEjemplo };
      
      component.expandableConfig.actionButtons[1].action(pagina);

      expect(component.delete).toHaveBeenCalledWith(pagina.id);
    });

    it('debería tener campos de información correctos', () => {
      const infoFields = component.expandableConfig.infoFields;

      expect(infoFields).toEqual([
        { label: 'Nombre', property: 'nombre' },
        { label: 'Cantidad secciones', property: 'seccionesCount' }
      ]);
    });
  });
});