
export default class Brain {

  layers = [new Map()];

  add(neuron, layer) {
    layer = layer || 0;

    if (!(layer >= 0)) throw new Error("Layer must be >= 0");

    while (layer >= this.layers.length) this.layers.push(new Map());

    this.layers[layer].set(neuron.label, neuron);
  }

  get(label) {
    for (const layer of this.layers) {
      const neuron = layer.get(label);

      if (neuron) return neuron;
    }
  }

  process() {
    for (const layer of this.layers) {
      for (const neuron of layer.values()) {
        neuron.process();
      }
    }
  }

}
