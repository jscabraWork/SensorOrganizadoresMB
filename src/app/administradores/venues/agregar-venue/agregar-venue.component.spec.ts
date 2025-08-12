import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AgregarVenueComponent } from './agregar-venue.component';
import { VenueDataService } from '../../../service/data/venue-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Venue } from '../../../models/venue.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('AgregarVenueComponent', () => {
  let component: AgregarVenueComponent;
  let fixture: ComponentFixture<AgregarVenueComponent>;
  let mockVenueService: jasmine.SpyObj<VenueDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockVenueService = jasmine.createSpyObj('VenueDataService', ['crearVenue', 'editarVenue', 'getPorId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => {
          if (key === 'nombre') return 'test-admin';
          if (key === 'id') return null;
          if (key === 'idCiudad') return '1';
          return null;
        }
      }),
      parent: {
        paramMap: of({
          get: (key: string) => key === 'nombre' ? 'test-admin' : null
        })
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        AgregarVenueComponent,
        HttpClientTestingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: VenueDataService, useValue: mockVenueService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarVenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('crearVenue', () => {
    it('debe crear el venue exitosamente', fakeAsync(() => {
      // Configurar el formulario como válido
      spyOn(component, 'isFormValid').and.returnValue(true);
      component.venue = {id:1, nombre: 'New Venue', urlMapa: 'https://maps.google.com',eventos:[],ciudad:null };
      component.formEnviado = true;

      const mockResponse: Venue = { id: 1, nombre: 'New Venue', urlMapa: 'https://maps.google.com',eventos:[],ciudad:null};
      mockVenueService.crearVenue.and.returnValue(of(mockResponse));

      component.crearVenue();
      tick();

      expect(component.loading).toBeFalse();
      expect(mockVenueService.crearVenue).toHaveBeenCalledWith(
        jasmine.objectContaining({ nombre: 'New Venue', urlMapa: 'https://maps.google.com' }),
        1
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith( ['/administradores/admin', 'test-admin', 'ciudad', 1, 'venues']);
    }));

    it('no permite enviar el form si todos los campos no estan llenos', fakeAsync(() => {
      spyOn(component, 'isFormValid').and.returnValue(false);
      component.venue = { id:5, nombre: 'New Venue', urlMapa: 'invalid-url',eventos:[],ciudad:null };
      component.formEnviado = true;

      component.crearVenue();
      tick();

      expect(component.loading).toBeFalse();
      expect(mockVenueService.crearVenue).not.toHaveBeenCalled();
    }));

    it('meustra un mensaje con el error cuando cree un venue con un nombre ya existente', fakeAsync(() => {
      spyOn(component, 'isFormValid').and.returnValue(true);
      component.venue = {id:5,  nombre: 'Existing Venue', urlMapa: 'https://maps.google.com',eventos:[],ciudad:null };
      component.formEnviado = true;

      const errorResponse = { status: 400 };
      mockVenueService.crearVenue.and.returnValue(throwError(() => errorResponse));

      component.crearVenue();
      tick();

      expect(component.loading).toBeFalse();
      expect(mockDialog.open).toHaveBeenCalled();
    }));


  });

  describe('actualizarVenue', () => {
    beforeEach(() => {
      component.modoEdicion = true;
      component.venue = { id: 5, nombre: 'Updated Venue', urlMapa: 'https://maps.google.com',eventos:[],ciudad:null };
    });

    it('debe actualizar el venue exitosamente', fakeAsync(() => {
      const mockResponse: Venue = { id: 5, nombre: 'Updated Venue', urlMapa: 'https://maps.google.com',eventos:[],ciudad:null};
      mockVenueService.editarVenue.and.returnValue(of(mockResponse));

      component.actualizarVenue();
      tick();

      expect(component.loading).toBeFalse();
      expect(mockVenueService.editarVenue).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: 5, nombre: 'Updated Venue', urlMapa: 'https://maps.google.com' }),
        1
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith( ['/administradores/admin', 'test-admin', 'ciudad', 1, 'venues']);
    }));

    it('muestra un mensaje de error cuando hay problema para actualizar un venue', fakeAsync(() => {
      const errorResponse = { status: 500 };
      mockVenueService.editarVenue.and.returnValue(throwError(() => errorResponse));

      spyOn(window, 'alert')

      component.actualizarVenue();
      tick();

      expect(component.loading).toBeFalse();
      expect(window.alert).toHaveBeenCalledWith('Error al actualizar el venue');
    }));
  });

  describe('cargarVenue', () => {
    it('debe cargar todos los datos del venue por id ', fakeAsync(() => {
      const mockVenue: Venue = { id: 5, nombre: 'Test Venue', urlMapa: 'https://maps.google.com',eventos:[],ciudad:null};
      mockVenueService.getPorId.and.returnValue(of(mockVenue));

      component.cargarVenue(5);
      tick();

      expect(component.loading).toBeFalse();
      expect(component.venue).toEqual(mockVenue);
    }));

    it('muestra un mensaje con un error si hay algun problema cuando trae los datos del venue por id', fakeAsync(() => {
      const errorResponse = { status: 404 };
      mockVenueService.getPorId.and.returnValue(throwError(() => errorResponse));

      component.cargarVenue(5);
      tick();

      expect(component.loading).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith( ['/administradores/admin', 'test-admin', 'ciudad', 1, 'venues']);
    }));
  });
});
