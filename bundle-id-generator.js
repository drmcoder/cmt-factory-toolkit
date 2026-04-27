/**
 * Bundle ID Generator — Standard format used in scan-erp QR-based production tracking.
 *
 * Format: STYLE-LOT-COLOR-SIZE-BUNDLE#-COMPONENT
 * Example: S27-8082-BLUE-M-001-FRT
 *
 * Component codes (from garment_library):
 *   FRT  = Front
 *   BK   = Back
 *   SLV  = Sleeve
 *   CLR  = Collar
 *   PKT  = Pocket
 *   CUFF = Cuff
 *   YKE  = Yoke
 *
 * Reference: https://scan-erp.web.app/blog/qr-code-production-tracking-garment-factory.html
 */

const COMPONENT_CODES = {
  FRONT: 'FRT', front: 'FRT',
  BACK: 'BK', back: 'BK',
  SLEEVE: 'SLV', sleeve: 'SLV', SLEEVE_LEFT: 'SLV-L', SLEEVE_RIGHT: 'SLV-R',
  COLLAR: 'CLR', collar: 'CLR',
  POCKET: 'PKT', pocket: 'PKT',
  CUFF: 'CUFF', cuff: 'CUFF',
  YOKE: 'YKE', yoke: 'YKE',
};

function generateBundleId({ style, lot, color, size, bundleNumber, component }) {
  const styleSafe = (style || 'STYLE').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const lotSafe = (lot || '0000').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const colorSafe = (color || 'COL').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const sizeSafe = (size || 'M').toUpperCase();
  const bundleNumStr = String(bundleNumber || 1).padStart(3, '0');
  const componentCode = COMPONENT_CODES[component] || (component || '').toUpperCase().slice(0, 6);
  return `${styleSafe}-${lotSafe}-${colorSafe}-${sizeSafe}-${bundleNumStr}-${componentCode}`;
}

function parseBundleId(bundleId) {
  const parts = bundleId.split('-');
  if (parts.length < 6) return null;
  const [style, lot, color, size, bundleNumber, ...componentParts] = parts;
  return {
    style,
    lot,
    color,
    size,
    bundleNumber: parseInt(bundleNumber, 10),
    component: componentParts.join('-'),
  };
}

module.exports = { generateBundleId, parseBundleId, COMPONENT_CODES };
