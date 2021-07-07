import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacklogPage } from './backlog.component';

describe('BacklogPage', () => {
  let component: BacklogPage;
  let fixture: ComponentFixture<BacklogPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacklogPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacklogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
