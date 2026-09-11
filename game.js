const SIZE = 50;
const REGION_SIZE = 10;
const REGIONS_PER_SIDE = 5;
const START = { row: 1, col: 1 };

function createBoard() {
  const result = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) =>
      row === 0 || col === 0 || row === SIZE - 1 || col === SIZE - 1 ? "W" : "."));
  // Two open routes guarantee that at least one exit is always reachable.
  for (let col = 1; col < SIZE - 1; col++) result[1][col] = ".";
  for (let row = 1; row < SIZE - 1; row++) result[row][SIZE - 2] = ".";
  result[1][SIZE - 1] = "E";
  result[SIZE - 1][SIZE - 2] = "E";
  for (let row = 1; row < SIZE - 1; row++) {
    for (let col = 1; col < SIZE - 1; col++) {
      const protectedRoute = row === 1 || col === SIZE - 2;
      if (!protectedRoute && !(row === START.row && col === START.col) && Math.random() < 0.24) result[row][col] = "W";
    }
  }
  for (let regionRow = 0; regionRow < REGIONS_PER_SIDE; regionRow++) {
    for (let regionCol = 0; regionCol < REGIONS_PER_SIDE; regionCol++) {
      const cells = [];
      for (let row = regionRow * REGION_SIZE + 1; row < (regionRow + 1) * REGION_SIZE - 1; row++)
        for (let col = regionCol * REGION_SIZE + 1; col < (regionCol + 1) * REGION_SIZE - 1; col++)
          if (!(row === START.row && col === START.col) && row !== 1 && col !== SIZE - 2 && result[row][col] === ".") cells.push([row, col]);
      const mirror = cells.splice(Math.floor(Math.random() * cells.length), 1)[0];
      const rotate = cells.splice(Math.floor(Math.random() * cells.length), 1)[0];
      result[mirror[0]][mirror[1]] = "M";
      result[rotate[0]][rotate[1]] = "R";
    }
  }
  return result;
}

const boardElement = document.querySelector("#board");
const stepsElement = document.querySelector("#steps");
const messageElement = document.querySelector("#message");
const stateElement = document.querySelector("#board-state");
const restartElement = document.querySelector("#restart");
let board;
let player;
let steps;
let gameOver;

function resetGame() {
  board = createBoard();
  player = { ...START };
  steps = 0;
  gameOver = false;
  stateElement.textContent = "READY";
  setMessage("Use arrow keys or 8, 2, 4, and 6 to move. Reach an exit.");
  render();
}

function setMessage(text, alert = false) {
  messageElement.textContent = text;
  messageElement.classList.toggle("is-alert", alert);
}

function render() {
  boardElement.replaceChildren();
  board.forEach((row, r) => row.forEach((cell, c) => {
    const element = document.createElement("div");
    const isPlayer = r === player.row && c === player.col;
    element.className = `cell cell--${isPlayer ? "player" : ({ W: "wall", E: "exit", M: "mirror", R: "rotate", ".": "floor" }[cell])}`;
    element.textContent = isPlayer ? "@@" : ({ E: "EX", M: "MR", R: "RT" }[cell] || "");
    element.setAttribute("aria-label", isPlayer ? "player" : cell);
    boardElement.append(element);
  }));
  stepsElement.textContent = steps;
}

function isWalkable(row, col) {
  return row >= 0 && row < SIZE && col >= 0 && col < SIZE && board[row][col] !== "W";
}

function directionsAround(row, col) {
  return [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dr, dc]) => isWalkable(row + dr, col + dc)).length;
}

function moveMulti(input) {
  const vector = { 8: [-1, 0], 2: [1, 0], 4: [0, -1], 6: [0, 1] }[input];
  if (!vector) return;
  const [dr, dc] = vector;
  if (!isWalkable(player.row + dr, player.col + dc)) {
    setMessage("You hit a wall!", true);
    return;
  }
  let moved = 0;
  while (isWalkable(player.row + dr, player.col + dc)) {
    player.row += dr;
    player.col += dc;
    moved += 1;
    const current = board[player.row][player.col];
    const next = board[player.row + dr]?.[player.col + dc];
    if (current === "E" || current === "M" || current === "R" || next === "M" || next === "R" || next === "E" || directionsAround(player.row, player.col) > 2) break;
  }
  steps += moved;
  const current = board[player.row][player.col];
  if (current === "M") mirrorMaze();
  else if (current === "R") rotateMaze();
  else if (current === "E") finish();
  else setMessage(moved ? `Moved ${moved} ${moved === 1 ? "step" : "steps"}.` : "Ready.");
  render();
}

function mirrorMaze() {
  board = board.map(row => [...row].reverse());
  player.col = SIZE - 1 - player.col;
  stateElement.textContent = "MIRRORED";
  setMessage("You found a mirror item. Maze is now mirrored.", true);
}

function rotateMaze() {
  const rotated = Array.from({ length: SIZE }, () => Array(SIZE));
  board.forEach((row, r) => row.forEach((cell, c) => { rotated[c][9 - r] = cell; }));
  board = rotated;
  ({ row: player.col, col: player.row } = { row: player.col, col: SIZE - 1 - player.row });
  stateElement.textContent = "ROTATED";
  setMessage("You found a rotation item. Maze is now rotated.", true);
}

function finish() {
  gameOver = true;
  stateElement.textContent = "COMPLETE";
  setMessage(`You reached the exit in ${steps} steps. Congratulations!`, true);
}

document.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "r") return resetGame();
  if (gameOver) return;
  const arrowInputs = {
    ArrowUp: 8, ArrowDown: 2, ArrowLeft: 4, ArrowRight: 6,
    Up: 8, Down: 2, Left: 4, Right: 6
  };
  const input = arrowInputs[event.key] ?? arrowInputs[event.code] ?? ({ 38: 8, 40: 2, 37: 4, 39: 6 }[event.keyCode]) ?? Number(event.key);
  if (input === 8 || input === 2 || input === 4 || input === 6) event.preventDefault();
  if ([8, 2, 4, 6].includes(input)) moveMulti(input);
});
restartElement.addEventListener("click", resetGame);
resetGame();
