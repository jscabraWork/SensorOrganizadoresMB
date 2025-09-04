import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisAlcanciasComponent } from './mis-alcancias.component';

describe('MisAlcanciasComponent', () => {
  let component: MisAlcanciasComponent;
  let fixture: ComponentFixture<MisAlcanciasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MisAlcanciasComponent]
    });
    fixture = TestBed.createComponent(MisAlcanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});