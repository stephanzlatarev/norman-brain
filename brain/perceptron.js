
let ids = 1;

export default class Perceptron {

  positive = false;
  axis = [];

  constructor(axis) {
    this.axis = axis;
    this.label = "#" + (ids++);
  }

  process(neurons) {
    this.activation = this.get(neurons.map(neuron => neuron.activation));
  }

  get(inputs) {
    for (let i = 0; i < this.axis.length; i++) {
      if (!this.axis[i].get(inputs[i])) {
        return false;
      }
    }

    return true;
  }

}
