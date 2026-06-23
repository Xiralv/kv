import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttirePage } from './attire.page';

describe('AttirePage', () => {
  let component: AttirePage;
  let fixture: ComponentFixture<AttirePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AttirePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
