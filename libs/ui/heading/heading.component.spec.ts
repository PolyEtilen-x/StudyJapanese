import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeadingComponent } from './heading.component';

describe('HeadingComponent', () => {
  let component: HeadingComponent;
  let fixture: ComponentFixture<HeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadingComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(HeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
