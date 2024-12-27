
import { conceptronToString } from "./text.js";

const DISPLAY_SIZE = 10;

export default function(brain, properties, concepts, min, max) {
  if (properties.length !== 2) return console.log("Display works with exactly 2 properties!");

  const sensors = properties.map(property => brain.get(property));
  const conceptrons = concepts.map(concept => brain.get(concept));

  for (const conceptron of conceptrons) {
    console.log("=====");
    console.log(conceptronToString(conceptron));

    const header = ["   "];
    for (let x = 0; x <= DISPLAY_SIZE; x++) {
      header.push(cell(value(x, min, max)));
    }

    for (let y = DISPLAY_SIZE; y >= 0; y--) {
      const line = [cell(value(y, min, max))];

      for (let x = 0; x <= DISPLAY_SIZE; x++) {
        sensors[0].activation = value(x, min, max);
        sensors[1].activation = value(y, min, max);

        brain.process();

        const perceptrons = conceptron.activation ? conceptron.positive : conceptron.negative;
        const activePerceptron = [...perceptrons].find(p => !!p.activation);

        if (!activePerceptron) {
          line.push("????");
        } else if (conceptron.activation) {
          line.push(id("+", activePerceptron.label.slice(1)));
        } else {
          line.push(id("-", activePerceptron.label.slice(1)));
        }
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

function id(prefix, value) {
  if (value < 0) return "????";
  if (value < 10) return prefix + prefix + prefix + Math.floor(value);
  if (value < 100) return prefix + prefix + Math.floor(value);
  return prefix + Math.floor(value % 1000);
}
