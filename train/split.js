import Axis from "../brain/axis.js";
import Perceptron from "../brain/perceptron.js";
import { updateNeighborsOnTwoWaySplit, updateNeighborsOnThreeWaySplit } from "./neighbors.js";

// Splits the perceptron of the given conceptron at the given input. Returns all split parts.
export default function splitPerceptron(conceptron, perceptron, inputs, activation) {
  const { index, side } = findSplitAxisIndex(perceptron, inputs);
  const input = inputs[index];
  const sibling = clonePerceptron(perceptron, inputs);

  sibling.activation = activation;
  conceptron.perceptrons.add(sibling);

  if (side < 0) {
    const minPerceptron = sibling;
    const maxPerceptron = perceptron;

    const minPerceptronAxis = minPerceptron.axis[index];
    const maxPerceptronAxis = maxPerceptron.axis[index];

    minPerceptronAxis.max = input;
    minPerceptronAxis.maxInclusive = true;
    updateAxisCore(minPerceptronAxis, input);

    maxPerceptronAxis.minInclusive = false;
    maxPerceptronAxis.min = input;
    updateAxisCore(maxPerceptronAxis);

    updateNeighborsOnTwoWaySplit(minPerceptron, maxPerceptron, index);

    return [minPerceptron, maxPerceptron];
  } else if (side > 0) {
    const minPerceptron = perceptron;
    const maxPerceptron = sibling;

    const minPerceptronAxis = minPerceptron.axis[index];
    const maxPerceptronAxis = maxPerceptron.axis[index];

    minPerceptronAxis.max = input;
    minPerceptronAxis.maxInclusive = false;
    updateAxisCore(minPerceptronAxis);

    maxPerceptronAxis.minInclusive = true;
    maxPerceptronAxis.min = input;
    updateAxisCore(maxPerceptronAxis, input);

    updateNeighborsOnTwoWaySplit(minPerceptron, maxPerceptron, index);

    return [minPerceptron, maxPerceptron];
  } else {
    const minPerceptron = perceptron;
    const midPerceptron = sibling;
    const maxPerceptron = clonePerceptron(perceptron);

    const minPerceptronAxis = minPerceptron.axis[index];
    const midPerceptronAxis = midPerceptron.axis[index];
    const maxPerceptronAxis = maxPerceptron.axis[index];

    conceptron.perceptrons.add(maxPerceptron);

    minPerceptronAxis.max = input;
    minPerceptronAxis.maxInclusive = false;
    updateAxisCore(minPerceptronAxis);

    midPerceptronAxis.minInclusive = true;
    midPerceptronAxis.min = input;
    midPerceptronAxis.coremin = input;
    midPerceptronAxis.coremax = input;
    midPerceptronAxis.max = input;
    midPerceptronAxis.maxInclusive = true;

    maxPerceptronAxis.minInclusive = false;
    maxPerceptronAxis.min = input;
    updateAxisCore(maxPerceptronAxis);

    updateNeighborsOnThreeWaySplit(minPerceptron, midPerceptron, maxPerceptron, index);

    return [minPerceptron, midPerceptron, maxPerceptron];
  }
}

const SPLIT_CORE = 3;
const TRIM_CORE = 2;
const USE_CORE = 1;
const UNKNOWN = 0;

function findSplitAxisIndex(perceptron, inputs) {
  let splitIndex;
  let splitCore = UNKNOWN;
  let splitDiff = 0;
  let splitSide = 0;

  for (let i = 0; i < perceptron.axis.length; i++) {
    const axis = perceptron.axis[i];
    const input = inputs[i];

    let diff;
    let side;
    let core;

    if ((input > axis.coremin) && (input < axis.coremax)) {
      // Always prefer to split an axis outside its core or just trim it instead of splitting it.
      if ((splitCore === USE_CORE) || (splitCore === TRIM_CORE)) continue;

      core = SPLIT_CORE;
      diff = axis.coremax - axis.coremin;
      side = 0;
    } else if (input === axis.coremax) {
      // Always prefer to split an axis outside its core instead of trimming it.
      if (splitCore === USE_CORE) continue;
      // Cannot trim an exact match
      if (axis.coremin === axis.coremax) continue;

      core = TRIM_CORE;
      diff = axis.max - input;
      side = 1;
    } else  if (input === axis.coremin) {
      // Always prefer to split an axis outside its core instead of trimming it.
      if (splitCore === USE_CORE) continue;
      // Cannot trim an exact match
      if (axis.coremin === axis.coremax) continue;

      core = TRIM_CORE;
      diff = input - axis.min;
      side = -1;
    } else if (input > axis.coremax) {
      core = USE_CORE;
      diff = input - axis.coremax;
      side = 1;
    } else {
      core = USE_CORE;
      diff = axis.coremin - input;
      side = -1;
    }

    if (diff >= splitDiff) {
      // Always prefer to split farther away from the core.
      splitIndex = i;
      splitCore = core;
      splitDiff = diff;
      splitSide = side;
    }
  }

  return { index: splitIndex, side: splitSide };
}

function clonePerceptron(perceptron, inputs) {
  const clone = new Perceptron(perceptron.activation, perceptron.axis.map(one => new Axis(one.minInclusive, one.min, one.max, one.maxInclusive)));

  for (let i = 0; i < perceptron.axis.length; i++) {
    const axis = perceptron.axis[i];
    const copy = clone.axis[i];

    copy.coremin = inputs ? inputs[i] : axis.coremin;
    copy.coremax = inputs ? inputs[i] : axis.coremax;

    copy.minNeighbors = [];
    for (const neighbor of axis.minNeighbors) {
      copy.minNeighbors.push(neighbor);
      neighbor.axis[i].maxNeighbors.push(clone);
    }

    copy.maxNeighbors = [];
    for (const neighbor of axis.maxNeighbors) {
      copy.maxNeighbors.push(neighbor);
      neighbor.axis[i].minNeighbors.push(clone);
    }
  }

  return clone;
}

function updateAxisCore(axis, input) {
  let isCoreMinInInterval = axis.contains(axis.coremin);
  let isCoreMaxInInterval = axis.contains(axis.coremax);

  if (axis.contains(input)) {
    if (!isCoreMinInInterval || (input < axis.coremin)) {
      axis.coremin = input;
      isCoreMinInInterval = true;
    }

    if (!isCoreMaxInInterval || (input > axis.coremin)) {
      axis.coremax = input;
      isCoreMaxInInterval = true;
    }
  }

  if (!isCoreMinInInterval && !isCoreMaxInInterval) {
    axis.coremin = undefined;
    axis.coremax = undefined;
  } else if (!isCoreMaxInInterval) {
    axis.coremax = axis.coremin;
  } else if (!isCoreMinInInterval) {
    axis.coremin = axis.coremax;
  }
}
