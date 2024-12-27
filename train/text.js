
export function conceptronToString(conceptron) {
  const text = [conceptron.label, ":"];

  for (const neuron of conceptron.neurons) {
    text.push(neuron.label);
  }

  text.push("\r\n" + conceptron.positive.size, "positive perceptrons:");
  for (const perceptron of conceptron.positive) {
    text.push("\r\n ");
    text.push(perceptronToString(perceptron));
  }

  text.push("\r\n" + conceptron.negative.size, "negative perceptrons:");
  for (const perceptron of conceptron.negative) {
    text.push("\r\n ");
    text.push(perceptronToString(perceptron));
  }
  text.push("\r\n");

  return text.join(" ");
}

export function perceptronToString(perceptron) {
  if (!perceptron) return "-";

  return (perceptron.positive ? "+" : "-") + " " + perceptron.label + ": " +
    perceptron.axis.map(axis => (
      "<" + axis.minNeighbors.map(one => one.label).join(",") + "> " +
      axisToString(axis) +
      " <" + axis.maxNeighbors.map(one => one.label).join(",") + ">"
    )).join(" | ");
}

export function axisToString(axis) {
  const line = [];

  line.push((axis.minInclusive ? "[" : "(") + point(axis.min));

  if ((axis.coremin !== undefined) || (axis.coremax !== undefined)) {
    line.push(point(axis.coremin));
    line.push(point(axis.coremax));
  }

  line.push(point(axis.max) + (axis.maxInclusive ? "]" : ")"));

  return line.join(", ");
}

function point(value) {
  if (value === -Infinity) return "-∞";
  if (value === Infinity) return "+∞";
  if (value < Infinity) return value.toFixed(2);
  return "?";
}
