import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiasComponent } from './dias.component';

describe('DiasComponent', () => {
  let component: DiasComponent;
  let fixture: ComponentFixture<DiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
