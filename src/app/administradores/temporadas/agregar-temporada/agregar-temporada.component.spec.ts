import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AgregarTemporadaComponent } from './agregar-temporada.component';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TemporadaDataService } from '../../../service/data/temporada-data.service';
import { MatDialog } from '@angular/material/dialog';

describe('AgregarTemporadaComponent', () => {
  let component: AgregarTemporadaComponent;
  let fixture: ComponentFixture<AgregarTemporadaComponent>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    getCurrentNavigation: () => ({
      extras: {
        state: {
          temporada: { id: 1, nombre: 'Test', fechaInicio: '2023-01-01', fechaFin: '2023-01-10' }
        }
      }
    })
  };

  const mockActivatedRoute: any = {
    parent: {
      paramMap: of(convertToParamMap({ nombre: 'admin123' }))
    },
    paramMap: of(convertToParamMap({}))
  };

  const mockTemporadaService = {
    crear: jasmine.createSpy('crear').and.returnValue(of({})),
    editarTemporada: jasmine.createSpy('editarTemporada').and.returnValue(of({})),
    getPorId: jasmine.createSpy('getPorId').and.returnValue(of({
      id: 1,
      nombre: 'Temporada Cargada',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31'
    }))
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
  };

  const setParamMap = (id: string | null, nombre: string) => {
    mockActivatedRoute.paramMap = of(convertToParamMap({ id: id ?? '', nombre }));
    mockActivatedRoute.parent = {
      paramMap: of(convertToParamMap({ nombre }))
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarTemporadaComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TemporadaDataService, useValue: mockTemporadaService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarTemporadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe validar el formulario como válido', () => {
    component.temporada = {
      nombre: 'Test',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31'
    } as any;

    expect(component.isFormValid()).toBeTrue();
  });

  it('debe mostrar error si la fecha de inicio es mayor a la de fin', () => {
    component.temporada = {
      nombre: 'Error Fecha',
      fechaInicio: '2025-01-01',
      fechaFin: '2024-01-01'
    } as any;

    component.crearTemporada();

    expect(component.fechaError).toBeTrue();
    expect(component.loading).toBeFalse();
  });

  it('debe llamar a crearNuevaTemporada si no hay id en la ruta (modo creación)', fakeAsync(() => {
    // Asegurarse de que los espías estén reiniciados
    mockRouter.navigate.calls.reset();
    mockTemporadaService.crear.calls.reset();
    
    // Establecer modo creación (sin ID o con ID vacío)
    setParamMap('', 'admin123');
    
    // Inicializar componente
    component.ngOnInit();
    tick(); // Esperar a que se resuelvan los observables en ngOnInit
    
    // Configurar temporada manualmente
    component.temporada = {
      nombre: 'Nueva Temporada',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31'
    } as any;
    
    // Asegurarse de que estamos en modo creación, no edición
    component.modoEdicion = false;
    component.temporadaId = null;
    
    // Mockear métodos
    mockTemporadaService.crear.and.returnValue(of({ success: true }));
    
    // Ejecutar método
    component.crearTemporada();
    
    // Avanzar en tiempo simulado para completar operaciones asincrónicas
    tick();
    
    // Verificar que se llamaron los métodos correctos
    expect(mockTemporadaService.crear).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalled();
  }));

  it('debe llamar a actualizarTemporada si hay id en la ruta (modo edición)', fakeAsync(() => {
    // Establecer modo edición (con ID)
    setParamMap('1', 'admin123');
    
    // Inicializar componente para que detecte el modo edición
    component.ngOnInit();
    tick(); // Esperar a que se resuelvan los observables en ngOnInit
    
    // Confirmar que estamos en modo edición
    expect(component.modoEdicion).toBeTrue();
    
    // Configurar la temporada manualmente para evitar dependencia de cargarTemporada
    component.temporada = {
      id: 1,
      nombre: 'Editar Temporada',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31'
    } as any;
    
    // Mockear métodos
    mockTemporadaService.editarTemporada.and.returnValue(of({ success: true }));
    
    // Ejecutar método
    component.crearTemporada();
    
    // Avanzar en tiempo simulado para completar operaciones asincrónicas
    tick();
    
    // Verificar que se llamaron los métodos correctos
    expect(mockTemporadaService.editarTemporada).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalled();
  }));

  it('debe manejar error al crear una temporada', () => {
    setParamMap(null, 'admin123');

    mockTemporadaService.crear.and.returnValue(throwError(() => new Error('Error')));

    component.temporada = {
      nombre: 'Error Crear',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31'
    } as any;

    component.ngOnInit();

    component.crearTemporada();

    expect(component.loading).toBeFalse();
  });

  it('debe manejar error al actualizar una temporada', () => {
    setParamMap('1', 'admin123');

    mockTemporadaService.editarTemporada.and.returnValue(throwError(() => new Error('Error')));

    spyOn(component as any, 'cargarTemporada').and.callFake(() => {
      component.temporada = {
        id: 1,
        nombre: 'Error Actualizar',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31'
      } as any;
    });

    component.ngOnInit();

    component.crearTemporada();

    expect(component.loading).toBeFalse();
  });
});
