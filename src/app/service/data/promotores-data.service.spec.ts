import { TestBed } from '@angular/core/testing';

import { PromotoresDataService } from './promotores-data.service';

describe('PromotoresDataService', () => {
  let service: PromotoresDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromotoresDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
