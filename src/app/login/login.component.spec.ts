import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../service/security/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { Usuario } from '../service/usuario.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'logout',
      'login',
      'guardarUsuario',
      'guardarToken'
    ], {
      usuario: { usuario: 'mockUser' }
    });
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        FormsModule,
        CommonModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar mensaje si usuario o contraseña están vacíos', () => {
    component.usuario = new Usuario();
  component.usuario.usuario = null; // o ''
  component.usuario.contrasena = null;

  spyOn(component, 'openMensaje');
  component.handleLogin();
  expect(component.openMensaje).toHaveBeenCalledWith('Username o Password vacios');
});

  it('debería hacer login exitoso', () => {
    component.usuario.usuario = 'testUser';
    component.usuario.contrasena = '1234';

    const responseMock = { access_token: 'token123' };
    mockAuthService.login.and.returnValue(of(responseMock));

    component.handleLogin();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockAuthService.guardarUsuario).toHaveBeenCalledWith('token123');
    expect(mockAuthService.guardarToken).toHaveBeenCalledWith('token123');
  });

  it('debería manejar error 400 al hacer login', () => {
    component.usuario.usuario = 'wrong';
    component.usuario.contrasena = 'wrongpass';
    spyOn(component, 'openMensaje');

    mockAuthService.login.and.returnValue(
      throwError(() => ({ status: 400 }))
    );

    component.handleLogin();

    expect(component.openMensaje).toHaveBeenCalledWith('Usuario o clave incorrectos');
    expect(component.invalidLogin).toBeTrue();
    expect(component.usuario).toEqual(jasmine.any(Usuario));
  });
});
