import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AgregarDiaComponent } from './agregar-dia.component';
import { DiaDataService } from '../../../../service/data/dia-data.service';
import { EventoDataService } from '../../../../service/data/evento-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Dia } from '../../../../models/dia.model';
import { Evento } from '../../../../models/evento.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('AgregarDiaComponent', () => {
  let component: AgregarDiaComponent;
  let fixture: ComponentFixture<AgregarDiaComponent>;
  let mockDiaService: jasmine.SpyObj<DiaDataService>;
  let mockEventoService: jasmine.SpyObj<EventoDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockDiaService = jasmine.createSpyObj('DiaDataService', ['crear', 'editarDia', 'getPorId']);
    mockEventoService = jasmine.createSpyObj('EventoDataService', ['getPorId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      paramMap: of({ get: (key: string) => null }), // Valor por defecto para modo creación
      parent: { 
        paramMap: of({ 
          get: (key: string) => 'testAdmin' // Valor por defecto para adminId
        }) 
      }
    };
    sessionStorage.setItem('administrador', 'testAdmin');

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        AgregarDiaComponent
      ],
      providers: [
        { provide: DiaDataService, useValue: mockDiaService },
        { provide: EventoDataService, useValue: mockEventoService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarDiaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Modo creación', () => {
    beforeEach(() => {
      // Configuración para modo creación
      mockActivatedRoute.paramMap = of({
        get: (key: string) => {
          if (key === 'idEvento') return '1';
          if (key === 'idTemporada') return '2';
          return null;
        }
      });
      
      mockEventoService.getPorId.and.returnValue(of(new Evento()));
      fixture.detectChanges();
    });

    it('debería inicializar en modo creación', () => {
      expect(component.modoEdicion).toBeFalse();
      expect(component.dia).toEqual(new Dia());
    });

    it('debería cargar el evento asociado', () => {
      expect(mockEventoService.getPorId).toHaveBeenCalledWith(1);
      expect(component.evento).toBeDefined();
    });

    it('debería validar formulario correctamente', () => {
      // Formulario vacío no es válido
      expect(component.isFormValid()).toBeFalse();
      
      // Rellenar datos válidos
      component.dia.nombre = 'Día prueba';
      component.dia.fechaInicio = new Date('2023-01-01');
      component.dia.fechaFin = new Date('2023-01-02');
      component.dia.horaInicio = '10:00 AM';
      component.dia.horaFin = '12:00 PM';
      
      expect(component.isFormValid()).toBeTrue();
    });

    it('debería crear nuevo día cuando el formulario es válido', fakeAsync(() => {
      const nuevoDia = new Dia();
      nuevoDia.nombre = 'Nuevo día';
      nuevoDia.fechaInicio = new Date('2023-01-01');
      nuevoDia.fechaFin = new Date('2023-01-02');
      nuevoDia.horaInicio = '10:00 AM';
      nuevoDia.horaFin = '12:00 PM';
      
      component.dia = nuevoDia;
      mockDiaService.crear.and.returnValue(of({}));
      
      component.crearDia();
      tick();
      
      expect(mockDiaService.crear).toHaveBeenCalledWith(nuevoDia);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/administradores/admin', 'testAdmin', 'temporada', 2, 'evento', 1, 'dias', 'inactivos'
      ]);
    }));

    it('debería detectar fecha inválida (fecha inicio > fecha fin)', () => {
      mockActivatedRoute.parent = {
        paramMap: of({ get: (key: string) => key === 'nombre' ? 'testAdmin' : null })
      };
    
      component.dia.nombre = 'Día prueba';
      component.dia.fechaInicio = new Date('2023-01-02');
      component.dia.fechaFin = new Date('2023-01-01');
      component.dia.horaInicio = '10:00 AM';
      component.dia.horaFin = '12:00 PM';
      
      component.crearDia();
      
      expect(component.fechaError).toBeTrue();
      expect(mockDiaService.crear).not.toHaveBeenCalled();
    });
  });

  describe('Modo edición', () => {
    const diaExistente = new Dia();
    diaExistente.id = 1;
    diaExistente.nombre = 'Día existente';
    diaExistente.fechaInicio = new Date('2023-01-01');
    diaExistente.fechaFin = new Date('2023-01-02');
    diaExistente.horaInicio = '09:00 AM';
    diaExistente.horaFin = '11:00 AM';

    beforeEach(fakeAsync(() => {
      // Configuración para modo edición
      mockActivatedRoute.paramMap = of({
        get: (key: string) => {
          if (key === 'id') return '1'; // ID del día a editar
          if (key === 'idEvento') return '1';
          if (key === 'idTemporada') return '2';
          return null;
        }
      });
      
      mockDiaService.getPorId.and.returnValue(of(diaExistente));
      mockEventoService.getPorId.and.returnValue(of(new Evento()));
      
      fixture = TestBed.createComponent(AgregarDiaComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick(); // Para manejar las llamadas asíncronas
    }));

    it('debería inicializar en modo edición', () => {
      expect(component.modoEdicion).toBeTrue();
      expect(component.diaId).toBe(1);
    });

    it('debería cargar el día existente', () => {
      expect(mockDiaService.getPorId).toHaveBeenCalledWith(1);
      expect(component.dia).toEqual(diaExistente);
    });

    it('debería actualizar el día existente', fakeAsync(() => {
      const diaEditado = {...diaExistente};
      diaEditado.nombre = 'Día modificado';
      
      component.dia = diaEditado;
      // Devuelve un objeto que cumpla con la interfaz Dia
      mockDiaService.editarDia.and.returnValue(of(diaEditado));
      
      component.crearDia();
      tick();
      
      expect(mockDiaService.editarDia).toHaveBeenCalledWith(diaEditado);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/administradores/admin', 'testAdmin', 'temporada', 2, 'evento', 1, 'dias'
      ]);
    }));

    it('debería manejar error al actualizar', fakeAsync(() => {
      const diaEditado = {...diaExistente};
      component.dia = diaEditado;
      mockDiaService.editarDia.and.returnValue(throwError(() => new Error('Error')));
      
      component.crearDia();
      tick();
      
      expect(mockDiaService.editarDia).toHaveBeenCalled();
    }));
  });
});