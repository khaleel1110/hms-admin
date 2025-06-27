import { TestBed } from '@angular/core/testing';

import { PatientExcelService } from './patient-excel.service';

describe('PatientExcelService', () => {
  let service: PatientExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
