import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioDataService } from '../../../service/data/usuario-data.service';
import { RoleDataService } from '../../../service/data/role-data.service';
import { TipoDocumentoDataService } from '../../../service/data/tipo-documento-data.service';
import { StorageService } from '../../../service/data/storage.service';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AgregarModificarUsuarioComponent } from './agregar-modificar-usuario.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('AgregarModificarUsuarioComponent', () => {
  let component: AgregarModificarUsuarioComponent;
  let fixture: ComponentFixture<AgregarModificarUsuarioComponent>;

  // Mocks
  let mockUsuarioService: jasmine.SpyObj<UsuarioDataService>;
  let mockRoleService: jasmine.SpyObj<RoleDataService>;
  let mockTipoDocumentoService: jasmine.SpyObj<TipoDocumentoDataService>;
  let mockStorageService: jasmine.SpyObj<StorageService>;
  let mockAutenticado: jasmine.SpyObj<HardcodedAutheticationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockUsuarioService = jasmine.createSpyObj('UsuarioDataService', ['getClientePorId', 'crearUsuarioConRoles', 'actualizarUsuarioConRoles']);
    mockRoleService = jasmine.createSpyObj('RoleDataService', ['listar']);
    mockTipoDocumentoService = jasmine.createSpyObj('TipoDocumentoDataService', ['listar']);
    mockStorageService = jasmine.createSpyObj('StorageService', ['guardarDatosUsuario']);
    mockAutenticado = jasmine.createSpyObj('HardcodedAutheticationService', ['getAdmin']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [AgregarModificarUsuarioComponent],
      providers: [
        { provide: UsuarioDataService, useValue: mockUsuarioService },
        { provide: RoleDataService, useValue: mockRoleService },
        { provide: TipoDocumentoDataService, useValue: mockTipoDocumentoService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: HardcodedAutheticationService, useValue: mockAutenticado },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute, useValue: {
            paramMap: of({ get: (key: string) => null })
          }
        },
        { provide: MatDialog, useValue: mockDialog }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] 
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarModificarUsuarioComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

    it('debe agregar un rol correctamente si no está repetido', () => {
    const rol = { id: 1, nombre: 'ADMIN' };
    component.rolAgregar = rol;
    component.rolesUsuario = [];

    component.agregarRol();

    expect(component.rolesUsuario.length).toBe(1);
    expect(component.rolRepetido).toBeFalse();
    expect(component.rolAgregar).toBeNull();
  });

    it('debe marcar rol como repetido si ya existe', () => {
    const rol = { id: 1, nombre: 'ADMIN' };
    component.rolAgregar = rol;
    component.rolesUsuario = [rol];
    spyOn(component, 'openMensaje');

    component.agregarRol();

    expect(component.rolesUsuario.length).toBe(1);
    expect(component.rolRepetido).toBeTrue();
    expect(component.openMensaje).toHaveBeenCalledWith('El usuario ya tiene este rol asignado');
  });

    it('debe quitar un rol por índice', () => {
    component.rolesUsuario = [{ id: 1, nombre: 'ADMIN' }, { id: 2, nombre: 'USER' }];
    component.quitarRol(0);
    expect(component.rolesUsuario.length).toBe(1);
    expect(component.rolesUsuario[0].id).toBe(2);
  });

    it('debe impedir rol ADMIN y ORGANIZADOR juntos', () => {
    component.rolesUsuario = [
      { id: 1, nombre: 'ADMIN' },
      { id: 2, nombre: 'ORGANIZADOR' }
    ];
    spyOn(component, 'openMensaje');
    const result = component['validarRolesIncompatibles']();
    expect(result).toBeFalse();
    expect(component.openMensaje).toHaveBeenCalled();
  });

  it('debe permitir rol ADMIN sin ORGANIZADOR', () => {
    component.rolesUsuario = [
      { id: 1, nombre: 'ADMIN' }
    ];
    const result = component['validarRolesIncompatibles']();
    expect(result).toBeTrue();
  });

    it('no debe crear usuario si faltan campos obligatorios', () => {
    spyOn(component, 'openMensaje');
    component.usuario = {} as any;
    component.rolesUsuario = [];
    component.crearUsuario();
    expect(component.openMensaje).toHaveBeenCalledWith(
      'Por favor completa todos los campos obligatorios y asigna al menos un rol.'
    );
  });

    it('debe navegar atrás con goBack()', () => {
    component.nombre = 'admin123';
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/administradores/admin', 'admin123', 'usuarios']);
  });

    it('debe guardar estado y navegar al crear tipo documento', () => {
    component.nombre = 'admin123';
    component.crearTipoDocumento();
    expect(mockStorageService.guardarDatosUsuario).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/administradores/admin', 'admin123', 'usuarios', 'agregar', 'tipo'
    ]);
  });


})