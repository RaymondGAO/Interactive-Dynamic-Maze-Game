const initialBoard = [
  [..."WWWWWWWWWW"], [..."W...M....W"], [..."W.WWWW.W.W"], [..."W......W.W"], [..."W.WWWR.W.E"],
  [..."W......W.W"], [..."W.WRWWE..W"], [..."W.W..W.WWW"], [..."W........W"], [..."WWWWWWWEWW"]
];

const boardElement = document.querySelector("#board");
const stepsElement = document.querySelector("#steps");
const messageElement = document.querySelector("#message");
const stateElement = document.querySelector("#board-state");
const restartElement = document.querySelector("#restart");
const boardPanelElement = document.querySelector(".board-panel");
let board;
let player;
let steps;
let gameOver;
let trail = new Set();
let trailTimer;

function resetGame() {
  board = initialBoard.map(row => [...row]);
  player = { row: 3, col: 1 };
  steps = 0;
  gameOver = false;
  trail = new Set();
  clearTimeout(trailTimer);
  boardPanelElement.classList.remove("is-celebrating");
  boardPanelElement.querySelector(".celebration")?.remove();
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
    const trailClass = !isPlayer && trail.has(`${r},${c}`) ? " cell--trail" : "";
    element.className = `cell cell--${isPlayer ? "player" : ({ W: "wall", E: "exit", M: "mirror", R: "rotate", ".": "floor" }[cell])}${trailClass}`;
    element.textContent = isPlayer ? "@@" : ({ E: "EX", M: "MR", R: "RT" }[cell] || "");
    element.setAttribute("aria-label", isPlayer ? "player" : cell);
    boardElement.append(element);
  }));
  stepsElement.textContent = steps;
}

function isWalkable(row, col) {
  return row >= 0 && row < 10 && col >= 0 && col < 10 && board[row][col] !== "W";
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
  trail.add(`${player.row},${player.col}`);
  let moved = 0;
  while (isWalkable(player.row + dr, player.col + dc)) {
    player.row += dr;
    player.col += dc;
    trail.add(`${player.row},${player.col}`);
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
  clearTimeout(trailTimer);
  trailTimer = setTimeout(() => {
    trail = new Set();
    render();
  }, 520);
}

function mirrorMaze() {
  board = board.map(row => [...row].reverse());
  player.col = 9 - player.col;
  trail = new Set([...trail].map(value => {
    const [row, col] = value.split(",").map(Number);
    return `${row},${9 - col}`;
  }));
  stateElement.textContent = "MIRRORED";
  setMessage("You found a mirror item. Maze is now mirrored.", true);
}

function rotateMaze() {
  const rotated = Array.from({ length: 10 }, () => Array(10));
  board.forEach((row, r) => row.forEach((cell, c) => { rotated[c][9 - r] = cell; }));
  board = rotated;
  const oldRow = player.row;
  const oldCol = player.col;
  player = { row: oldCol, col: 9 - oldRow };
  trail = new Set([...trail].map(value => {
    const [row, col] = value.split(",").map(Number);
    return `${col},${9 - row}`;
  }));
  stateElement.textContent = "ROTATED";
  setMessage("You found a rotation item. Maze is now rotated.", true);
}

function finish() {
  gameOver = true;
  stateElement.textContent = "COMPLETE";
  setMessage(`You reached the exit in ${steps} steps. Congratulations!`, true);
  celebrateExit();
}

function celebrateExit() {
  boardPanelElement.classList.add("is-celebrating");
  const celebration = document.createElement("div");
  celebration.className = "celebration";
  celebration.setAttribute("aria-hidden", "true");
  celebration.innerHTML = '<strong>Congratulations!<br>You beat the game!</strong><span class="celebration-ring"></span>';
  for (let index = 0; index < 18; index += 1) {
    const spark = document.createElement("i");
    spark.style.setProperty("--spark-angle", `${index * 20}deg`);
    spark.style.setProperty("--spark-delay", `${index * 18}ms`);
    celebration.append(spark);
  }
  boardPanelElement.append(celebration);
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
