import { TestBed } from '@angular/core/testing';
import { RouteGuardAdminService } from './route-guard-admin.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HardcodedAutheticationService } from './hardcoded-authetication.service';

describe('RouteGuardAdminService', () => {
  let servicio: RouteGuardAdminService;

  beforeEach(() => {
    // Mock mínimo necesario
    const mockAuthService = {
      adminLoggin: () => false,
      contadorLoggin: false
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        RouteGuardAdminService,
        { provide: HardcodedAutheticationService, useValue: mockAuthService }
      ]
    });

    servicio = TestBed.inject(RouteGuardAdminService);
  });

  it('debería crearse correctamente', () => {
    expect(servicio).toBeTruthy();
  });
});