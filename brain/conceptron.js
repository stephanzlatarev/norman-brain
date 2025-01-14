import Axis from "./axis.js";
import Neuron from "./neuron.js";
import Perceptron from "./perceptron.js";

export default class Conceptron extends Neuron {

  // Input neutrons for the concept
  neurons = [];

  // Positive perceptrons. The conceptron activates when at least one positive pereptron activates
  positive = new Set();

  // Negative perceptrons. These do not activate the perceptron. They limit the positive perceptrons.
  negative = new Set();

  constructor(concept, neurons) {
    super(concept);

    for (const neuron of neurons) {
      this.neurons.push(neuron);
    }

    this.negative.add(new Perceptron(this.neurons.map(neuron => new Axis(true, -Infinity, Infinity, true))));
  }

  perceptron(inputs) {
    for (const perceptron of [...this.positive, ...this.negative]) {
      if (perceptron.covers(inputs)) {
        return perceptron;
      }
    }
  }

  process() {
    this.activation = this.perceptron(this.neurons.map(neuron => neuron.activation)).positive ? 1 : 0;
  }

}
