import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CiudadesComponent } from './ciudades.component';
import { CiudadDataService } from '../../service/data/ciudad-data.service';
import { Ciudad } from '../../models/ciudad.model';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MensajeComponent } from '../../mensaje/mensaje.component';

describe('CiudadesComponent', () => {
  let component: CiudadesComponent;
  let fixture: ComponentFixture<CiudadesComponent>;
  let mockCiudadService: any;
  let mockRouter: any;
  let mockDialog: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockCiudadService = {
      listarCiudades: () => of([
        { id: 1, nombre: 'Bogotá',temperatura:"10",venues:[] },
        { id: 2, nombre: 'Medellín',temperatura:"10",venues:[]}
      ]),
       // Simula el método getPorId
       getPorId: jasmine.createSpy().and.returnValue(of({ id: 1, nombre: 'Bogotá', temperatura: "10", venues: [] })),
       // Simula el método delete
       delete: jasmine.createSpy().and.returnValue(of(null))
    };

    mockRouter = {
      navigate: jasmine.createSpy()
    };

    // Simula el MatDialog
    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
    };

    mockActivatedRoute = {
      parent: {
        paramMap: of(new Map())
      }
    };

    // 2. Crea el entorno del componente con servicios simulados
    await TestBed.configureTestingModule({
      imports: [CiudadesComponent],
      providers: [
        { provide: CiudadDataService, useValue: mockCiudadService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog  },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CiudadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería cargar ciudades cuando inicia', () => {
    expect(component.ciudades.length).toBe(2);
    expect(component.ciudades[0].nombre).toBe('Bogotá');
    expect(component.cargando).toBeFalse();
  });

  it('cuando hay un error al cargar las ciudades', () => {
    mockCiudadService.listarCiudades = () => {
      return new Observable(observer => {
        observer.error('Error cargando ciudades');
      });
    };
    component.cargarCiudades();
    fixture.detectChanges();
    expect(component.cargando).toBeFalse();
    expect(component.ciudades.length).toBe(0);
  });

  it('debería cambiar el item seleccionado en toggleItem', () => {
    component.toggleItem(1);
    expect(component.selectedItem).toBe(1);

    component.toggleItem(1);
    expect(component.selectedItem).toBeNull();
  });
  it('debería navegar a editar ciudad', () => {
    const ciudad = { id: 1, nombre: 'Bogotá',temperatura:"10",venues:[] };
    component.editarCiudad(ciudad);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/administradores/admin', component.nombre, 'ciudades', 'editar', ciudad.id]);
  });

  it('debería refrescar la lista de ciudades', () => {
    spyOn(component, 'cargarCiudades');
    component.refrescar();
    expect(component.cargarCiudades).toHaveBeenCalled();
  });

  it('debería eliminar la ciudad correctamente si no tiene venues', () => {
    const ciudadId = 1;
    spyOn(window, 'confirm').and.returnValue(true);
    component.eliminarCiudad(ciudadId);
    expect(mockCiudadService.delete).toHaveBeenCalledWith(ciudadId);
    expect(component.cargando).toBeFalse();
  });

  it('debería no eliminar la ciudad si tiene venues', () => {
    const ciudadConVenues = {
      id: 1,
      nombre: 'Bogotá',
      temperatura: "10",
      venues: [{ id: 1, nombre: 'Venue 1' }]
    };
    mockCiudadService.getPorId.and.returnValue(of(ciudadConVenues));

    spyOn(component, 'openMensaje').and.callThrough();

    component.eliminarCiudad(1);

    expect(mockCiudadService.delete).not.toHaveBeenCalled();

    expect(component.openMensaje).toHaveBeenCalledWith(
      "No se puede eliminar la ciudad porque tiene venues asociados"
    );
  });


  it('debería no eliminar la ciudad si el usuario cancela', () => {
    spyOn(component, 'openMensaje').and.returnValue(of(false));

    component.eliminarCiudad(1);
    expect(mockCiudadService.delete).not.toHaveBeenCalled();
    expect(component.openMensaje).toHaveBeenCalledWith('No se realizó el borrado');
  });

  it('debería navegar a la página de agregar ciudad', () => {
    component.navigateToAgregarCiudad();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['../ciudades/agregar'], { relativeTo: mockActivatedRoute});
  });

  it('debería navegar a la página de venues de una ciudad', () => {
    const ciudadId = 1;
    component.irAVenues(ciudadId);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/administradores', 'admin', component.nombre, 'ciudad', ciudadId, 'venues']);
  });

});


