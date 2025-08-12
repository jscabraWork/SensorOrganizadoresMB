import { TestBed } from '@angular/core/testing';

import { TipoDocumentoDataService } from './tipo-documento-data.service';

describe('TipoDocumentoDataService', () => {
  let service: TipoDocumentoDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoDocumentoDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
