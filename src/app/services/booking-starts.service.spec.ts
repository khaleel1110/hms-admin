import { TestBed } from '@angular/core/testing';

import { BookingStartsService } from './booking-starts.service';

describe('BookingStartsService', () => {
  let service: BookingStartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingStartsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
