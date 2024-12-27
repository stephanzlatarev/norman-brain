import merge from "./merge.js";
import split from "./split.js";

// Adjusts the perceptrons to produce the given activation for the given inputs
export default function adjustConceptron(conceptron, inputs, activation) {
  const positive = findPerceptron(conceptron.positive, inputs);
  const negative = findPerceptron(conceptron.negative, inputs);

  let transformed = false;

  if (!positive === !negative) {
    throw new Error("ERROR: Conceptron " + conceptron.label + " fault on input " + inputs.join());
  }

  if (activation) {
    if (positive) {
      adjustPerceptron(positive, inputs);
    } else if (canSplitPerceptron(negative, inputs)) {
      splitPerceptron(conceptron, negative, inputs);
      transformed = true;
    } else {
      convertPerceptron(conceptron, negative, inputs);
      transformed = true;
    }
  } else {
    if (negative) {
      adjustPerceptron(negative, inputs);
    } else if (canSplitPerceptron(positive, inputs)) {
      splitPerceptron(conceptron, positive, inputs);
      transformed = true;
    } else {
      convertPerceptron(conceptron, positive, inputs);
      transformed = true;
    }
  }

  return transformed;
}

function findPerceptron(perceptrons, inputs) {
  for (const perceptron of perceptrons) {
    if (perceptron.get(inputs)) {
      return perceptron;
    }
  }
}

function canSplitPerceptron(perceptron, inputs) {
  for (let i = 0; i < perceptron.axis.length; i++) {
    const axis = perceptron.axis[i];
    const input = inputs[i];

    // If the perceptron doesn't have a core, it cannot be split
    if ((axis.coremin === undefined) || (axis.coremax === undefined)) return false;

    // If the perceptron's core is more than the input, it can be split
    if ((axis.coremin !== input) || (axis.coremax !== input)) return true;
  }
}

function adjustAxis(axis, input) {
  if (!(axis.coremin <= input)) axis.coremin = input;
  if (!(axis.coremax >= input)) axis.coremax = input;
}

function adjustPerceptron(perceptron, inputs) {
  for (let i = 0; i < inputs.length; i++) {
    adjustAxis(perceptron.axis[i], inputs[i]);
  }
}

function convertPerceptron(conceptron, perceptron, inputs) {
  if (perceptron.positive) {
    perceptron.positive = false;
    conceptron.negative.add(perceptron);
    conceptron.positive.delete(perceptron);
  } else {
    perceptron.positive = true;
    conceptron.positive.add(perceptron);
    conceptron.negative.delete(perceptron);
  }

  adjustPerceptron(perceptron, inputs);
  merge(conceptron, [perceptron]);
}

function splitPerceptron(conceptron, perceptron, inputs) {
  const siblings = split(conceptron, perceptron, inputs);

  merge(conceptron, siblings);
}
