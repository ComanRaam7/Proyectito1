const ROWS = 10;
const COLS = 10;
const MINES = 15;

const board = document.getElementById("board");
const mineCountEl = document.getElementById("mine-count");
const resetBtn = document.getElementById("reset");

let grid = [];
let gameOver = false;

function init() {
  gameOver = false;
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;
  mineCountEl.textContent = `Minas: ${MINES}`;

  grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );

  placeMines();
  calculateAdjacents();
  render();
}

function placeMines() {
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!grid[r][c].mine) {
      grid[r][c].mine = true;
      placed++;
    }
  }
}

function calculateAdjacents() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].mine) continue;
      let count = 0;
      for (const [dr, dc] of neighbors()) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && grid[nr][nc].mine) count++;
      }
      grid[r][c].adjacent = count;
    }
  }
}

function neighbors() {
  return [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];
}

function inBounds(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function render() {
  board.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      const div = document.createElement("div");
      div.className = "cell";

      if (cell.revealed) {
        div.classList.add("revealed");
        if (cell.mine) {
          div.classList.add("mine");
          div.textContent = "💣";
        } else if (cell.adjacent > 0) {
          div.textContent = cell.adjacent;
          div.dataset.value = cell.adjacent;
        }
      } else if (cell.flagged) {
        div.classList.add("flagged");
        div.textContent = "🚩";
      }

      div.addEventListener("click", () => reveal(r, c));
      div.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(r, c);
      });

      board.appendChild(div);
    }
  }
}

function reveal(r, c) {
  if (gameOver) return;
  const cell = grid[r][c];
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;

  if (cell.mine) {
    gameOver = true;
    revealAllMines();
    render();
    setTimeout(() => alert("¡Has perdido!"), 10);
    return;
  }

  if (cell.adjacent === 0) {
    for (const [dr, dc] of neighbors()) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && !grid[nr][nc].revealed) {
        reveal(nr, nc);
      }
    }
  }

  render();
  checkWin();
}

function toggleFlag(r, c) {
  if (gameOver) return;
  const cell = grid[r][c];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  render();
}

function revealAllMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].mine) grid[r][c].revealed = true;
    }
  }
}

function checkWin() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      if (!cell.mine && !cell.revealed) return;
    }
  }
  gameOver = true;
  setTimeout(() => alert("¡Has ganado!"), 10);
}

resetBtn.addEventListener("click", init);

init();
