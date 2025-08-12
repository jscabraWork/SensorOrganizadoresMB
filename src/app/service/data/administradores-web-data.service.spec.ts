import { TestBed } from '@angular/core/testing';

import { AdministradoresWebDataService } from './administradores-web-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AdministradoresWebDataService', () => {
  let service: AdministradoresWebDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [AdministradoresWebDataService]
    });
    service = TestBed.inject(AdministradoresWebDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});