'use strict';

const { createProductionTracker } = require('../production-tracking');

const tracker = createProductionTracker({ stuckAfterMinutes: 45 });

const events = [
  {
    eventId: 'evt-001',
    bundleId: 'TSHIRT-2409-NAVY-M-001-FRT',
    stage: 'CUTTING',
    timestamp: '2026-09-19T08:00:00Z',
    quantity: 20,
  },
  {
    eventId: 'evt-002',
    bundleId: 'TSHIRT-2409-NAVY-M-001-FRT',
    stage: 'SEWING',
    timestamp: '2026-09-19T09:00:00Z',
    quantity: 20,
    line: 'LINE-1',
    operatorId: 'OP-014',
  },
  {
    eventId: 'evt-003',
    bundleId: 'TSHIRT-2409-NAVY-L-002-FRT',
    stage: 'SEWING',
    timestamp: '2026-09-19T09:40:00Z',
    quantity: 20,
    line: 'LINE-1',
    operatorId: 'OP-021',
  },
  {
    eventId: 'evt-004',
    bundleId: 'TSHIRT-2409-RED-M-003-FRT',
    stage: 'QC',
    timestamp: '2026-09-19T09:45:00Z',
    quantity: 15,
    line: 'LINE-2',
  },
];

events.forEach(event => tracker.record(event));

console.log('WIP by stage');
console.table(tracker.getWIP());

console.log('\nBundles stuck for 45+ minutes at 10:00 UTC');
console.table(tracker.getStuckBundles({
  now: '2026-09-19T10:00:00Z',
  thresholdMinutes: 45,
}));

console.log('\nLine summary');
console.dir(tracker.getLineSummary(), { depth: null });

console.log('\nBundle timeline');
console.dir(tracker.getTimeline('TSHIRT-2409-NAVY-M-001-FRT'), { depth: null });
