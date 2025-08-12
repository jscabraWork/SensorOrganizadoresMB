import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoutComponent } from './logout.component';
import { Router } from '@angular/router';
import { HardcodedAutheticationService } from '../service/hardcoded-authetication.service';
import { AuthService } from '../service/security/auth.service';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  let mockHardcodedService: jasmine.SpyObj<HardcodedAutheticationService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockHardcodedService = jasmine.createSpyObj('HardcodedAutheticationService', ['logout']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LogoutComponent],
      providers: [
        { provide: HardcodedAutheticationService, useValue: mockHardcodedService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar al cierre de sesión en ambos servicios y navegar a /logout', () => {
    fixture.detectChanges(); // dispara ngOnInit

    expect(mockHardcodedService.logout).toHaveBeenCalled();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/logout']);
  });
});
