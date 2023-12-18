import { TestBed } from '@angular/core/testing';

import { SensorDataFeedService } from './sensor-data-feed.service';

describe('SensorDataFeedService', () => {
  let service: SensorDataFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensorDataFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
