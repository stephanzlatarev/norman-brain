
let ids = 1;

export default class Perceptron {

  activation;
  axis;

  constructor(axis, activation) {
    this.activation = activation;
    this.axis = axis || [];
    this.label = "#" + (ids++);
  }

  covers(inputs) {
    for (let i = 0; i < this.axis.length; i++) {
      if (!this.axis[i].contains(inputs[i])) {
        return false;
      }
    }

    return true;
  }

}
