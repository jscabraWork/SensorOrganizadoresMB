import { TestBed } from '@angular/core/testing';

import { ImagenesDataService } from './imagenes-data.service';

describe('ImagenesDataService', () => {
  let service: ImagenesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagenesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
