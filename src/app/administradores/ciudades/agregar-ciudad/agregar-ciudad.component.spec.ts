import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarCiudadComponent } from "./agregar-ciudad.component";
import { CiudadDataService } from '../../../service/data/ciudad-data.service';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Ciudad } from '../../../models/ciudad.model';

const mockCiudad = {
  id: 1,
  nombre: 'Bogotá',
  venues: [
    {
      id: 1,
      nombre: 'Venue 1',
      urlMapa: 'https://maps.example.com/venue1',
      eventos: []
    },
    {
      id: 2,
      nombre: 'Venue 2',
      urlMapa: 'https://maps.example.com/venue2',
      eventos: []
    }
  ]
};

const mockCiudadService = {
  getPorId: jasmine.createSpy('getPorId').and.returnValue(of(mockCiudad)),
  editarCiudad: jasmine.createSpy('editarCiudad').and.returnValue(of({})),
  crearCiudad: jasmine.createSpy('crearCiudad').and.returnValue(of({}))
};

const mockRouter = { navigate: jasmine.createSpy('navigate') };

const mockActivatedRoute = {
  paramMap: of(new Map([['id', '1']])),
  parent: {
    paramMap: of(new Map([['nombre', 'adminName']]))
  }
};

const mockDialog = {
  open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
};


describe('AgregarCiudadComponent', () => {
  let component: AgregarCiudadComponent;
  let fixture: ComponentFixture<AgregarCiudadComponent>;


  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AgregarCiudadComponent],
      providers: [
        { provide: CiudadDataService, useValue: mockCiudadService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog  },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarCiudadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe inicializar el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar una ciudad existente correctamente', () => {
    mockCiudadService.getPorId.and.returnValue(of(mockCiudad));

    component.cargarCiudad(1);

    expect(mockCiudadService.getPorId).toHaveBeenCalledWith(1);

    expect(component.ciudad.id).toEqual(mockCiudad.id);
    expect(component.ciudad.nombre).toEqual(mockCiudad.nombre);
    expect(component.ciudad.venues.length).toEqual(mockCiudad.venues.length);
  });

  it('muestra un mensaje de error si hay un problema al cargar ciudad', () => {
    mockCiudadService.getPorId.and.returnValue(throwError(() => new Error('Error')));
    spyOn(console, 'error');

    component.ciudadId = 1;
    component.cargarCiudad(1);

    expect(console.error).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/administradores/admin', 'adminName', 'ciudades']);
  });

  it('debe retornar true cuando el nombre es válido', () => {
    component.ciudad.nombre = 'Bogotá';
    expect(component.isFormValid()).toBeTrue();
  });

  it('debe retornar false cuando el nombre es vacío', () => {
    component.ciudad.nombre = '';
    expect(component.isFormValid()).toBeFalse();
  });

  it('debe retornar false cuando el nombre es undefined', () => {
    component.ciudad.nombre = undefined;
    expect(component.isFormValid()).toBeFalse();
  });

  it('debe llamar a actualizarCiudad en modo edición', () => {
    component.modoEdicion = true;
    component.ciudad.nombre = 'Bogotá';
    spyOn(component, 'actualizarCiudad');

    component.crearCiudad();

    expect(component.actualizarCiudad).toHaveBeenCalled();
  });

  it('debe llamar a crearNuevaCiudad cuando no está en modo edición', () => {
    component.modoEdicion = false;
    component.ciudad.nombre = 'Bogotá';
    spyOn(component, 'crearNuevaCiudad');

    component.crearCiudad();

    expect(component.crearNuevaCiudad).toHaveBeenCalled();
  });

  it('si el formulario no es valido, no permite enviarlo', () => {
    component.ciudad.nombre = '';
    spyOn(component, 'actualizarCiudad');
    spyOn(component, 'crearNuevaCiudad');

    component.crearCiudad();

    expect(component.actualizarCiudad).not.toHaveBeenCalled();
    expect(component.crearNuevaCiudad).not.toHaveBeenCalled();
  });

  it('debe crear ciudad exitosamente', () => {
    component.ciudad.nombre = 'Nueva';
    component.nombre = 'adminName';
    mockCiudadService.crearCiudad.and.returnValue(of({}));

    component.crearNuevaCiudad();

    expect(mockCiudadService.crearCiudad).toHaveBeenCalledWith(component.ciudad);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/administradores/admin', 'adminName', 'ciudades']);
  });

  it('muestra un mensaje de error si la ciudad ya existe', () => {
    const error = { status: 400 };
    mockCiudadService.crearCiudad.and.returnValue(throwError(() => error));

    spyOn(component, 'openMensaje');

    component.crearNuevaCiudad();

    expect(component.openMensaje).toHaveBeenCalledWith('Ya existe una ciudad con ese nombre');
  });

  it('muestra un mensaje de error si no se puede crear una ciudad', () => {
    const error = { status: 500 };
    mockCiudadService.crearCiudad.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.crearNuevaCiudad();

    expect(console.error).toHaveBeenCalled();
  });

  it('debe actualizar ciudad exitosamente', () => {
    component.ciudad = { id: 1, nombre: 'Bogotá', venues:[] };
    component.nombre = 'adminName';
    mockCiudadService.editarCiudad.and.returnValue(of({}));

    component.actualizarCiudad();

    expect(mockCiudadService.editarCiudad).toHaveBeenCalledWith(component.ciudad);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/administradores/admin', 'adminName', 'ciudades']);
  });

  it('muestra un mensaje de error si hay un problema al actualizar la ciudad', () => {
    const error = { status: 500 };
    mockCiudadService.editarCiudad.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.actualizarCiudad();

    expect(console.error).toHaveBeenCalled();
  });


});
