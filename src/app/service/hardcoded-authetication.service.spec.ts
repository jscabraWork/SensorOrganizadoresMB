import { TestBed } from '@angular/core/testing';

import { HardcodedAutheticationService } from './hardcoded-authetication.service';

describe('HardcodedAutheticationService', () => {
  let service: HardcodedAutheticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HardcodedAutheticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
