'use strict';

const assert = require('assert');
const { createProductionTracker } = require('../production-tracking');

const tracker = createProductionTracker({ stuckAfterMinutes: 45 });

tracker.record({
  eventId: 'e1',
  bundleId: 'S27-8082-BLUE-M-001-FRT',
  stage: 'CUTTING',
  timestamp: '2026-09-19T08:00:00Z',
  quantity: 20,
});

tracker.record({
  eventId: 'e2',
  bundleId: 'S27-8082-BLUE-M-001-FRT',
  stage: 'SEWING',
  timestamp: '2026-09-19T09:00:00Z',
  quantity: 20,
  line: 'LINE-1',
  operatorId: 'OP-014',
});

tracker.record({
  eventId: 'e3',
  bundleId: 'S27-8082-BLUE-L-002-FRT',
  stage: 'SEWING',
  timestamp: '2026-09-19T09:40:00Z',
  quantity: 20,
  line: 'LINE-1',
  operatorId: 'OP-021',
});

tracker.record({
  eventId: 'e4',
  bundleId: 'S27-8082-RED-M-003-FRT',
  stage: 'DISPATCHED',
  timestamp: '2026-09-19T09:45:00Z',
  quantity: 15,
  line: 'LINE-2',
});

assert.equal(tracker.getBundle('S27-8082-BLUE-M-001-FRT').stage, 'SEWING');
assert.equal(tracker.getTimeline('S27-8082-BLUE-M-001-FRT').length, 2);

const wip = tracker.getWIP();
assert.equal(wip.SEWING.bundles, 2);
assert.equal(wip.SEWING.pieces, 40);
assert.equal(wip.DISPATCHED.bundles, 0);

const stuck = tracker.getStuckBundles({ now: '2026-09-19T10:00:00Z' });
assert.deepEqual(stuck.map(item => item.bundleId), ['S27-8082-BLUE-M-001-FRT']);

assert.equal(tracker.getLineSummary()['LINE-1'].pieces, 40);

const duplicate = tracker.record({
  eventId: 'e2',
  bundleId: 'S27-8082-BLUE-M-001-FRT',
  stage: 'SEWING',
  timestamp: '2026-09-19T09:00:00Z',
});

assert.equal(duplicate.duplicate, true);

console.log('production-tracker tests passed');
