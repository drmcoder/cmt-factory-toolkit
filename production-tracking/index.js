'use strict';

const DEFAULT_STAGES = [
  'CUTTING',
  'BUNDLING',
  'SEWING',
  'FINISHING',
  'QC',
  'PACKING',
  'DISPATCHED',
];

function toIso(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('timestamp must be a valid date');
  return date.toISOString();
}

function makeEventKey(event) {
  return event.eventId || [
    event.bundleId,
    event.stage,
    event.timestamp,
    event.operatorId || '',
    event.line || '',
  ].join('|');
}

function createProductionTracker({ stages = DEFAULT_STAGES, stuckAfterMinutes = 60 } = {}) {
  if (!Array.isArray(stages) || stages.length < 2) {
    throw new Error('stages must contain at least 2 values');
  }

  const stageOrder = [...new Set(stages.map(stage => String(stage).trim().toUpperCase()))];
  const stageIndex = new Map(stageOrder.map((stage, index) => [stage, index]));
  const bundles = new Map();
  const seenEvents = new Set();

  function snapshot(record) {
    return {
      bundleId: record.bundleId,
      stage: record.stage,
      stageIndex: record.stageIndex,
      quantity: record.quantity,
      firstSeenAt: record.firstSeenAt,
      lastSeenAt: record.lastSeenAt,
      operatorId: record.operatorId,
      line: record.line,
      history: record.history.map(event => ({ ...event })),
    };
  }

  function record(input) {
    if (!input || !input.bundleId) throw new Error('bundleId is required');
    if (!input.stage) throw new Error('stage is required');

    const stage = String(input.stage).trim().toUpperCase();
    if (!stageIndex.has(stage)) throw new Error(`unknown stage: ${stage}`);

    const timestamp = toIso(input.timestamp || new Date());
    const quantity = input.quantity == null ? undefined : Number(input.quantity);

    if (quantity !== undefined && (!Number.isFinite(quantity) || quantity < 0)) {
      throw new Error('quantity must be a non-negative number');
    }

    const event = {
      eventId: input.eventId || undefined,
      bundleId: String(input.bundleId),
      stage,
      timestamp,
      operatorId: input.operatorId ? String(input.operatorId) : undefined,
      line: input.line ? String(input.line) : undefined,
      quantity,
      note: input.note ? String(input.note) : undefined,
    };

    const key = makeEventKey(event);
    if (seenEvents.has(key)) return { duplicate: true, event };
    seenEvents.add(key);

    const existing = bundles.get(event.bundleId);
    const previousStage = existing ? existing.stage : null;
    const bundle = existing || {
      bundleId: event.bundleId,
      firstSeenAt: timestamp,
      quantity: quantity ?? 0,
      history: [],
    };

    bundle.stage = stage;
    bundle.stageIndex = stageIndex.get(stage);
    bundle.lastSeenAt = timestamp;
    bundle.operatorId = event.operatorId;
    bundle.line = event.line;
    if (quantity !== undefined) bundle.quantity = quantity;
    bundle.history.push({ ...event, previousStage });

    bundles.set(event.bundleId, bundle);
    return { duplicate: false, event, bundle: snapshot(bundle) };
  }

  function getBundle(bundleId) {
    const bundle = bundles.get(String(bundleId));
    return bundle ? snapshot(bundle) : null;
  }

  function getTimeline(bundleId) {
    const bundle = bundles.get(String(bundleId));
    return bundle ? bundle.history.map(event => ({ ...event })) : [];
  }

  function getWIP({ includeDispatched = false } = {}) {
    const summary = Object.fromEntries(
      stageOrder.map(stage => [stage, { bundles: 0, pieces: 0 }])
    );

    for (const bundle of bundles.values()) {
      if (!includeDispatched && bundle.stage === 'DISPATCHED') continue;
      summary[bundle.stage].bundles += 1;
      summary[bundle.stage].pieces += Number(bundle.quantity || 0);
    }

    return summary;
  }

  function getAging({ now = new Date() } = {}) {
    const nowMs = new Date(now).getTime();
    if (Number.isNaN(nowMs)) throw new Error('now must be a valid date');

    return [...bundles.values()]
      .map(bundle => ({
        bundleId: bundle.bundleId,
        stage: bundle.stage,
        line: bundle.line,
        quantity: bundle.quantity,
        ageMinutes: Math.max(
          0,
          Math.floor((nowMs - new Date(bundle.lastSeenAt).getTime()) / 60000)
        ),
        lastSeenAt: bundle.lastSeenAt,
      }))
      .sort((a, b) => b.ageMinutes - a.ageMinutes);
  }

  function getStuckBundles({ now = new Date(), thresholdMinutes = stuckAfterMinutes } = {}) {
    if (!Number.isFinite(Number(thresholdMinutes)) || Number(thresholdMinutes) < 0) {
      throw new Error('thresholdMinutes must be a non-negative number');
    }

    return getAging({ now }).filter(
      item => item.stage !== 'DISPATCHED' && item.ageMinutes >= Number(thresholdMinutes)
    );
  }

  function getLineSummary() {
    const result = {};

    for (const bundle of bundles.values()) {
      const line = bundle.line || 'UNASSIGNED';
      if (!result[line]) result[line] = { bundles: 0, pieces: 0, stages: {} };

      result[line].bundles += 1;
      result[line].pieces += Number(bundle.quantity || 0);
      result[line].stages[bundle.stage] = (result[line].stages[bundle.stage] || 0) + 1;
    }

    return result;
  }

  function reset() {
    bundles.clear();
    seenEvents.clear();
  }

  return {
    record,
    getBundle,
    getTimeline,
    getWIP,
    getAging,
    getStuckBundles,
    getLineSummary,
    reset,
    stages: [...stageOrder],
  };
}

module.exports = { createProductionTracker, DEFAULT_STAGES };
