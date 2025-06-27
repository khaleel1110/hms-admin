import { TestBed } from '@angular/core/testing';

import { PatientPdfService } from './patient-pdf.service';

describe('PatientPdfService', () => {
  let service: PatientPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
