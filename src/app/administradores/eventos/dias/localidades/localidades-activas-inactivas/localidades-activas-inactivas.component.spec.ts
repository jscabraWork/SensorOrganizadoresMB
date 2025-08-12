import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LocalidadesActivasInactivasComponent } from './localidades-activas-inactivas.component';
import { of, throwError } from 'rxjs';
import { LocalidadDataService } from '../../../../../service/data/localidad-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Localidad } from '../../../../../models/localidad.model';


describe('LocalidadesActivasInactivasComponent', () => {
  let component: LocalidadesActivasInactivasComponent;
  let fixture: ComponentFixture<LocalidadesActivasInactivasComponent>;

  const mockLocalidadService = {
    listarPorEstado: jasmine.createSpy('listarPorEstado').and.returnValue(of([])),
    editarEstadoDeLocalidad: jasmine.createSpy('editarEstadoDeLocalidad').and.returnValue(of({ id: 1, estado: 0 })),
    borrarLocalidad: jasmine.createSpy('borrarLocalidad').and.returnValue(of(null))
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    url: '/administradores/admin/test/temporada/1/evento/2/dia/3/localidades/activas'
  };
  
  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true))
  };
  mockDialog.open.and.returnValue(mockDialogRef);

  const mockActivatedRoute = {
  parent: {
    parent: {
      paramMap: of({
        get: (key: string) => key === 'nombre' ? 'admin123' : null
      })
    },
    paramMap: of({
      get: (key: string) => {
        if (key === 'idTemporada') return '1';
        if (key === 'idEvento') return '2';
        if (key === 'idDia') return '3';
        return null;
      },
      has: (key: string) => key === 'idDia' // esto es importante para `params.has(...)`
    })
  }
};


  beforeEach(async () => {
    sessionStorage.setItem('administrador', 'admin123');
    await TestBed.configureTestingModule({
      imports: [LocalidadesActivasInactivasComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: LocalidadDataService, useValue: mockLocalidadService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocalidadesActivasInactivasComponent);
    component = fixture.componentInstance;
    
    // Espiamos openMensaje para no depender del diálogo real
    spyOn(component, 'openMensaje').and.returnValue(of(true));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe configurar correctamente los parámetros de ruta', () => {
      component.ngOnInit();
      expect(component.nombre).toBe('admin123');
      expect(component.idTemporada).toBe(1);
      expect(component.idEvento).toBe(2);
      expect(component.idDia).toBe(3);
    });

    it('debe determinar correctamente si es ruta activos', () => {
      expect(component.esRutaActivos).toBeTrue();
    });
  });

  describe('cargarLocalidades', () => {
    it('debe cargar localidades activas (estado 0)', () => {
      const mockLocalidades = [{ id: 1, estado: 0 }] as Localidad[];
      mockLocalidadService.listarPorEstado.and.returnValue(of(mockLocalidades));
      
      component.esRutaActivos = true;
      component.cargarLocalidades();
      
      expect(mockLocalidadService.listarPorEstado).toHaveBeenCalledWith(3, 0);
      expect(component.localidades).toEqual(mockLocalidades);
      expect(component.cargando).toBeFalse();
    });

    it('debe cargar localidades inactivas (estado 1)', () => {
      const mockLocalidades = [{ id: 1, estado: 1 }] as Localidad[];
      mockLocalidadService.listarPorEstado.and.returnValue(of(mockLocalidades));
      
      component.esRutaActivos = false;
      component.esRutaPorEvento = false; // Asegura que no entre por listarPorEventoId
      component.idDia = 3; // Este es el id que se espera en listarPorEstado

      component.cargarLocalidades();
      
      expect(mockLocalidadService.listarPorEstado).toHaveBeenCalledWith(3, 1);
      expect(component.localidades).toEqual(mockLocalidades);
      expect(component.cargando).toBeFalse();
    });


    it('debe manejar error al cargar localidades', fakeAsync(() => {
      mockLocalidadService.listarPorEstado.and.returnValue(throwError(() => new Error('Error')));
      
      component.idDia = 1;
      component.esRutaPorEvento = false;
      component.cargarLocalidades();

      tick(); // Espera a que se ejecute la suscripción

      expect(component.cargando).toBeFalse();
    }));
  });

  describe('cambiarEstado', () => {
    it('debe cambiar el estado de la localidad exitosamente', fakeAsync(() => {
      const localidadOriginal = { 
        id: 1, 
        nombre: 'Localidad VIP',
        estado: 1,
        tarifas: [],
        dias: []
      } as Localidad;
      
      const localidadActualizada = { 
        ...localidadOriginal,
        estado: 0
      };
  
      mockLocalidadService.editarEstadoDeLocalidad.and.returnValue(of(localidadActualizada));
      mockLocalidadService.listarPorEstado.and.returnValue(of([localidadActualizada])); 

  
      component.localidades = [localidadOriginal];
      component.cargando = false;
  
      component.cambiarEstado(localidadOriginal);
      tick(); 
  
      expect(mockLocalidadService.editarEstadoDeLocalidad).toHaveBeenCalledWith(localidadOriginal);
      expect(component.openMensaje).toHaveBeenCalledWith('Estado de la localidad cambiado correctamente');
      expect(component.localidades[0].estado).toBe(0);
      expect(component.cargando).toBeFalse(); 
    }));

    it('debe manejar error al cambiar estado', fakeAsync(() => {
      const localidad = { id: 1, estado: 1 } as Localidad;
      component.localidades = [localidad];
    
      mockLocalidadService.editarEstadoDeLocalidad.and.returnValue(throwError(() => new Error('Error')));
    
      component.cambiarEstado(localidad);
      tick();
    
      expect(localidad.estado).toBe(0); // estado revertido
      expect(component.openMensaje).toHaveBeenCalledWith('No se pudo cambiar el estado');
    }));
  });

  describe('eliminarLocalidad', () => {
    it('debe eliminar localidad cuando se confirma', fakeAsync(() => {
      mockLocalidadService.borrarLocalidad.and.returnValue(of(null));
      spyOn(component, 'refrescar');
    
      component.eliminarLocalidad(1);
      tick();
    
      expect(component.openMensaje).toHaveBeenCalledWith("¿Desea borrar la localidad?", true);
      expect(mockLocalidadService.borrarLocalidad).toHaveBeenCalledWith(1);
      expect(component.openMensaje).toHaveBeenCalledWith("Se borró exitosamente la localidad");
      expect(component.refrescar).toHaveBeenCalled();
    }));

    it('debe manejar error al eliminar localidad', fakeAsync(() => {
      const error = { error: { message: 'Error específico' } };
      mockLocalidadService.borrarLocalidad.and.returnValue(throwError(() => error));
    
      component.eliminarLocalidad(1);
      tick();
    
      expect(component.openMensaje).toHaveBeenCalledWith("Error específico");
    }));
  });

  describe('editarLocalidad', () => {
    it('debe navegar a la ruta de edición', () => {
      const localidad = { id: 5 } as Localidad;
      
      component.editarLocalidad(localidad);
    
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/administradores/admin', 'admin123', 'temporada', 1, 'evento', 2, 'dia', 3, 'localidades', 'editar', 5
      ]);
    });
  });

  describe('toggleItem', () => {
    it('debe seleccionar el ítem si no está seleccionado', () => {
      component.selectedItem = null;
      component.toggleItem(2);
      expect(component.selectedItem).toBe(2);
    });
    
    it('debe deseleccionar el ítem si ya estaba seleccionado', () => {
      component.selectedItem = 2;
      component.toggleItem(2);
      expect(component.selectedItem).toBeNull();
    });
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });
});
