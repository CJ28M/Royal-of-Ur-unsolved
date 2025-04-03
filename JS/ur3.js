document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("game-board");
  const diceResultDisplay = document.getElementById("dice-result");
  const playerTurnDisplay = document.getElementById("player-turn");
  const rollDiceBtn = document.getElementById("roll-dice");
  const resetGameBtn = document.getElementById("reset-game");
  const skipTurnBtn = document.getElementById("skip-turn");
  const whiteScoreDisplay = document.getElementById("white-score");
  const blackScoreDisplay = document.getElementById("black-score");

  const boardSize = 24;
  let playerTurn = "white";
  let diceRoll = 0;
  let scores = { white: 0, black: 0 };

  const rosettes = [0, 2, 10, 18, 20];
  const offBoardSquares = [15, 17];

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
      if (rosettes.includes(i)) square.classList.add("rosette");
      if (offBoardSquares.includes(i)) square.classList.add("off-board");
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
  }

  rollDiceBtn.addEventListener("click", () => {
    diceRoll = Math.floor(Math.random() * 5);
    diceResultDisplay.textContent = diceRoll;
    rollDiceBtn.disabled = true;

    if (diceRoll === 0) {
      switchTurn();
      rollDiceBtn.disabled = false;
    }
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
    if (!targetSquare || !isValidMove(draggedPiece, targetSquare)) return;

    const targetId = parseInt(targetSquare.getAttribute("square-id"));
    const targetPiece = targetSquare.querySelector(".piece");

    if (targetPiece && targetPiece.getAttribute("data-color") === playerTurn) {
      return;
    }

    if (
      targetPiece &&
      targetPiece.getAttribute("data-color") !== playerTurn &&
      !rosettes.includes(targetId)
    ) {
      targetPiece.remove();
      createPiece(
        targetPiece.getAttribute("data-color"),
        targetPiece.getAttribute("data-color") === "white" ? 12 : 14
      );
    } else if (targetPiece) {
      return;
    }

    targetSquare.appendChild(draggedPiece);
    draggedPiece.classList.remove("dragging");

    if (offBoardSquares.includes(targetId)) {
      draggedPiece.remove();
      scores[playerTurn]++;
      updateScore();
    }

    if (diceRoll !== 4 && !rosettes.includes(targetId)) {
      switchTurn();
      rollDiceBtn.disabled = false;
    } else {
      rollDiceBtn.disabled = false;
    }
  });

  function isValidMove(piece, targetSquare) {
    const currentSquare = piece.parentElement;
    const currentId = parseInt(currentSquare.getAttribute("square-id"));
    const targetId = parseInt(targetSquare.getAttribute("square-id"));
    const path = paths[playerTurn];

    const currentIdx = path.indexOf(currentId);
    if (currentIdx === 1) return true;

    const newIdx = currentIdx + diceRoll;
    if (newIdx >= path.length) return false;

    return path[newIdx] === targetId;
  }

  function switchTurn() {
    playerTurn = playerTurn === "white" ? "black" : "white";
    playerTurnDisplay.textContent = playerTurn;
  }

  function updateScore() {
    whiteScoreDisplay.textContent = scores.white;
    blackScoreDisplay.textContent = scores.black;
  }

  skipTurnBtn.addEventListener("click", () => {
    switchTurn();
    rollDiceBtn.disabled = false;
  });

  resetGameBtn.addEventListener("click", () => {
    playerTurn = "white";
    scores = { white: 0, black: 0 };
    playerTurnDisplay.textContent = playerTurn;
    createBoard();
    updateScore();
    rollDiceBtn.disabled = false;
  });

  createBoard();
  updateScore();
});
