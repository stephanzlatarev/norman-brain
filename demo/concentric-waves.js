import Brain from "../brain/brain.js";
import display from "../train/display.js";
import Session from "../train/session.js";

const brain = new Brain();
const session = new Session(brain, ["x", "y"], ["Wave"]);

function data() {
  while (true) {
    const x = Math.random();
    const y = Math.random();

    const distance = Math.sqrt((x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5));
    const phase = Math.floor(distance * 20) % 4;

    if ((phase > 1) && (phase < 1.5)) continue;
    if ((phase > 2.5) && (phase < 3)) continue;

    const wave = ((phase >= 1.5) && (phase <= 2.5)) ? 1 : 0;

    return { input: [x, y], output: [wave] };
  }
}

session.train(data, 3000);

display(brain, ["Wave"], 0, 1);
