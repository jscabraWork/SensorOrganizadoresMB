import { TestBed } from '@angular/core/testing';

import { ReporteDataService } from './reporte-data.service';

describe('ReporteDataService', () => {
  let service: ReporteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReporteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
