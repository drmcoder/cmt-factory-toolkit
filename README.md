# CMT Factory Toolkit

> Open-source reference utilities for CMT (Cut-Make-Trim) garment factory operations: SMV, piece-rate calculations, bundle IDs, and event-based production tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by Scan ERP](https://img.shields.io/badge/Project%20by-Scan%20ERP-2563eb)](https://scanerp.pro/?utm_source=github&utm_medium=referral&utm_campaign=cmt_factory_toolkit)

The project is intentionally small and inspectable. Each module can be used independently in factory tools, ERP prototypes, dashboards, or training projects.

## What's inside

```text
cmt-factory-toolkit/
├── smv-calculator.js
├── piece-rate-calculator.js
├── bundle-id-generator.js
├── production-tracking/
│   └── index.js
├── examples/
│   ├── production-tracking-demo.js
│   └── production-events.csv
├── docs/
│   ├── production-tracking.md
│   └── production-tracking-demo.html
└── test/
    └── production-tracker.test.js
```

## Install

Clone the repository or require individual modules directly:

```bash
git clone https://github.com/drmcoder/cmt-factory-toolkit.git
cd cmt-factory-toolkit
npm test
```

## 1. Garment production tracking

The production tracker consumes bundle movement events and derives:

- current stage per bundle
- WIP by stage
- piece counts by stage
- bundle timeline
- line summary
- aging
- stuck-bundle detection
- duplicate-event protection

```js
const { createProductionTracker } = require('./production-tracking');

const tracker = createProductionTracker({ stuckAfterMinutes: 45 });

tracker.record({
  eventId: 'evt-001',
  bundleId: 'TSHIRT-2409-NAVY-M-001-FRT',
  stage: 'SEWING',
  timestamp: '2026-09-19T09:00:00Z',
  quantity: 20,
  line: 'LINE-1',
  operatorId: 'OP-014',
});

console.log(tracker.getWIP());
console.log(tracker.getStuckBundles({
  now: '2026-09-19T10:00:00Z',
}));
```

Read the [production tracking architecture guide](./docs/production-tracking.md) or open the standalone [WIP dashboard demo](./docs/production-tracking-demo.html).

For a full factory-floor implementation of QR bundle tracking, live WIP and operator workflows, see the [Scan ERP garment production tracking guide](https://scanerp.pro/blog/garment-production-tracking-system-2026-guide.html?utm_source=github&utm_medium=referral&utm_campaign=cmt_factory_toolkit_production_tracking).

## 2. Bundle ID generator

Creates predictable bundle IDs from style, lot, color, size, bundle sequence and component.

```js
const { generateBundleId, parseBundleId } = require('./bundle-id-generator');

const id = generateBundleId({
  style: 'S27',
  lot: '8082',
  color: 'BLUE',
  size: 'M',
  bundleNumber: 1,
  component: 'FRT',
});

console.log(id);
// S27-8082-BLUE-M-001-FRT

console.log(parseBundleId(id));
```

For implementation patterns around QR events and bundle handoffs, see the [QR bundle tracking guide](https://scanerp.pro/blog/qr-code-production-tracking-garment-factory.html?utm_source=github&utm_medium=referral&utm_campaign=cmt_factory_toolkit_qr).

## 3. SMV calculator

```js
const { calculateSMV } = require('./smv-calculator');

const smv = calculateSMV({
  observedTimeSeconds: 18,
  performanceRating: 1.05,
  allowancePercent: 0.30,
});

console.log(smv.toFixed(2));
```

Formula:

```text
Basic Time = Observed Time × Performance Rating
SMV = Basic Time × (1 + Allowance%)
```

## 4. Piece-rate calculator

```js
const { calculatePieceRate } = require('./piece-rate-calculator');

const result = calculatePieceRate({
  pieces: 250,
  ratePerPiece: 2.50,
  skillLevel: 'expert',
  qualityScore: 95,
  efficiencyPercent: 110,
  machineType: 'OVERLOCK_5THREAD',
});

console.log(result);
```

The calculator is a reference formula. Factories should adapt rates, bonuses, deductions and legal payroll rules to their own policy and jurisdiction.

## Production event model

A tracking event is intentionally simple:

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

Default stages:

```text
CUTTING → BUNDLING → SEWING → FINISHING → QC → PACKING → DISPATCHED
```

A custom stage list can be supplied when creating the tracker.

## Run the demo

```bash
node examples/production-tracking-demo.js
```

The sample CSV is at `examples/production-events.csv`.

## Run tests

```bash
npm test
```

CI runs the test on Node 18, 20 and 22 for pull requests and main-branch pushes.

## Design principles

- **Event first:** keep movement history instead of only a mutable status.
- **Idempotent:** repeated event IDs do not duplicate movement records.
- **No backend required:** the reference tracker runs entirely in memory.
- **Vendor neutral:** no Scan ERP API is required.
- **Composable:** use only the modules needed by your project.
- **Factory specific:** examples use bundles, sewing lines, WIP and piece counts rather than generic inventory transactions.

## Possible extensions

Useful contributions include:

- operation-level sewing events
- rework / repair transitions
- QC defect events
- bundle split / merge logic
- stage-specific SLA thresholds
- SAM/SMV capacity targets
- hourly target vs actual
- offline event queue examples
- SQLite / PostgreSQL adapters
- REST API example
- browser dashboard fed from CSV/JSON

## Related open-source projects

- [garment-aql-calculator](https://github.com/drmcoder/garment-aql-calculator)
- [garment-dhu-calculator](https://github.com/drmcoder/garment-dhu-calculator)
- [garment-line-efficiency](https://github.com/drmcoder/garment-line-efficiency)
- [garment-fabric-consumption](https://github.com/drmcoder/garment-fabric-consumption)
- [garment-cmt-cost](https://github.com/drmcoder/garment-cmt-cost)
- [awesome-garment-erp](https://github.com/drmcoder/awesome-garment-erp)

## Contributing

Issues and pull requests are welcome. Please keep examples anonymized and do not commit real worker names, wages, buyer data, or factory credentials.

## License

MIT.
