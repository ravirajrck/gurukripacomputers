import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceBookDialogComponent } from './service-book-dialog.component';

describe('ServiceBookDialogComponent', () => {
  let component: ServiceBookDialogComponent;
  let fixture: ComponentFixture<ServiceBookDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceBookDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceBookDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
