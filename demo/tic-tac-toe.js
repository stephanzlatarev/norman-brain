import Brain from "../brain/brain.js";
import readline from "readline";
import Session from "../train/session.js";

const PLAYERS = ["Human", "norman"];

function win(board) {
  if ((board[0] >= 0) && (board[0] === board[1]) && (board[1] === board[2])) return board[0];
  if ((board[3] >= 0) && (board[3] === board[4]) && (board[4] === board[5])) return board[3];
  if ((board[6] >= 0) && (board[6] === board[7]) && (board[7] === board[8])) return board[6];

  if ((board[0] >= 0) && (board[0] === board[3]) && (board[3] === board[6])) return board[0];
  if ((board[1] >= 0) && (board[1] === board[4]) && (board[4] === board[7])) return board[1];
  if ((board[2] >= 0) && (board[2] === board[5]) && (board[5] === board[8])) return board[2];

  if ((board[4] >= 0) && (board[0] === board[4]) && (board[4] === board[8])) return board[4];
  if ((board[4] >= 0) && (board[2] === board[4]) && (board[4] === board[6])) return board[4];

  return -1;
}

function show(board) {
  const p = [];
  for (let i = 0; i < board.length; i++) {
    p.push(piece(board, i));
  }

  console.log("@@@@@@@@@@@@@");
  console.log("@   @   @   @");
  console.log(`@ ${p[0]} @ ${p[1]} @ ${p[2]} @`);
  console.log("@   @   @   @");
  console.log("@@@@@@@@@@@@@");
  console.log("@   @   @   @");
  console.log(`@ ${p[3]} @ ${p[4]} @ ${p[5]} @`);
  console.log("@   @   @   @");
  console.log("@@@@@@@@@@@@@");
  console.log("@   @   @   @");
  console.log(`@ ${p[6]} @ ${p[7]} @ ${p[8]} @`);
  console.log("@   @   @   @");
  console.log("@@@@@@@@@@@@@");
}

function piece(board, index) {
  if (board[index] === 0) return "X";
  if (board[index] === 1) return "O";
  return index + 1;
}

let selection;
readline.emitKeypressEvents(process.stdin);
if (process.stdin.setRawMode) process.stdin.setRawMode(true);
process.stdin.on("keypress", function(_, key) {
  if (key.name === "escape") process.exit(0);
  selection = Number(key.name) - 1;
});

async function takeHumanTurn(board) {
  console.log("Press 1-9 to play! Pres Esc to quit.");

  selection = null;

  while (board[selection] !== -1) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  board[selection] = 0;

  return selection;
}

const BOARD_SENSORS = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"];
const PLAY_CONCEPTS = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"];
const brain = new Brain();
const session = new Session(brain, BOARD_SENSORS, PLAY_CONCEPTS);

const trainingBoard = [-1, -1, -1, -1, -1, -1, -1, -1, -1];

function train() {
  while (true) {
    // Prepare next board
    for (let index = 0; index < trainingBoard.length; index++) {
      if (trainingBoard[index] < 1) {
        trainingBoard[index]++;
        break;
      } else {
        trainingBoard[index] = -1;
      }
    }

    let human = 0;
    let norman = 0;
    for (const one of trainingBoard) {
      if (one === 0) {
        human++;
      } else if (one === 1) {
        norman++;
      }
    }

    if (trainingBoard[4] < 0) {
      // Center is free.
      if ((human === 1) && (norman === 0)) {
        // Place my first piece there.
        return { input: trainingBoard, output: [0, 0, 0, 0, 1, 0, 0, 0, 0] };
      }
    } else {
      // Center is taken.
      if ((human + norman < 9) && (human - norman === 1) && (win(trainingBoard) < 0)) {
        // If any move wins the game, then take that move.
        for (let i = 0; i < trainingBoard.length; i++) {
          if (trainingBoard[i] >= 0) continue;

          const future = [...trainingBoard];

          future[i] = 0;
          if (win(future) === 0) {
            const output = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            output[i] = 1;
            return { input: trainingBoard, output };
          }

          future[i] = 1;
          if (win(future) === 1) {
            const output = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            output[i] = 1;
            return { input: trainingBoard, output };
          }
        }
      }
    }
  }
}

process.stdout.write("norman starts training");
let debug = 0;
while (debug < 8 && session.train(train, 800)) {
  process.stdout.write(".");
  debug++;
}
console.log();

let conceptrons = 0;
let perceptrons = 0;
for (const layer of brain.layers) {
  for (const neuron of layer.values()) {
    if (neuron.perceptrons) {
      conceptrons++;
      perceptrons += neuron.perceptrons.size;
    }
  }
}
console.log("brain has", conceptrons, "conceptrons and", perceptrons, "perceptrons");
console.log("norman is ready to play!");

function takeNormanTurn(board) {
  for (let i = 0; i < board.length; i++) {
    brain.get(BOARD_SENSORS[i]).activation = board[i];
  }

  brain.process();

  const moves = [];
  for (let i = 0; i < board.length; i++) {
    moves.push({ index: i, activation: brain.get(PLAY_CONCEPTS[i]).activation });
  }
  moves.sort((a, b) => (b.activation - a.activation));

  console.log("norman is thinking about", moves.map(one => (one.index + 1)).join(", ") + "...");

  for (const move of moves) {
    if (board[move.index] < 0) {
      board[move.index] = 1;
      return move.index;
    }
  }
}

async function go() {
  console.log();
  console.log("TIC TAC TOE -", PLAYERS.join(" vs "));
  console.log();

  const board = [-1, -1, -1, -1, -1, -1, -1, -1, -1];

  for (let turn = 0; turn < 9; turn++) {
    const player = (turn % 2);

    show(board);
    console.log();
    console.log("Turn", turn, "-", PLAYERS[player], "to play");

    const move = (player === 0) ? await takeHumanTurn(board) : takeNormanTurn(board);
    const winner = win(board);
    console.log(PLAYERS[player], "plays at", (move + 1));

    if (winner >= 0) {
      console.log();
      show(board);
      console.log();
      console.log(PLAYERS[winner], "wins!");
      console.log();
      process.exit(0);
    }

    console.log();
  }

  console.log("Tie!");
  process.exit(0);
}

go();
