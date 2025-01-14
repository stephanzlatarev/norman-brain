import Brain from "../brain/brain.js";
import adjust from "../train/adjust.js";
import Session from "../train/session.js";
import checkIntegrity from "../train/integrity.js";
import { conceptronToString } from "../train/text.js";

const tests = {

  // The entire interval is initally undefined
  "{} => [-∞, +∞]=undefined" : function(conceptron) {
    assertActivations(conceptron, 0, 1, [undefined, undefined, undefined]);
  },

  // Negative samples only keep the entire interval negative
  "{2=0, 0=0, 1=0} => [-∞, +∞]=0" : function(conceptron) {
    activate(conceptron, [2, 0], [0, 0], [1, 0]);
    assertActivations(conceptron, 0, 1, [0, 0, 0, 0, 0]);
  },

  // Positive samples without previous negative ones convert the entire interval to positive
  "{1=1} => [-∞, +∞]=1" : function(conceptron) {
    activate(conceptron, [1, 1]);
    assertActivations(conceptron, 1, 0, [1, 1, 1]);
  },
  "{2=1, 0=1, 1=1} => [-∞, +∞]=1" : function(conceptron) {
    activate(conceptron, [2, 1], [0, 1], [1, 1]);
    assertActivations(conceptron, 1, 0, [1, 1, 1, 1, 1]);
  },

  // Opposing samples on the right side of the core convert the right side
  "{2=0, 5=1} => [-∞, 5)=0, [5, +∞]=1" : function(conceptron) {
    activate(conceptron, [2, 0], [5, 1]);
    assertActivations(conceptron, 1, 1, [0, 0, 0, 0, 0, 1, 1]);
  },
  "{2=1, 5=0} => [-∞, 5)=1, [5, +∞]=0" : function(conceptron) {
    activate(conceptron, [2, 1], [5, 0]);
    assertActivations(conceptron, 1, 1, [1, 1, 1, 1, 1, 0, 0]);
  },
  "{1=0, 2=0, 5=1} => [-∞, 5)=0, [5, +∞]=1" : function(conceptron) {
    activate(conceptron, [1, 0], [2, 0], [5, 1]);
    assertActivations(conceptron, 1, 1, [0, 0, 0, 0, 0, 1, 1]);
  },
  "{1=1, 2=1, 5=0} => [-∞, 5)=1, [5, +∞]=0" : function(conceptron) {
    activate(conceptron, [1, 1], [2, 1], [5, 0]);
    assertActivations(conceptron, 1, 1, [1, 1, 1, 1, 1, 0, 0]);
  },

  // Opposing samples on the left side of the core convert the left side
  "{4=0, 2=1} => [-∞, 2]=1, (2, +∞]=0" : function(conceptron) {
    activate(conceptron, [4, 0], [2, 1]);
    assertActivations(conceptron, 1, 1, [1, 1, 1, 0, 0, 0, 0]);
  },
  "{4=1, 2=0} => [-∞, 2]=0, (2, +∞]=1" : function(conceptron) {
    activate(conceptron, [4, 1], [2, 0]);
    assertActivations(conceptron, 1, 1, [0, 0, 0, 1, 1, 1, 1]);
  },
  "{5=0, 4=0, 2=1} => [-∞, 2]=1, (2, +∞]=0" : function(conceptron) {
    activate(conceptron, [5, 0], [4, 0], [2, 1]);
    assertActivations(conceptron, 1, 1, [1, 1, 1, 0, 0, 0, 0]);
  },
  "{5=1, 4=1, 2=0} => [-∞, 2]=0, (2, +∞]=1" : function(conceptron) {
    activate(conceptron, [5, 1], [4, 1], [2, 0]);
    assertActivations(conceptron, 1, 1, [0, 0, 0, 1, 1, 1, 1]);
  },

  // One opposing sample inside the core splits the perceprton with a dot
  "{1=0, 6=0, 3=1} => [-∞, 3)=0, [3, 3]=1, (3, +∞]=0" : function(conceptron) {
    activate(conceptron, [1, 0], [6, 0], [3, 1]);
    assertActivations(conceptron, 1, 2, [0, 0, 0, 1, 0, 0, 0, 0, 0]);
  },
  "{1=1, 6=1, 3=0} => [-∞, 3)=0, [3, 3]=1, (3, +∞]=0" : function(conceptron) {
    activate(conceptron, [1, 1], [6, 1], [3, 0]);
    assertActivations(conceptron, 2, 1, [1, 1, 1, 0, 1, 1, 1, 1, 1]);
  },

  // One opposing sample inside the core splits the perceprton with an interval
  "{1=0, 6=0, 3=1, 4=1} => [-∞, 3)=0, [3, 4]=1, (4, +∞]=0" : function(conceptron) {
    activate(conceptron, [1, 0], [6, 0], [3, 1], [4, 1]);
    assertActivations(conceptron, 1, 2, [0, 0, 0, 1, 1, 0, 0, 0, 0]);
  },

  // Consequtive samples that expand the perceptron interval
  "{0=0, 5=1, 4=1, 3=1, 2=1} => [-∞, 2)=0, [2, +∞]=1" : function(conceptron) {
    activate(conceptron, [0, 0], [5, 1]);
    assertActivations(conceptron, 1, 1, [0, 0, 0, 0, 0, 1]);
    activate(conceptron, [4, 1]);
    assertActivations(conceptron, 1, 1, [0, 0, 0, 0, 1, 1]);
    activate(conceptron, [3, 1]);
    assertActivations(conceptron, 1, 1, [0, 0, 0, 1, 1, 1]);
    activate(conceptron, [2, 1]);
    assertActivations(conceptron, 1, 1, [0, 0, 1, 1, 1, 1]);
  },

  // Conflicting sample at end of interval
  "{0=0, 6=0, 2=1, 4=1, 3=1, 2=0, 3=1, 4=0} => [-∞, 2]=0, (2, 4)=1, [4, +∞]=0" : function(conceptron) {
    activate(conceptron, [0, 0], [6, 0], [2, 1], [4, 1]);
    assertActivations(conceptron, 1, 2, [0, 0, 1, 1, 1, 0, 0]);
    activate(conceptron, [3, 1], [2, 0]);
    assertActivations(conceptron, 1, 2, [0, 0, 0, 1, 1, 0, 0]);
    activate(conceptron, [3, 1], [4, 0]);
    assertActivations(conceptron, 1, 2, [0, 0, 0, 1, 0, 0, 0]);
  },

  // Alternative activations by enumeration
  "{1=A, 2=B, 3=C} => [-∞, 2)=A, [2, 2]=B, (2, +∞]=C" : function(conceptron) {
    activate(conceptron, [1, "A"], [2, "B"], [3, "C"]);
    assertActivations(conceptron, 3, 0, ["A", "A", "B", "C", "C"]);
  },

  // Square root by enumeration
  "{0=0, 1=1, 3=1, 4=2, 8=2, 9=3} => [-∞, 1)=0, [1, 4)=1, [4, 9)=2, [9, +∞]=3" : function(conceptron) {
    activate(conceptron, [0, 0], [1, 1], [3, 1], [4, 2], [8, 2], [9, 3]);
    assertActivations(conceptron, 3, 1, [0, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3]);
  },

};

function activate(conceptron, ...samples) {
  for (const [input, activation] of samples) {
    adjust(conceptron, [input], activation);
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

  assertOneActivation(conceptron, "-∞", -Number.MAX_VALUE, activations[0]);
  for (let i = 0; i < activations.length; i++) {
    assertOneActivation(conceptron, i, i, activations[i]);
  }
  assertOneActivation(conceptron, "∞", Number.MAX_VALUE, activations[activations.length - 1]);
}

function assertOneActivation(conceptron, label, input, expected) {
  let activated;

  for (const perceptron of conceptron.perceptrons) {
    if (perceptron.covers([input])) {
      if (activated) {
        fail("More than one perceptron activate for", label);
      } else {
        activated = perceptron;
      }
    }
  }

  if (!activated) {
    fail("No perceptron activates for", label);
  } else if (activated.activation !== expected) {
    fail("Wrong perceptron activates for", label);
  }
}

for (const name in tests) {
  console.log("===========");
  console.log("Test:", name);
  console.log();

  const brain = new Brain();
  new Session(brain, ["IN"], ["OUT"]);
  const conceptron = brain.get("OUT");

  tests[name](conceptron);

  console.log(conceptronToString(conceptron));
  checkIntegrity(brain);
}
