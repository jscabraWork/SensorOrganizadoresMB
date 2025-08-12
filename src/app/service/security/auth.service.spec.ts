import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { API_URL_AUTH } from '../../app.constants';
import { AuthService } from './auth.service';
import { Usuario } from '../usuario.model';
import { Md5 } from 'ts-md5';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerMock: jasmine.SpyObj<Router>;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  // Datos de prueba
  const mockToken = 'mock-token';
  const mockPayload = {
    user_name: 'testuser',
    nombre: 'Test User',
    authorities: ['ROLE_ADMIN'],
    cc: '123456789'
  };
  const mockEncodedPayload = btoa(JSON.stringify(mockPayload));
  const mockAccessToken = `header.${mockEncodedPayload}.signature`;

  beforeEach(() => {
    // Crear mocks para Router y MatDialog
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    dialogMock = jasmine.createSpyObj('MatDialog', ['closeAll']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verificar que no hayan solicitudes HTTP pendientes
    sessionStorage.clear(); // Limpiar sessionStorage después de cada prueba
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

 

  describe('guardarUsuario', () => {
    it('debería guardar el usuario en sessionStorage para un administrador', () => {
      service.guardarUsuario(mockAccessToken);

      expect(service.usuario.usuario).toBe(mockPayload.user_name);
      expect(service.usuario.nombre).toBe(mockPayload.nombre);
      expect(service.usuario.roles).toEqual(mockPayload.authorities);
      expect(service.usuario.tipo).toBe('admin');
      expect(sessionStorage.getItem('administrador')).toBe(mockPayload.user_name);
      expect(dialogMock.closeAll).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['administradores/admin', mockPayload.user_name]);
    });

    it('debería guardar el usuario en sessionStorage para un organizador', () => {
      const organizadorPayload = {
        ...mockPayload,
        authorities: ['ROLE_ORGANIZADOR']
      };
      const organizadorToken = `header.${btoa(JSON.stringify(organizadorPayload))}.signature`;

      service.guardarUsuario(organizadorToken);

      expect(service.usuario.tipo).toBe('organizador');
      expect(sessionStorage.getItem('organizador')).toBe(organizadorPayload.user_name);
      expect(sessionStorage.getItem('cc')).toBe(organizadorPayload.cc);
      expect(sessionStorage.getItem('nombre')).toBe(organizadorPayload.nombre);
    });
  });

  describe('guardarToken', () => {
    it('debería guardar el token en memoria y sessionStorage', () => {
      service.guardarToken(mockAccessToken);
      expect(service.token).toBe(mockAccessToken);
      expect(sessionStorage.getItem('token')).toBe(mockAccessToken);
    });
  });

  describe('obtenerDatosDelToken', () => {
    it('debería decodificar correctamente el payload del token', () => {
      const payload = service.obtenerDatosDelTocken(mockAccessToken);
      expect(payload).toEqual(mockPayload);
    });

    it('debería retornar null para un token inválido', () => {
      const invalidToken = null;
      const result = service.obtenerDatosDelTocken(invalidToken);
      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('debería retornar true cuando hay un token válido', () => {
      service.guardarToken(mockAccessToken);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('debería retornar false cuando no hay token', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('hasRole', () => {
    beforeEach(() => {
      service.guardarUsuario(mockAccessToken);
    });

    it('debería retornar true si el usuario tiene el rol', () => {
      expect(service.hasRole('ROLE_ADMIN')).toBeTrue();
    });

    it('debería retornar false si el usuario no tiene el rol', () => {
      expect(service.hasRole('ROLE_INEXISTENTE')).toBeFalse();
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      service.guardarToken(mockAccessToken);
      service.guardarUsuario(mockAccessToken);
    });

    it('debería limpiar el token y usuario', () => {
      service.logout();
      expect(service.token).toBeNull();
      expect(service.usuario).toEqual(new Usuario());
    });

    it('debería limpiar el sessionStorage', () => {
      service.logout();
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('usuarioEntidad')).toBeNull();
      expect(sessionStorage.getItem('administrador')).toBeNull();
      expect(sessionStorage.getItem('organizador')).toBeNull();
    });
  });

  describe('propiedades usuario y token', () => {
    it('debería retornar el usuario desde sessionStorage cuando no está en memoria', () => {
      const mockUsuario = new Usuario();
      mockUsuario.usuario = 'testuser';
      sessionStorage.setItem('usuario', JSON.stringify(mockUsuario));

      const usuario = service.usuario;
      expect(usuario.usuario).toBe('testuser');
    });

    it('debería retornar el token desde sessionStorage cuando no está en memoria', () => {
      sessionStorage.setItem('token', 'stored-token');
      const token = service.token;
      expect(token).toBe('stored-token');
    });
  });
});