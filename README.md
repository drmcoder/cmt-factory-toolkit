# CMT Factory Toolkit

> Open-source utilities for CMT (Cut-Make-Trim) garment factory operations: SMV calculators, piece-rate formulas, line balancing helpers, and bundle ID generators.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by Scan ERP](https://img.shields.io/badge/Powered%20by-Scan%20ERP-2563eb)](https://scanerp.pro/)

Open-sourced from [Scan ERP](https://scanerp.pro/), a QR-based ERP for CMT garment factories. These utilities power our own production system; published here so other factory developers can use them.

## What's Inside

```
cmt-factory-toolkit/
├── smv-calculator.js          # SMV = Basic Time × (1 + Allowance%)
├── piece-rate-calculator.js   # Piece-rate wage with skill multipliers + bonuses
├── bundle-id-generator.js     # Standard bundle ID format used in scan-erp
├── westinghouse-rating.js     # Performance rating tables (Skill/Effort/Conditions/Consistency)
└── examples/
    ├── shirt-smv-example.js
    ├── line-balance-example.js
    └── piece-rate-monthly.js
```

## Quick Start

```javascript
const { calculateSMV } = require('./smv-calculator');

// Calculate SMV for a sewing operation
const smv = calculateSMV({
  observedTimeSeconds: 18,        // From stopwatch
  performanceRating: 1.05,        // Westinghouse: skilled operator at 105%
  allowancePercent: 0.30,         // 30% (personal + fatigue + delay)
});

console.log(`SMV: ${smv.toFixed(2)} minutes per piece`);
// → SMV: 0.41 minutes per piece
```

## SMV Calculator

The Standard Minute Value formula used across the garment industry:

```
SMV = Basic Time × (1 + Allowance%)
Basic Time = Observed Time × Performance Rating
```

### Westinghouse Performance Rating

Rates operator performance across four dimensions:

| Dimension | Range | Meaning |
|-----------|-------|---------|
| Skill | -0.22 to +0.15 | Operator's skill level |
| Effort | -0.17 to +0.13 | How hard they're working |
| Conditions | -0.07 to +0.06 | Workstation environment |
| Consistency | -0.04 to +0.04 | Cycle-to-cycle stability |

Final rating = 1.0 + sum of all four adjustments.

[Read full SMV guide on Scan ERP →](https://scanerp.pro/blog/sam-smv-calculation-garment-industry.html)

## Piece-Rate Calculator

Standard piece-rate wage formula used in CMT factories:

```javascript
const { calculatePieceRate } = require('./piece-rate-calculator');

const wage = calculatePieceRate({
  pieces: 250,
  ratePerPiece: 2.50,           // Currency unit
  skillLevel: 'expert',         // novice/intermediate/expert
  qualityScore: 95,             // 0-100
  efficiencyPercent: 110,       // % of standard
  machineType: 'OVERLOCK_5THREAD',
});

// → { gross: 762.50, breakdown: {...} }
```

The full formula:

```
adjustedRate = baseRate × skillMultiplier
base = pieces × adjustedRate
+ machineComplexityBonus (5-25% by machine)
+ efficiencyBonus (tiered)
- qualityPenalty (below threshold)
= gross wage
```

[Read full piece-rate guide on Scan ERP →](https://scanerp.pro/blog/piece-rate-payment-calculation-garment-factory.html)

## Bundle ID Generator

Standard bundle ID format used in QR-based production tracking:

```javascript
const { generateBundleId } = require('./bundle-id-generator');

const id = generateBundleId({
  style: 'S27',
  lot: '8082',
  color: 'BLUE',
  size: 'M',
  bundleNumber: 1,
  component: 'FRT',
});
// → "S27-8082-BLUE-M-001-FRT"
```

This format encodes:
- Style number
- Lot number
- Color name
- Size
- Bundle sequence (zero-padded to 3 digits)
- Component code (FRT=Front, BK=Back, SLV=Sleeve, CLR=Collar, etc.)

[Read full QR bundle tracking guide →](https://scanerp.pro/blog/qr-code-production-tracking-garment-factory.html)

## Use Cases

These utilities are used in:
- Real-time bundle scanning workflows
- End-of-day operator wage calculations
- Production capacity planning
- Line balancing and target setting
- CMT pricing calculators

## Used in production

Powers daily operations at:
- Trishakti Apparel (Nepal, 60 operators) — original implementation
- Scan ERP customer factories across South Asia, Southeast Asia, and Africa
- 115,370+ pieces tracked using these formulas

## Related Reading

- [Garment Factory ERP System: Complete 2026 Guide](https://scanerp.pro/blog/garment-factory-erp-system-complete-guide.html)
- [Real-Time Garment Production Tracking System](https://scanerp.pro/blog/garment-production-tracking-system-2026-guide.html)
- [SMV Costing for CMT Pricing](https://scanerp.pro/blog/smv-costing-cmt-pricing-garment-factory.html)
- [SAM Values Reference Table](https://scanerp.pro/blog/sam-values-basic-garments-reference-table.html)
- [11 Questions to Ask Before Buying Garment Factory Software](https://scanerp.pro/blog/11-questions-before-buying-garment-factory-software.html)

## Try Scan ERP

This toolkit is free. The full ERP system that uses these utilities (with QR scanning, dashboards, payments, hardware integration) is available at [scanerp.pro](https://scanerp.pro/).

- 🌐 [Live demo](https://scanerp.pro/)
- 📱 WhatsApp: +977-9863618347
- 💬 [Free 30-day trial](https://scanerp.pro/#contact)

## Contributing

PRs welcome! Particularly interested in:
- Additional language translations (descriptions for Bengali, Hindi, Tamil, Khmer, Vietnamese)
- More garment-specific calculation utilities
- Real factory data examples (anonymized)
- Edge cases we haven't covered

## License

MIT — use freely in commercial and non-commercial projects.

---

Built by [Santosh Rijal](https://github.com/drmcoder) — MBBS doctor and CMT factory owner. [Scan ERP](https://scanerp.pro/) is the full ERP system powered by these utilities.
