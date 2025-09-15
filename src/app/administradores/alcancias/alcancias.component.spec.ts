import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlcanciasComponent } from './alcancias.component';

describe('AlcanciasComponent', () => {
  let component: AlcanciasComponent;
  let fixture: ComponentFixture<AlcanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlcanciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlcanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
