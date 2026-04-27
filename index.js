const smv = require('./smv-calculator');
const piecerate = require('./piece-rate-calculator');
const bundle = require('./bundle-id-generator');

module.exports = { ...smv, ...piecerate, ...bundle };
