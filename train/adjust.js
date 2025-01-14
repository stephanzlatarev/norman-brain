import merge from "./merge.js";
import split from "./split.js";

// Adjusts the perceptrons to produce the given activation for the given inputs
export default function adjustConceptron(conceptron, inputs, activation) {
  const perceptron = conceptron.perceptron(inputs);
  if (!perceptron) throw new Error("ERROR: Conceptron " + conceptron.label + " fault on input " + inputs.join());

  if (perceptron.activation === activation) {
    adjustPerceptron(perceptron, inputs);

    // The conceptron is not transformed
    return false;
  }

  if (canSplitPerceptron(perceptron, inputs)) {
    splitPerceptron(conceptron, perceptron, inputs, activation);
  } else {
    convertPerceptron(conceptron, perceptron, inputs, activation);
  }

  // The conceptron is either split or converted
  return true;
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

function convertPerceptron(conceptron, perceptron, inputs, activation) {
  perceptron.activation = activation;

  adjustPerceptron(perceptron, inputs);
  merge(conceptron, [perceptron]);
}

function splitPerceptron(conceptron, perceptron, inputs, activation) {
  const siblings = split(conceptron, perceptron, inputs, activation);

  merge(conceptron, siblings);
}
