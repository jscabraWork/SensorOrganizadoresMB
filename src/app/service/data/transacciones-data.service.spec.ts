import { TestBed } from '@angular/core/testing';

import { TransaccionesDataService } from './transacciones-data.service';

describe('TransaccionesDataService', () => {
  let service: TransaccionesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransaccionesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
