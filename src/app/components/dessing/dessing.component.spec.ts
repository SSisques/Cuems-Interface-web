import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DessingComponent } from './dessing.component';

describe('DessingComponent', () => {
  let component: DessingComponent;
  let fixture: ComponentFixture<DessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
