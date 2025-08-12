import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TemporadaDataService } from '../../../service/data/temporada-data.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TemporadasActivasInactivasComponent } from './temporadas-activas-inactivas.component';

describe('TemporadasActivasComponent', () => {
  let component: TemporadasActivasInactivasComponent;
  let fixture: ComponentFixture<TemporadasActivasInactivasComponent>;

  const mockTemporadaService = {
    listarPorEstado: jasmine.createSpy('listarPorEstado').and.returnValue(of([])),
    editarEstadoDeTemporada: jasmine.createSpy('editarEstadoDeTemporada').and.returnValue(of({ id: 1, estado: 0 })),
    getPorId: jasmine.createSpy('getPorId').and.returnValue(of({ eventos: [] })),
    delete: jasmine.createSpy('delete').and.returnValue(of(null)),
    borrarTemporada: jasmine.createSpy('borrarTemporada').and.returnValue(of(null))
  };

  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  mockRouter.url = '/administradores/admin/admin123/temporadas/activas';
  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true))
  };
  mockDialog.open.and.returnValue(mockDialogRef);

  const mockActivatedRoute = {
    snapshot: {
      params: {
        nombre: 'admin123'
      }
    },
    parent: {
      parent: {
        paramMap: of({ get: (key) => key === 'nombre' ? 'admin123' : null })
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemporadasActivasInactivasComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: TemporadaDataService, useValue: mockTemporadaService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TemporadasActivasInactivasComponent);
    component = fixture.componentInstance;
    component.nombre = 'admin123'; 
    
    
    spyOn(component, 'openMensaje').and.returnValue(of(true));
    
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar temporadas activas (estado 0)', () => {
    const mockTemporadas = [{ id: 1, estado: 0 }] as any;
    mockTemporadaService.listarPorEstado.and.returnValue(of(mockTemporadas));
  
    // Simulamos que estamos en la ruta activa
    component.esRutaActivos = true;
  
    component.cargarTemporadas();
  
    expect(mockTemporadaService.listarPorEstado).toHaveBeenCalledWith(0); // Estado activo
    expect(component.temporadas).toEqual(mockTemporadas);
    expect(component.cargando).toBeFalse();
  });

  it('debe cargar temporadas inactivas (estado 1)', () => {
    const mockTemporadas = [{ id: 1, estado: 1 }] as any;
    mockTemporadaService.listarPorEstado.and.returnValue(of(mockTemporadas));
  
    // Simulamos que estamos en la ruta inactiva
    component.esRutaActivos = false;
  
    component.cargarTemporadas();
  
    expect(mockTemporadaService.listarPorEstado).toHaveBeenCalledWith(1); // Estado inactivo
    expect(component.temporadas).toEqual(mockTemporadas);
    expect(component.cargando).toBeFalse();
  });
  

  it('debe manejar error al cargar temporadas', () => {
    mockTemporadaService.listarPorEstado.and.returnValue(throwError(() => new Error('Error')));
  
    component.cargarTemporadas();
  
    expect(mockTemporadaService.listarPorEstado).toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  });
  
  it('debe navegar al formulario de edición de temporada', () => {
    const temporadaMock = { id: 1 } as any;
    component.nombre = 'admin123';
  
    component.editarTemporada(temporadaMock);
  
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/administradores/admin', 'admin123', 'temporadas', 'editar', 1]
    );
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
  
  it('debe cambiar el estado de una temporada exitosamente', fakeAsync(() => {
    const temp = { id: 1, estado: 1 } as any;
    const updated = { id: 1, estado: 0 } as any;
    component.temporadas = [temp];
  
    mockTemporadaService.editarEstadoDeTemporada.and.returnValue(of(updated));
  
    component.cambiarEstado(temp);
    tick(); 
  
    expect(mockTemporadaService.editarEstadoDeTemporada).toHaveBeenCalled();
    expect(component.openMensaje).toHaveBeenCalledWith('Temporada inactivada correctamente');
  }));
  
  it('debe manejar error al cambiar estado de temporada', fakeAsync(() => {
    const temp = { id: 1, estado: 1 } as any;
    component.temporadas = [temp];
  
    mockTemporadaService.editarEstadoDeTemporada.and.returnValue(throwError(() => new Error('Error')));
  
    component.cambiarEstado(temp);
    tick();
  
    expect(temp.estado).toBe(0); // estado revertido
    expect(component.openMensaje).toHaveBeenCalledWith('No se pudo cambiar el estado');
  }));

  it('no debe eliminar si la temporada tiene eventos', fakeAsync(() => {
    mockTemporadaService.getPorId.calls.reset();
    mockTemporadaService.delete.calls.reset();
    (component.openMensaje as jasmine.Spy).calls.reset();
    
    (component.openMensaje as jasmine.Spy).and.returnValues(
      of(true),  
      of(undefined) 
    );
  
    const temporadaConEventos = { eventos: [{}, {}] };
    mockTemporadaService.getPorId.and.returnValue(of(temporadaConEventos));
  
    component.eliminarTemporada(1);
    
    tick();
    flush();
  
    expect(mockTemporadaService.getPorId).toHaveBeenCalledWith(1);
    expect(component.openMensaje).toHaveBeenCalledWith("¿Desea borrar la temporada?", true);
    expect(component.openMensaje).toHaveBeenCalledWith("No se puede eliminar la temporada porque tiene eventos asociados");
    expect(mockTemporadaService.delete).not.toHaveBeenCalled();
}));
  
  it('debe eliminar temporada sin eventos asociados', fakeAsync(() => {
    (component.openMensaje as jasmine.Spy).and.returnValue(of(true));
    
    mockTemporadaService.getPorId.and.returnValue(of({ eventos: [] }));
    mockTemporadaService.borrarTemporada.and.returnValue(of(null));
    
    // Espiar el método refrescar
    spyOn(component, 'refrescar');
  
    component.eliminarTemporada(1);
    tick(); 

    expect(component.openMensaje).toHaveBeenCalledWith("¿Desea borrar la temporada?", true);
    
    expect(mockTemporadaService.getPorId).toHaveBeenCalledWith(1);
    
    expect(mockTemporadaService.borrarTemporada).toHaveBeenCalledWith(1);
    
    expect(component.openMensaje).toHaveBeenCalledWith("Se borró exitosamente la temporada");
    
    expect(component.refrescar).toHaveBeenCalled();
  }));
  
  it('debe manejar error al obtener temporada para eliminar', fakeAsync(() => {
    (component.openMensaje as jasmine.Spy).and.returnValue(of(true));
    mockTemporadaService.getPorId.and.returnValue(throwError(() => new Error('Error')));
  
    component.eliminarTemporada(1);
    tick(); 
  
    expect(component.openMensaje).toHaveBeenCalledWith("No se pudo obtener la información de la temporada.");
    expect(mockTemporadaService.delete).not.toHaveBeenCalled();
  }));

  it('debe formatear la fecha correctamente', () => {
    const date = '2023-01-01';
    const formatted = component.formatearFecha(date);
    expect(formatted).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/); // formato español
  });
  
  it('debe navegar al listado de eventos', () => {
    component.nombre = 'admin123';
    component.irAEventos(5);
  
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/administradores','admin','admin123','temporada',5,'eventos'
    ]);
  });
  
  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
    jasmine.getEnv().allowRespy(true);
  });
});