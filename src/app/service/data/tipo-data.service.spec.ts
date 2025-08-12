import { TestBed } from '@angular/core/testing';

import { TipoDataService } from './tipo-data.service';

describe('TipoDataService', () => {
  let service: TipoDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
