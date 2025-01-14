import Brain from "../brain/brain.js";
import display from "../train/display.js";
import Session from "../train/session.js";

const brain = new Brain();
const session = new Session(brain, ["A", "B"], ["AND", "OR", "XOR", "NOT"]);

function data() {
  const a = Math.round(Math.random() * 100) / 100;
  const aa = Math.round(a);
  const b = Math.round(Math.random() * 100) / 100;
  const bb = Math.round(b);

  const and = (aa === 1) && (bb === 1);
  const or = (aa === 1) || (bb === 1);
  const xor = (aa !== bb);
  const not = aa ? 0 : 1;

  return { input: [a, b], output: [and, or, xor, not] };
}

session.train(data, 3000);

display(brain, ["AND", "OR", "XOR", "NOT"], 0, 1);
