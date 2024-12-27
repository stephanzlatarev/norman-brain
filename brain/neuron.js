
let ids = 1;

export default class Neuron {

  // Unique identifier
  id;

  // Unique textual label
  label;

  // The activation of this neuron may be a number from -Infinity to +Infinity.
  activation = 0;

  constructor(label) {
    this.id = ids++;
    this.label = label ? label : "#" + this.id;
  }

  // Calculates the activation of this neuron.
  process() {}

}
