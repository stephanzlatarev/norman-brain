import Axis from "./axis.js";
import Neuron from "./neuron.js";
import Perceptron from "./perceptron.js";

export default class Conceptron extends Neuron {

  // Input neutrons for the concept
  neurons = [];

  // Perceptrons split the space of input from the neurons by activation.
  perceptrons = new Set();

  constructor(concept, neurons) {
    super(concept);

    for (const neuron of neurons) {
      this.neurons.push(neuron);
    }

    this.perceptrons.add(new Perceptron(false, this.neurons.map(neuron => new Axis(true, -Infinity, Infinity, true))));
  }

  perceptron(inputs) {
    for (const perceptron of this.perceptrons) {
      if (perceptron.covers(inputs)) {
        return perceptron;
      }
    }
  }

  process() {
    this.activation = this.perceptron(this.neurons.map(neuron => neuron.activation)).activation;
  }

}
