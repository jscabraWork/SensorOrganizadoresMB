import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AgregarLocalidadComponent } from './agregar-localidad.component';
import { LocalidadDataService } from '../../../../../service/data/localidad-data.service';
import { DiaDataService } from '../../../../../service/data/dia-data.service';
import { TarifaDataService } from '../../../../../service/data/tarifa-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tarifa } from '../../../../../models/tarifa.model';
import { Dia } from '../../../../../models/dia.model';
import { Localidad } from '../../../../../models/localidad.model';

describe('AgregarLocalidadComponent', () => {
  let component: AgregarLocalidadComponent;
  let fixture: ComponentFixture<AgregarLocalidadComponent>;
  let mockLocalidadService: jasmine.SpyObj<LocalidadDataService>;
  let mockDiaService: jasmine.SpyObj<DiaDataService>;
  let mockTarifaService: jasmine.SpyObj<TarifaDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockLocalidadService = jasmine.createSpyObj('LocalidadDataService', [
      'crearLocalidad', 'editarLocalidad', 'getPorId'
    ]);
    mockDiaService = jasmine.createSpyObj('DiaDataService', ['listarPorEvento', 'getPorId']);
    mockTarifaService = jasmine.createSpyObj('TarifaDataService', ['listarPorEvento']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => {
          if (key === 'idTemporada') return '1';
          if (key === 'idEvento') return '2';
          if (key === 'idDia') return '3';
          if (key === 'id') return null; // No ID para modo creación por defecto
          return null;
        },
        has: (key: string) => key === 'idDia' // Por defecto, viene por día
      }),
      parent: {
        paramMap: of({
          get: (key: string) => key === 'nombre' ? 'testAdmin' : null
        })
      }
    };
    sessionStorage.setItem('administrador', 'testAdmin');
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        AgregarLocalidadComponent
      ],
      providers: [
        { provide: LocalidadDataService, useValue: mockLocalidadService },
        { provide: DiaDataService, useValue: mockDiaService },
        { provide: TarifaDataService, useValue: mockTarifaService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarLocalidadComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Modo creación', () => {
    beforeEach(() => {
      const mockDias: Dia[] = [{ id: 1, nombre: 'Día 1' } as Dia];
      const mockTarifas: Tarifa[] = [{ id: 1, nombre: 'Tarifa 1' } as Tarifa];

      mockDiaService.listarPorEvento.and.returnValue(of(mockDias));
      mockTarifaService.listarPorEvento.and.returnValue(of(mockTarifas));

      fixture.detectChanges();
    });

    it('debería inicializar en modo creación', () => {
      expect(component.modoEdicion).toBeFalse();
      expect(component.localidad).toEqual(new Localidad());
    });

    it('debería cargar días y tarifas del evento', () => {
      expect(mockDiaService.listarPorEvento).toHaveBeenCalledWith(2);
      expect(component.dias.length).toBeGreaterThan(0);
    });

    it('debería validar formulario correctamente', () => {
      // Formulario vacío no es válido
      expect(component.isFormValid()).toBeFalse();

      // Rellenar datos válidos
      component.localidad.nombre = 'Localidad prueba';
      component.diasLocalidad = [{ id: 1 } as Dia];

      expect(component.isFormValid()).toBeTrue();

      // Formulario sin nombre no es válido
      component.localidad.nombre = '';
      expect(component.isFormValid()).toBeFalse();

      // Formulario sin días no es válido
      component.localidad.nombre = 'Localidad prueba';
      component.diasLocalidad = [];
      expect(component.isFormValid()).toBeFalse();

    });

    it('debería crear nueva localidad cuando el formulario es válido', fakeAsync(() => {
      const nuevaLocalidad = new Localidad();
      nuevaLocalidad.nombre = 'Nueva localidad';
      component.localidad = nuevaLocalidad;
      component.diasLocalidad = [{ id: 1 } as Dia];
      component.tarifasLocalidad = [{ id: 1 } as Tarifa];

      mockLocalidadService.crearLocalidad.and.returnValue(of(nuevaLocalidad));

      component.crearLocalidad();
      tick();

      expect(mockLocalidadService.crearLocalidad).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/administradores/admin', 'testAdmin', 'temporada', 1, 'evento', 2, 'dia', 3, 'localidades'
      ]);
    }));

    it('debería mostrar diálogo de confirmación cuando hay conflicto 409', fakeAsync(() => {
      const nuevaLocalidad = new Localidad();
      nuevaLocalidad.nombre = 'Localidad existente';
      component.localidad = nuevaLocalidad;
      component.diasLocalidad = [{ id: 1 } as Dia];

      // 1. Solo configura el error 409, sin éxito posterior
      const error = { status: 409 };
      mockLocalidadService.crearLocalidad.and.returnValue(throwError(() => error));

      // 2. Mock del diálogo que retorna false (usuario cancela)
      const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false) });
      mockDialog.open.and.returnValue(dialogRefSpyObj);

      // 3. Spy en goBack
      spyOn(component, 'goBack');

      // 4. Ejecuta
      component.crearLocalidad();
      tick();

      // 5. Verifica que se abrió el diálogo UNA vez con el mensaje correcto
      expect(mockDialog.open).toHaveBeenCalledTimes(1);
      expect(mockDialog.open).toHaveBeenCalledWith(
        jasmine.any(Function), // MensajeComponent
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            mensaje: 'Ya existe una localidad con ese nombre. ¿Desea crearla de todas formas?',
            mostrarBotones: true
          })
        })
      );

      // 6. Verifica que se llamó una vez al servicio
      expect(mockLocalidadService.crearLocalidad).toHaveBeenCalledTimes(1);

      // 7. Verifica que se navegó de vuelta (usuario canceló)
      expect(component.goBack).toHaveBeenCalled();
    }));

    it('debería mostrar mensaje de error cuando el formulario no es válido', fakeAsync(() => {
      // Sin días ni tarifas
      component.localidad.nombre = 'Localidad prueba';
      component.diasLocalidad = [];
      component.tarifasLocalidad = [];

      spyOn(component, 'openMensaje');
      component.crearLocalidad();
      tick();

      expect(component.openMensaje).toHaveBeenCalledWith('Debes asignarle al menos un día a la localidad');
    }));

  });

  describe('Modo edición', () => {
    const localidadExistente: Localidad = {
      id: 1,
      nombre: 'Localidad existente',
      estado: 1,
      aporte_minimo: 0,
      tipo: 0,
      dias: [{ id: 1 } as Dia],
      tarifas: [{ id: 1 } as Tarifa]
    };

    beforeEach(fakeAsync(() => {
      // Configuración para modo edición
      mockActivatedRoute.paramMap = of({
        get: (key: string) => {
          if (key === 'id') return '1'; // ID de la localidad a editar
          if (key === 'idTemporada') return '1';
          if (key === 'idEvento') return '2';
          if (key === 'idDia') return '3';
          return null;
        },
        has: (key: string) => key === 'idDia' || key === 'id'
      });

      const mockDias: Dia[] = [{ id: 1, nombre: 'Día 1' } as Dia];

      mockLocalidadService.getPorId.and.returnValue(of(localidadExistente));
      mockDiaService.listarPorEvento.and.returnValue(of(mockDias));

      fixture = TestBed.createComponent(AgregarLocalidadComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick(); // Para manejar las llamadas asíncronas
    }));

    it('debería inicializar en modo edición', () => {
      expect(component.modoEdicion).toBeTrue();
      expect(component.localidad.id).toBe(1);
    });

    it('debería cargar la localidad existente con sus relaciones', () => {
      expect(mockLocalidadService.getPorId).toHaveBeenCalledWith(1);
      expect(component.localidad).toEqual(localidadExistente);
      expect(component.diasLocalidad.length).toBe(1);
      expect(component.tarifasLocalidad.length).toBe(1);
    });

    it('debería actualizar la localidad existente', fakeAsync(() => {
      const localidadEditada = { ...localidadExistente };
      localidadEditada.nombre = 'Localidad modificada';

      component.localidad = localidadEditada;
      mockLocalidadService.editarLocalidad.and.returnValue(of(localidadEditada));

      component.crearLocalidad();
      tick();

      expect(mockLocalidadService.editarLocalidad).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/administradores/admin', 'testAdmin', 'temporada', 1, 'evento', 2, 'dia', 3, 'localidades'
      ]);
    }));

    it('debería manejar conflicto al actualizar localidad existente', fakeAsync(() => {
      const localidadEditada = { ...localidadExistente };
      const error = { status: 409 };

      component.localidad = localidadEditada;
      mockLocalidadService.editarLocalidad.and.returnValue(throwError(() => error));

      // Cambia el mock SOLO para este test
      const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false) });
      mockDialog.open.and.returnValue(dialogRefSpyObj);

      component.crearLocalidad();
      tick();

      expect(mockDialog.open).toHaveBeenCalled();
    }));


    it('debería manejar error genérico al actualizar localidad', fakeAsync(() => {
      const localidadEditada = { ...localidadExistente };
      const error = { status: 500, message: 'Error interno del servidor' };

      component.localidad = localidadEditada;
      mockLocalidadService.editarLocalidad.and.returnValue(throwError(() => error));

      const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false) });
      mockDialog.open.and.returnValue(dialogRefSpyObj);

      spyOn(component, 'openMensaje');
      component.crearLocalidad();
      tick();

      expect(component.openMensaje).toHaveBeenCalledWith('Error al actualizar la localidad');
    }));
  });

  describe('Métodos auxiliares', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería agregar día a la lista', () => {
      component.diaAgregar = { id: 1, nombre: 'Día 1' } as Dia;
      component.agregarALista('dia');

      expect(component.diasLocalidad.length).toBe(1);
      expect(component.diaAgregar).toBeNull();
    });

    it('debería agregar tarifa a la lista', () => {
      component.tarifaAgregar = { id: 1, nombre: 'Tarifa 1' } as Tarifa;
      component.agregarALista('tarifa');

      expect(component.tarifasLocalidad.length).toBe(1);
      expect(component.tarifaAgregar).toBeNull();
    });

    it('debería mostrar mensaje si día ya está agregado', () => {
      component.diaAgregar = { id: 1, nombre: 'Día 1' } as Dia;
      component.diasLocalidad = [{ id: 1, nombre: 'Día 1' } as Dia];

      spyOn(component, 'openMensaje');
      component.agregarALista('dia');

      expect(component.openMensaje).toHaveBeenCalledWith('El día ya está agregado');
    });

    it('debería mostrar mensaje si tarifa ya está agregada', () => {
      component.tarifaAgregar = { id: 1, nombre: 'Tarifa 1' } as Tarifa;
      component.tarifasLocalidad = [{ id: 1, nombre: 'Tarifa 1' } as Tarifa];

      spyOn(component, 'openMensaje');
      component.agregarALista('tarifa');

      expect(component.openMensaje).toHaveBeenCalledWith('La tarifa ya está agregada');
    });

    it('debería quitar elemento de la lista', () => {
      component.diasLocalidad = [{ id: 1 } as Dia];
      component.tarifasLocalidad = [{ id: 1 } as Tarifa];

      component.quitarLista(0, 'dia');
      component.quitarLista(0, 'tarifa');

      expect(component.diasLocalidad.length).toBe(0);
      expect(component.tarifasLocalidad.length).toBe(0);
    });
  });

  describe('Rutas y navegación', () => {
    it('debería navegar de vuelta a lista de localidades por día', () => {
      component.esRutaPorEvento = false;
      component.nombre = 'testAdmin';
      component.temporadaId = 1;
      component.eventoId = 2;
      component.diaId = 3;

      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/administradores/admin', 'testAdmin', 'temporada', 1, 'evento', 2, 'dia', 3, 'localidades'
      ]);
    });

    it('debería navegar de vuelta a lista de localidades por evento', () => {
      component.esRutaPorEvento = true;
      component.nombre = 'testAdmin';
      component.temporadaId = 1;
      component.eventoId = 2;

      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/administradores/admin', 'testAdmin', 'temporada', 1, 'evento', 2, 'localidades'
      ]);
    });
  });

  describe('Inicialización por ruta', () => {
    it('debería inicializarse correctamente por ruta de evento', fakeAsync(() => {
      // Configuración para ruta por evento
      mockActivatedRoute.paramMap = of({
        get: (key: string) => {
          if (key === 'idTemporada') return '1';
          if (key === 'idEvento') return '2';
          // No tiene idDia
          return null;
        },
        has: (key: string) => key !== 'idDia' // No tiene parámetro idDia
      });

      mockDiaService.listarPorEvento.and.returnValue(of([{ id: 1, nombre: 'Día 1' } as Dia]));

      fixture = TestBed.createComponent(AgregarLocalidadComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.esRutaPorEvento).toBeTrue();
      expect(component.diaId).toBeNull();
    }));

    it('debería inicializarse correctamente por ruta de día y cargar día automáticamente', fakeAsync(() => {
      // Configuración para ruta por día
      mockActivatedRoute.paramMap = of({
        get: (key: string) => {
          if (key === 'idTemporada') return '1';
          if (key === 'idEvento') return '2';
          if (key === 'idDia') return '3';
          return null;
        },
        has: (key: string) => key === 'idDia' // Tiene parámetro idDia
      });

      const mockDia: Dia = { id: 3, nombre: 'Día Automático' } as Dia;
      mockDiaService.getPorId.and.returnValue(of(mockDia));
      mockDiaService.listarPorEvento.and.returnValue(of([mockDia]));

      fixture = TestBed.createComponent(AgregarLocalidadComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.esRutaPorEvento).toBeFalse();
      expect(component.diaId).toBe(3);
      expect(mockDiaService.getPorId).toHaveBeenCalledWith(3);
      expect(component.diasLocalidad.length).toBe(1);
      expect(component.diasLocalidad[0]).toEqual(mockDia);
    }));
  });

  describe('Manejo de errores', () => {
    it('debería manejar errores al cargar días', fakeAsync(() => {
      mockDiaService.listarPorEvento.and.returnValue(throwError(() => new Error('Error al cargar días')));

      spyOn(component, 'openMensaje');
      spyOn(console, 'error');

      component.cargarDias();
      tick();

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
      expect(component.openMensaje).toHaveBeenCalledWith('Error al cargar los dias');
      expect(mockRouter.navigate).toHaveBeenCalled();
    }));

    it('debería manejar errores al cargar localidad en modo edición', fakeAsync(() => {
      // Configuración para modo edición
      mockActivatedRoute.paramMap = of({
        get: (key: string) => {
          if (key === 'id') return '1'; // ID de la localidad a editar
          if (key === 'idTemporada') return '1';
          if (key === 'idEvento') return '2';
          if (key === 'idDia') return '3';
          return null;
        },
        has: (key: string) => true
      });

      // Configura los mocks antes de crear el componente
      mockLocalidadService.getPorId.and.returnValue(throwError(() => new Error('Error al cargar localidad')));
      mockDiaService.listarPorEvento.and.returnValue(of([]));

      // Crea el componente primero
      fixture = TestBed.createComponent(AgregarLocalidadComponent);
      component = fixture.componentInstance;

      // Ahora espía los métodos del componente instanciado
      const openMensajeSpy = spyOn(component, 'openMensaje');
      const consoleErrorSpy = spyOn(console, 'error');

      fixture.detectChanges(); // Esto disparará ngOnInit()
      tick();

      // Verificaciones
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(openMensajeSpy).toHaveBeenCalledWith('Error al cargar la localidad');
      expect(mockRouter.navigate).toHaveBeenCalled();
    }));

  });
});