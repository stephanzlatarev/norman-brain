import { conceptronToString, perceptronToString } from "./text.js";

// Verifies the integrity of the given brain and terminates the process if integrity is not ok.
// Every connected neuron must be in the brain.
// The connections of each neuron in the brain must be in lower layer neurons.
// The neighbors of perceptrons must have connecting intervals without overlapping.
export default function(brain) {
  checkLabels(brain);
  checkConnections(brain);
  checkPerceptrons(brain);
}

function fail(...message) {
  console.log("ERROR: Brain integrity is not ok:", ...message);
  console.trace();
  process.exit(0);
}

function failConceptron(conceptron, ...message) {
  console.log();
  console.log(conceptronToString(conceptron));
  fail("Conceptron", conceptron.label, ...message);
}

function failPerceptronAxis(conceptron, perceptron, ...message) {
  failConceptron(conceptron, "Axis of perceptron", perceptronToString(perceptron), ...message);
}

function checkLabels(brain) {
  for (const layer of brain.layers) {
    for (const neuron of layer.values()) {
      if (!neuron.label) {
        fail("A neuron has no label!");
      }
      if (neuron !== brain.get(neuron.label)) {
        fail("Neuron", neuron.label, "is unknown!");
      }
    }
  }
}

function checkConnections(brain) {
  for (let i = 0; i < brain.layers.length; i++) {
    const layer = brain.layers[i];

    for (const neuron of layer.values()) {
      if (neuron.neurons) {
        if (i === 0) {
          fail("Neuron", neuron.label, "of layer", i, "shouldn't connect to neuron", neuron.label);
        }

        for (const input of neuron.neurons) {
          if (input !== brain.get(input.label)) {
            fail("Neuron", neuron.label, "connects to unknown neuron", input);
          }

          const j = getLayerOfNeuron(brain, input);
          if (!(i > j)) {
            fail("Neuron", neuron.label, "of layer", i, "connects to neuron", input, "of layer", j);
          }
        }
      }
    }
  }
}

function getLayerOfNeuron(brain, neuron) {
  for (let i = 0; i < brain.layers.length; i++) {
    const layer = brain.layers[i];

    if (brain.get(neuron.label)) {
      return i;
    }
  }
}

function checkPerceptrons(brain) {
  for (const layer of brain.layers) {
    for (const neuron of layer.values()) {
      if (neuron.neurons) {
        checkConceptron(neuron);
      }
    }
  }
}

function checkConceptron(conceptron) {
  if (!conceptron.perceptrons) failConceptron(conceptron, "has no perceptrons!");

  const perceptrons = [...conceptron.perceptrons];

  for (const perceptron of perceptrons) {
    if (perceptron.axis.length !== conceptron.neurons.length) failPerceptronAxis(conceptron, perceptron, "count doesn't match!");

    for (let i = 0; i < perceptron.axis.length; i++) {
      const axis = perceptron.axis[i];

      if ((axis.min < axis.max) || ((axis.min === axis.max) && axis.minInclusive && axis.maxInclusive)) {
        // Interval is good
      } else {
        failPerceptronAxis(conceptron, perceptron, "has bad interval!");
      }

      if ((axis.coremin !== undefined) || (axis.coremax !== undefined)) {
        if ((axis.coremin > axis.min) || ((axis.coremin === axis.min) && axis.minInclusive)) {
          // Core is within min interval
        } else {
          failPerceptronAxis(conceptron, perceptron, "core [" + axis.coremin + ":" + axis.coremax + "] is outside min interval!");
        }

        if ((axis.coremax < axis.max) || ((axis.coremax === axis.max) && axis.maxInclusive)) {
          // Core is within max interval
        } else {
          failPerceptronAxis(conceptron, perceptron, "core [" + axis.coremin + ":" + axis.coremax + "] is outside max interval!");
        }
      }

      if (axis.min === -Infinity) {
        if (!axis.minInclusive) failPerceptronAxis(conceptron, perceptron, "interval is from -Infinity but doesn't include it!");
        if (axis.minNeighbors.length) failPerceptronAxis(conceptron, perceptron, "has neighbors beyond infinity!");
      } else {
        if (!axis.minNeighbors.length) failPerceptronAxis(conceptron, perceptron, "has no neighbors towards infinity!");
      }

      for (const neighbor of axis.minNeighbors) {
        if (!perceptrons.find(one => (one === neighbor))) failPerceptronAxis(conceptron, perceptron, "min neighbor", neighbor.label, "unknown axis!");
        if (!neighbor.axis[i].maxNeighbors.find(one => (one === perceptron))) failPerceptronAxis(conceptron, perceptron, "min neighbor", neighbor.label, "is not mutual!");
        if (neighbor.axis[i].max !== axis.min) failPerceptronAxis(conceptron, perceptron, "min neighbor", neighbor.label, "doesn't touch!");
        if (neighbor.axis[i].maxInclusive === axis.minInclusive) failPerceptronAxis(conceptron, perceptron, "min neighbor", neighbor.label, "overlap!");

        for (let j = 0; j < perceptron.axis.length; j++) {
          if ((j !== i) && !perceptron.axis[j].touches(neighbor.axis[j])) failPerceptronAxis(conceptron, perceptron, "min neighbor", neighbor.label, "doesn't connect!");
        }
      }

      for (const neighbor of axis.maxNeighbors) {
        if (!perceptrons.find(one => (one === neighbor))) failPerceptronAxis(conceptron, perceptron, "max neighbor", neighbor.label, "is of unknown axis!");
        if (!neighbor.axis[i].minNeighbors.find(one => (one === perceptron))) failPerceptronAxis(conceptron, perceptron, "max neighbor", neighbor.label, "is not mutual!");
        if (neighbor.axis[i].min !== axis.max) failPerceptronAxis(conceptron, perceptron, "max neighbor", neighbor.label, "doesn't touch!");
        if (neighbor.axis[i].minInclusive === axis.maxInclusive) failPerceptronAxis(conceptron, perceptron, "max neighbor", neighbor.label, "overlap!");

        for (let j = 0; j < perceptron.axis.length; j++) {
          if ((j !== i) && !perceptron.axis[j].touches(neighbor.axis[j])) failPerceptronAxis(conceptron, perceptron, "max neighbor", neighbor.label, "doesn't connect!");
        }
      }

      if (axis.max === Infinity) {
        if (!axis.maxInclusive) failPerceptronAxis(conceptron, perceptron, "interval is to Infinity but doesn't include it!");
        if (axis.maxNeighbors.length) failPerceptronAxis(conceptron, perceptron, "has neighbors beyond infinity!");
      } else {
        if (!axis.maxNeighbors.length) failPerceptronAxis(conceptron, perceptron, "has no neighbors towards infinity!");
      }
    }
  }
}
