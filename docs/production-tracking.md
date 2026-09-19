# Garment Production Tracking: Event Model and WIP Reference

This guide shows a small, vendor-neutral way to model **garment production tracking** for a cut-and-sew factory.

The goal is not to recreate a full ERP. It is to show the minimum data model needed to answer practical shop-floor questions:

- Where is each bundle now?
- How many bundles and pieces are at each production stage?
- Which bundles have stopped moving?
- Which sewing line currently holds each bundle?
- What is the event history of a bundle?

## Production event

Each scan or handoff is an event:

```json
{
  "eventId": "evt-002",
  "bundleId": "TSHIRT-2409-NAVY-M-001-FRT",
  "stage": "SEWING",
  "timestamp": "2026-09-19T09:00:00Z",
  "quantity": 20,
  "line": "LINE-1",
  "operatorId": "OP-014"
}
```

The tracker treats the event stream as the source of truth and derives the current bundle state from the latest event.

## Default production stages

```text
CUTTING
  ↓
BUNDLING
  ↓
SEWING
  ↓
FINISHING
  ↓
QC
  ↓
PACKING
  ↓
DISPATCHED
```

Factories can pass a custom stage list when creating the tracker.

## Why an event model works well

A garment bundle changes hands many times. Updating a single status field loses the path that produced the current state.

An event history preserves:

- previous stage
- new stage
- scan time
- line
- operator
- quantity

That makes it possible to reconstruct a timeline and investigate missing or delayed bundles.

## Work in progress (WIP)

WIP is calculated from each bundle's latest stage.

Example:

```js
const { createProductionTracker } = require('../production-tracking');

const tracker = createProductionTracker();

tracker.record({
  bundleId: 'STYLE1-LOT1-BLUE-M-001-FRT',
  stage: 'SEWING',
  quantity: 20,
  timestamp: '2026-09-19T09:00:00Z',
});

console.log(tracker.getWIP());
```

Output shape:

```js
{
  CUTTING:    { bundles: 0, pieces: 0 },
  BUNDLING:   { bundles: 0, pieces: 0 },
  SEWING:     { bundles: 1, pieces: 20 },
  FINISHING:  { bundles: 0, pieces: 0 },
  QC:         { bundles: 0, pieces: 0 },
  PACKING:    { bundles: 0, pieces: 0 },
  DISPATCHED: { bundles: 0, pieces: 0 }
}
```

Dispatched bundles are excluded from WIP by default.

## Stuck-bundle detection

A simple first-pass bottleneck rule is:

> current time - last movement time >= threshold

```js
tracker.getStuckBundles({
  now: '2026-09-19T10:00:00Z',
  thresholdMinutes: 45,
});
```

A production system can improve this by using different thresholds per stage or operation.

## Duplicate scan protection

If an event has an `eventId`, the tracker uses it as an idempotency key. Replaying the same event does not create a second history entry.

If no event ID is supplied, it derives a key from:

```text
bundle + stage + timestamp + operator + line
```

## Sample data

See:

- [production-events.csv](../examples/production-events.csv)
- [production-tracking-demo.js](../examples/production-tracking-demo.js)

Run the example:

```bash
node examples/production-tracking-demo.js
```

Run tests:

```bash
npm test
```

## Extending this model

Common additions include:

- operation-level tracking inside SEWING
- rework / repair events
- QC defect events
- bundle split and merge events
- supervisor handoff confirmation
- expected-stage SLA by style
- hourly target vs actual
- SAM/SMV-based capacity
- machine assignment
- piece-rate earnings
- offline event queues

## From reference implementation to a factory system

This repository intentionally stays small and inspectable.

For a full garment-factory implementation of QR bundle tracking, WIP, operator work and production dashboards, see the [Scan ERP production tracking guide](https://scanerp.pro/blog/garment-production-tracking-system-2026-guide.html?utm_source=github&utm_medium=referral&utm_campaign=cmt_factory_toolkit_production_tracking).

The reference module here can also be used independently under the MIT license.
