import Conceptron from "../brain/conceptron.js";
import Sensor from "../brain/sensor.js";
import adjust from "./adjust.js";
import { updateNeighborsOnCreate } from "./neighbors.js";
import checkIntegrity from "../train/integrity.js";

export default class Session {

  constructor(brain, inputs, outputs) {
    this.brain = brain;
    this.sensors = sensors(brain, inputs);
    this.conceptrons = conceptrons(brain, this.sensors, outputs);
  }

  train(stream, millis) {
    const start = Date.now();
    let total = 0;
    let error = 0;

    while (Date.now() - start < millis) {
      const { input, output } = stream();
      let adjusted = false;

      feed(this, input);

      this.brain.process();

      for (let i = 0; i < output.length; i++) {
        if (adjust(this.conceptrons[i], input, output[i])) {
          adjusted = true;
        }
      }

      total++;
      if (adjusted) error++;
    }

    checkIntegrity(this.brain);

    return error / total;
  }

}

function sensors(brain, inputs) {
  const list = [];

  for (const property of inputs) {
    let sensor = brain.get(property);

    if (!sensor) {
      sensor = new Sensor(property);
      brain.add(sensor, 0);
    }

    list.push(sensor);
  }

  return list;
}

function conceptrons(brain, inputs, outputs) {
  const list = [];

  for (const concept of outputs) {
    let conceptron = brain.get(concept);

    if (!conceptron) {
      conceptron = new Conceptron(concept, inputs);
      brain.add(conceptron, 1);
    }

    list.push(conceptron);
  }

  for (const conceptron of list) {
    for (const perceptron of conceptron.perceptrons) {
      updateNeighborsOnCreate(perceptron);
    }
  }

  return list;
}

function feed(session, input) {
  for (let i = 0; i < input.length; i++) {
    session.sensors[i].activation = input[i];
  }
}
