document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("game-board");
  const diceResultDisplay = document.getElementById("dice-result");
  const playerTurnDisplay = document.getElementById("player-turn");
  const rollDiceBtn = document.getElementById("roll-dice");
  const resetGameBtn = document.getElementById("reset-game");
  const skipTurnBtn = document.getElementById("skip-turn");
  const score = { white: 0, black: 0 };

  const boardSize = 24;
  let playerTurn = "white";
  let diceRoll = 0;
  let hasRolled = false;

  const rosettes = [0, 2, 10, 18, 20];
  const specialSquares = [15, 17];

  const paths = {
    white: [12, 9, 6, 3, 0, 1, 4, 7, 10, 13, 16, 19, 20, 23, 22, 21, 18, 15],
    black: [14, 11, 8, 5, 2, 1, 4, 7, 10, 13, 16, 19, 18, 21, 22, 23, 20, 17],
  };

  function createBoard() {
    board.innerHTML = "";
    for (let i = 0; i < boardSize; i++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.setAttribute("square-id", i);

      if (rosettes.includes(i)) {
        square.classList.add("rosette");
      }

      if ([12, 14, 17].includes(i)) {
        square.classList.add("blank");
      }

      if (specialSquares.includes(i)) {
        square.classList.add("special-square");
        const counter = document.createElement("span");
        counter.classList.add("piece-counter");
        counter.textContent = "0";
        square.appendChild(counter);
      }

      board.appendChild(square);
    }

    for (let i = 0; i < 7; i++) {
      createPiece("white", 12);
      createPiece("black", 14);
    }
  }

  function createPiece(color, position) {
    const piece = document.createElement("div");
    piece.classList.add("piece", color);
    piece.setAttribute("draggable", true);
    piece.setAttribute("data-color", color);
    document.querySelector(`[square-id="${position}"]`).appendChild(piece);
    updatePieceCounter(position);
  }

  function updatePieceCounter(squareId) {
    const square = document.querySelector(`[square-id="${squareId}"]`);
    if (specialSquares.includes(squareId)) {
      const count = square.querySelectorAll(".piece").length;
      square.querySelector(".piece-counter").textContent = count;
    }
  }

  function checkWin() {
    if (score.white >= 7) {
      alert("White wins!");
      resetGame();
    } else if (score.black >= 7) {
      alert("Black wins!");
      resetGame();
    }
  }

  rollDiceBtn.addEventListener("click", () => {
    if (hasRolled) return;
    diceRoll = Math.floor(Math.random() * 4) + 1;
    diceResultDisplay.textContent = diceRoll;
    hasRolled = true;
    rollDiceBtn.disabled = true;
    if (diceRoll === 0) switchTurn();
  });

  document.addEventListener("dragstart", (e) => {
    if (
      e.target.classList.contains("piece") &&
      e.target.getAttribute("data-color") === playerTurn
    ) {
      e.dataTransfer.setData("text", e.target.outerHTML);
      e.target.classList.add("dragging");
    }
  });

  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggedPiece = document.querySelector(".dragging");
    if (!draggedPiece) return;

    const targetSquare = e.target.closest(".square");
    if (!targetSquare) return;

    const targetId = parseInt(targetSquare.getAttribute("square-id"));
    const pieceColor = draggedPiece.getAttribute("data-color");
    const path = paths[pieceColor];
    const currentIdx = path.indexOf(
      parseInt(draggedPiece.parentElement.getAttribute("square-id"))
    );
    const moveToIdx = currentIdx + diceRoll;

    if (moveToIdx >= path.length) return;

    if (path[moveToIdx] === targetId) {
      if (
        (targetId === 15 && pieceColor === "white") ||
        (targetId === 17 && pieceColor === "black")
      ) {
        draggedPiece.remove();
        score[pieceColor]++;
        checkWin();
      } else {
        targetSquare.appendChild(draggedPiece);
      }
      draggedPiece.classList.remove("dragging");
      updatePieceCounter(targetId);
    }

    hasRolled = false;
    rollDiceBtn.disabled = false;
    diceResultDisplay.textContent = "";

    if (diceRoll !== 4 && !rosettes.includes(targetId)) {
      switchTurn();
    }
  });

  function returnToStart(color) {
    const startingSquareId = color === "white" ? 12 : 14;
    createPiece(color, startingSquareId);
  }

  function switchTurn() {
    playerTurn = playerTurn === "white" ? "black" : "white";
    playerTurnDisplay.innerHTML = `<b>${playerTurn}</b>`;
    hasRolled = false;
    rollDiceBtn.disabled = false;
  }

  function resetGame() {
    playerTurn = "white";
    score.white = 0;
    score.black = 0;
    playerTurnDisplay.innerHTML = `<b>${playerTurn}</b>`;
    hasRolled = false;
    rollDiceBtn.disabled = false;
    createBoard();
  }

  skipTurnBtn.addEventListener("click", switchTurn);
  resetGameBtn.addEventListener("click", resetGame);

  createBoard();
});
