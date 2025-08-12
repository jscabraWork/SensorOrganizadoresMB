import { TestBed } from '@angular/core/testing';

import { PuntosfisicosDataService } from './puntosfisicos-data.service';

describe('PuntosfisicosDataService', () => {
  let service: PuntosfisicosDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuntosfisicosDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
