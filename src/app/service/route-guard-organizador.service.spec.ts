import { TestBed } from '@angular/core/testing';

import { RouteGuardOrganizadorService } from './route-guard-organizador.service';

describe('RouteGuardOrganizadorService', () => {
  let service: RouteGuardOrganizadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteGuardOrganizadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});