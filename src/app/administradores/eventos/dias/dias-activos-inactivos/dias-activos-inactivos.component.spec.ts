import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { DiasActivosInactivosComponent } from './dias-activos-inactivos.component';
import { Dia } from '../../../../models/dia.model';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DiaDataService } from '../../../../service/data/dia-data.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DiasActivosComponent', () => {
  let component: DiasActivosInactivosComponent;
  let fixture: ComponentFixture<DiasActivosInactivosComponent>;

  const mockDiaService = {
    listarPorEstado: jasmine.createSpy('listarPorEstado').and.returnValue(of([])),
    editarEstadoDeDia: jasmine.createSpy('editarEstadoDeDia').and.returnValue(of({ id: 1, estado: 0 })),
    getPorId: jasmine.createSpy('getPorId').and.returnValue(of({ localidades: [] })),
    borrarDia: jasmine.createSpy('borrarDia').and.returnValue(of(null))
  };

  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  
  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true))
  };
  mockDialog.open.and.returnValue(mockDialogRef);

  const mockActivatedRoute = {
    parent: {
      parent: {
        paramMap: of({ get: (key) => key === 'nombre' ? 'admin123' : null })
      },
      paramMap: of({ 
        get: (key) => {
          if (key === 'idTemporada') return '1';
          if (key === 'idEvento') return '2';
          return null;
        }
      })
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiasActivosInactivosComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: DiaDataService, useValue: mockDiaService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DiasActivosInactivosComponent);
    component = fixture.componentInstance;
    
    // Espiamos openMensaje para no depender del diálogo real
    spyOn(component, 'openMensaje').and.returnValue(of(true));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar días con estado 0 (activos)', () => {
    const mockDias = [{ id: 1, estado: 0 }] as Dia[];
    const mockEventoId = 2;
    const mockEstado = 0;
  
    component.idEvento = mockEventoId;
    component.esRutaActivos = true; // Ruta activos → estado = 0
  
    mockDiaService.listarPorEstado.and.returnValue(of(mockDias));
  
    component.cargarDias();
  
    expect(mockDiaService.listarPorEstado).toHaveBeenCalledWith(mockEventoId, mockEstado);
    expect(component.dias).toEqual(mockDias);
    expect(component.cargando).toBeFalse();
  });

  it('debe cargar días con estado 1 (inactivos)', () => {
    const mockDias = [{ id: 2, estado: 1 }] as Dia[];
    const mockEventoId = 3;
    const mockEstado = 1;
  
    component.idEvento = mockEventoId;
    component.esRutaActivos = false; // Ruta inactivos → estado = 1
  
    mockDiaService.listarPorEstado.and.returnValue(of(mockDias));
  
    component.cargarDias();
  
    expect(mockDiaService.listarPorEstado).toHaveBeenCalledWith(mockEventoId, mockEstado);
    expect(component.dias).toEqual(mockDias);
    expect(component.cargando).toBeFalse();
  });
  


  it('debe manejar error al cargar días', () => {
    mockDiaService.listarPorEstado.and.returnValue(throwError(() => new Error('Error')));
  
    component.cargarDias();
  
    expect(mockDiaService.listarPorEstado).toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  });

  it('debe cambiar el estado de un día exitosamente', fakeAsync(() => {
    const dia = { id: 1, estado: 1 } as Dia;
    const updated = { id: 1, estado: 0 } as Dia;
    component.dias = [dia];
  
    spyOn(component, 'cargarDias');
  
    mockDiaService.editarEstadoDeDia.and.returnValue(of(updated));
  
    component.cambiarEstado(dia);
    tick();
  
    expect(mockDiaService.editarEstadoDeDia).toHaveBeenCalledWith(dia);
    expect(component.openMensaje).toHaveBeenCalledWith('Estado de dia cambiado correctamente');
    expect(component.dias[0].estado).toBe(0); 
  }));
  
  

  it('debe manejar error al cambiar estado de día', fakeAsync(() => {
    const dia = { id: 1, estado: 1 } as Dia;
    component.dias = [dia];
  
    mockDiaService.editarEstadoDeDia.and.returnValue(throwError(() => new Error('Error')));
  
    component.cambiarEstado(dia);
    tick();
  
    expect(dia.estado).toBe(0); // estado revertido
    expect(component.openMensaje).toHaveBeenCalledWith('No se pudo cambiar el estado');
  }));

  it('no debe eliminar si el día tiene localidades', fakeAsync(() => {
    mockDiaService.getPorId.calls.reset();
    mockDiaService.borrarDia.calls.reset();
    (component.openMensaje as jasmine.Spy).calls.reset();
  
    const diaConLocalidades = { localidades: [{}, {}] } as Dia;
  
    // Simular confirmación de borrado (true), y luego mensaje informativo (lo que sea)
    (component.openMensaje as jasmine.Spy).and.returnValues(
      of(true),             // Confirmación del borrado
      of(undefined)         // Segundo mensaje, no importa el valor
    );
  
    mockDiaService.getPorId.and.returnValue(of(diaConLocalidades));
  
    component.eliminarDia(1);
    tick(); // ejecuta la suscripción al primer openMensaje
    tick(); // ejecuta la suscripción a getPorId
    tick(); // ejecuta la suscripción al segundo openMensaje
    flush();
  
    expect(mockDiaService.getPorId).toHaveBeenCalledWith(1);
    expect(component.openMensaje).toHaveBeenCalledWith("¿Desea borrar el dia?", true);
    expect(component.openMensaje).toHaveBeenCalledWith("No se puede eliminar el dia porque tiene localidades asociadas");
    expect(mockDiaService.borrarDia).not.toHaveBeenCalled();
  }));
  

  it('debe eliminar día sin localidades asociadas', fakeAsync(() => {
    (component.openMensaje as jasmine.Spy).and.returnValue(of(true));
    
    mockDiaService.getPorId.and.returnValue(of({ localidades: [] } as Dia));
    mockDiaService.borrarDia.and.returnValue(of(null));
    
    spyOn(component, 'refrescar');
  
    component.eliminarDia(1);
    tick();

    expect(component.openMensaje).toHaveBeenCalledWith("¿Desea borrar el dia?", true);
    expect(mockDiaService.getPorId).toHaveBeenCalledWith(1);
    expect(mockDiaService.borrarDia).toHaveBeenCalledWith(1);
    expect(component.openMensaje).toHaveBeenCalledWith("Se borró exitosamente el dia");
    expect(component.refrescar).toHaveBeenCalled();
  }));

  it('debe manejar error al obtener día para eliminar', fakeAsync(() => {
    (component.openMensaje as jasmine.Spy).calls.reset();
    mockDiaService.borrarDia.calls.reset();
  
    (component.openMensaje as jasmine.Spy).and.returnValue(of(true));
    mockDiaService.getPorId.and.returnValue(throwError(() => new Error('Error')));
  
    component.eliminarDia(1);
    tick(); // openMensaje + getPorId
    tick(); // openMensaje del bloque error
    flush();
  
    expect(component.openMensaje).toHaveBeenCalledWith("No se pudo obtener la información del dia");
    expect(mockDiaService.borrarDia).not.toHaveBeenCalled();
  }));
  

  it('debe navegar al formulario de edición de día', () => {
    component.nombre = 'admin123';
    component.idTemporada = 1;
    component.idEvento = 2;
    const dia = { id: 5 } as Dia;
  
    component.editarDia(dia);
  
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/administradores/admin', 'admin123', 'temporada', 1, 'evento', 2, 'dias', 'editar', 5
    ]);
  });

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

  it('debe formatear la fecha correctamente', () => {
    const date = '2023-01-01';
    const formatted = component.formatearFecha(date);
    expect(formatted).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/); // formato español
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });
});
