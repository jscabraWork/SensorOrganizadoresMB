import { TestBed } from '@angular/core/testing';

import { MapasDataService } from './mapas-data.service';

describe('MapasDataService', () => {
  let service: MapasDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapasDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
