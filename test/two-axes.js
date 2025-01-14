import Brain from "../brain/brain.js";
import adjust from "../train/adjust.js";
import Session from "../train/session.js";
import checkIntegrity from "../train/integrity.js";
import { conceptronToString } from "../train/text.js";

const tests = {

  // TODO: Test core is not copied into opposite perceptrons. Fixed defect

  "splits in one axis only" : function(conceptron) {
    activate(conceptron, [8, 0, 1], [6, 0, 0], [2, 0, 0], [4, 0, 1]);
    assertActivations(conceptron, 2, 2, [
      [0, 0, 0, 0, 1, 0, 0, 1, 1],
    ]);
  },

  "logical and" : function(conceptron) {
    activate(conceptron, [1, 1, 1], [0, 1, 0], [1, 0, 0]);
    assertActivations(conceptron, 1, 2, [
      [0, 0],
      [0, 1],
    ]);
  },

  "split the handle of a fork" : function(conceptron) {
    activate(conceptron, [8, 0, 1], [6, 0, 0], [8, 1, 0], [2, 0, 0], [4, 0, 1]);
    assertActivations(conceptron, 2, 3, [
      [0, 0, 0, 0, 1, 0, 0, 1, 1],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
    ]);
  },

  "two-way split one fork along" : function(conceptron) {
    activate(conceptron, [1, 1, 1], [0, 1, 0], [1, 0, 0], [3, 1, 0]);
    assertActivations(conceptron, 1, 3, [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
    ]);
  },

  "two-way split one fork across" : function(conceptron) {
    activate(conceptron, [1, 1, 1], [0, 1, 0], [1, 0, 0], [1, 3, 0]);
    assertActivations(conceptron, 1, 3, [
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 0],
    ]);
  },

  "three-way split one fork along" : function(conceptron) {
    activate(conceptron, [1, 1, 1], [0, 1, 0], [1, 0, 0], [5, 1, 1], [3, 1, 0]);
    assertActivations(conceptron, 2, 3, [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 1, 1],
    ]);
  },

  "three-way split one bound fork along" : function(conceptron) {
    activate(conceptron, [1, 1, 1], [0, 1, 0], [1, 0, 0], [6, 1, 0], [5, 1, 1], [3, 1, 0]);
    assertActivations(conceptron, 2, 4, [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 1, 1, 0],
    ]);
  },

  "three-way split one fork across" : function(conceptron) {
    activate(conceptron, [1, 1, 1], [0, 1, 0], [1, 0, 0], [1, 5, 1]);
    assertActivations(conceptron, 1, 2, [
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
    ]);

    activate(conceptron, [1, 3, 0]);
    assertActivations(conceptron, 2, 3, [
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 0],
      [0, 1],
      [0, 1],
    ]);
  },

  "three-way split one bound fork across" : function(conceptron) {
    activate(conceptron, [1, 1, 1], [0, 1, 0], [1, 0, 0], [1, 6, 0], [1, 5, 1]);
    assertActivations(conceptron, 1, 3, [
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 0],
    ]);

    activate(conceptron, [1, 3, 0]);
    assertActivations(conceptron, 2, 4, [
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 0],
    ]);
  },

  // Test that perceptrons with core that fully match an opposite sample are not split. Fixed defect
  "no split when perceptron core fully matches opposing sample" : function(conceptron) {
    activate(conceptron, [0, 1, 0], [1, 1, 1]);
    assertActivations(conceptron, 1, 1, [
      [0, 1],
      [0, 1],
      [0, 1],
    ]);
    activate(conceptron, [1, 1, 0]);
    assertActivations(conceptron, 0, 1, [
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
  },

  // Test that perceptrons with core that partially match an opposite sample are split at another axis. Fixed defect
  "no split when perceptron core partially matches opposing sample - 1" : function(conceptron) {
    activate(conceptron, [1, 0, 0], [1, 1, 1], [1, 2, 1]);
    assertActivations(conceptron, 1, 1, [
      [0, 0, 0],
      [1, 1, 1],
    ]);
    activate(conceptron, [1, 1, 0]);
    assertActivations(conceptron, 1, 1, [
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1],
    ]);
  },
  "no split when perceptron core partially matches opposing sample - 2" : function(conceptron) {
    activate(conceptron, [0, 1, 0], [1, 1, 1], [2, 1, 1]);
    assertActivations(conceptron, 1, 1, [
      [0, 1],
      [0, 1],
      [0, 1],
    ]);
    activate(conceptron, [1, 1, 0]);
    assertActivations(conceptron, 1, 1, [
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
    ]);
  },
};

function activate(conceptron, ...samples) {
  for (const sample of samples) {
    const input = sample.slice(0, sample.length - 1);
    const activation = sample[sample.length - 1];

    adjust(conceptron, input, activation);
  }
}

function fail(...message) {
  console.log("ERROR:", ...message);
  process.exit(1);
}

function assertEquals(actual, expected, ...message) {
  if (actual !== expected) {
    fail(...message, "\r\n", "actual:", actual, "expected:", expected);
  }
}

function assertActivations(conceptron, positive, negative, activations) {
  assertEquals(conceptron.perceptrons.size, positive + negative, "Number of perceptrons don't match");
  assertEquals([...conceptron.perceptrons].filter(perceptron => !!perceptron.activation).length, positive, "Number of positive perceptrons don't match");
  assertEquals([...conceptron.perceptrons].filter(perceptron => !perceptron.activation).length, negative, "Number of negative perceptrons don't match");

  assertRowActivation(conceptron, "-∞", -Number.MAX_VALUE, activations[0]);
  for (let y = 0; y < activations.length; y++) {
    assertRowActivation(conceptron, y, y, activations[y]);
  }
  assertRowActivation(conceptron, "∞", Number.MAX_VALUE, activations[activations.length - 1]);
}

function assertRowActivation(conceptron, label, y, row) {
  assertOneActivation(conceptron, "-∞:" + label, -Number.MAX_VALUE, y, !!row[0]);
  for (let x = 0; x < row.length; x++) {
    assertOneActivation(conceptron, x + ":" + label, x, y, !!row[x]);
  }
  assertOneActivation(conceptron, "∞:" + label, Number.MAX_VALUE, y, !!row[row.length - 1]);
}

function assertOneActivation(conceptron, label, x, y, expected) {
  let activated;

  for (const perceptron of conceptron.perceptrons) {
    if (perceptron.covers([x, y])) {
      if (activated) {
        fail("More than one perceptron activate for", label);
      } else {
        activated = perceptron;
      }
    }
  }

  if (!activated) {
    fail("No perceptron activates for", label);
  } else if (!!activated.activation !== !!expected) {
    fail("Wrong perceptron activates for", label);
  }
}

for (const name in tests) {
  console.log("===========");
  console.log("Test:", name);
  console.log();

  const brain = new Brain();
  new Session(brain, ["A", "B"], ["OUT"]);
  const conceptron = brain.get("OUT");

  tests[name](conceptron);

  console.log(conceptronToString(conceptron));
  checkIntegrity(brain);
}
