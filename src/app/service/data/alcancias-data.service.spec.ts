import { TestBed } from '@angular/core/testing';

import { AlcanciasDataService } from './alcancias-data.service';

describe('AlcanciasDataService', () => {
  let service: AlcanciasDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlcanciasDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
