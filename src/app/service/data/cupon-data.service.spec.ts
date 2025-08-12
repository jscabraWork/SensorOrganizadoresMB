import { TestBed } from '@angular/core/testing';

import { CuponDataService } from './cupon-data.service';

describe('CuponDataService', () => {
  let service: CuponDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuponDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
