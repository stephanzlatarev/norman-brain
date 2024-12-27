import Neuron from "./neuron.js";

export default class Sensor extends Neuron {

  constructor(property) {
    super(property);
  }

  set(activation) {
    this.activation = activation;
  }

}
