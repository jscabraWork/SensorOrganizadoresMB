import { TestBed } from '@angular/core/testing';

import { OrganizadorDataService } from './organizador-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('OrganizadorDataService', () => {
  let service: OrganizadorDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [OrganizadorDataService] 
    });
    
    service = TestBed.inject(OrganizadorDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
