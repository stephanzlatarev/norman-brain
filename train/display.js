
import { conceptronToString } from "./text.js";

const DISPLAY_SIZE = 10;

export default function(brain, concepts, min, max) {
  const conceptrons = concepts.map(concept => brain.get(concept));

  for (const conceptron of conceptrons) {
    console.log("=====");
    console.log(conceptronToString(conceptron));

    if (conceptron.neurons.length !== 2) {
      console.log("This conceptron connects to", conceptron.neurons.length, "neurons!");
      continue;
    }

    const header = ["   "];
    for (let x = 0; x <= DISPLAY_SIZE; x++) {
      header.push(cell(value(x, min, max)));
    }

    for (let y = DISPLAY_SIZE; y >= 0; y--) {
      const line = [cell(value(y, min, max))];

      for (let x = 0; x <= DISPLAY_SIZE; x++) {
        const perceptron = conceptron.perceptron([value(x, min, max), value(y, min, max)]);

        line.push(id(perceptron.activation ? "#" : "-", perceptron.label.slice(1)));
      }

      console.log(line.join(" "));
    }

    console.log(header.join(" "));
    console.log();
  }
}

function value(value, min, max) {
  return min + (max - min) * value / DISPLAY_SIZE;
}

function cell(value) {
  if (value === true) {
    return "###";
  } else if (value && value.toFixed) {
    return value.toFixed(1);
  }

  return " . ";
}

function id(prefix, label) {
  const value = label % 1000;
  if (value < 0) return "????";
  if (value < 10) return prefix + prefix + prefix + Math.floor(value);
  if (value < 100) return prefix + prefix + Math.floor(value);
  return prefix + value;
}
