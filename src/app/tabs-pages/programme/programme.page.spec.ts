import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgrammePage } from './programme.page';

describe('ProgrammePage', () => {
  let component: ProgrammePage;
  let fixture: ComponentFixture<ProgrammePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgrammePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
