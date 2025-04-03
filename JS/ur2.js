document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("game-board");
  const diceResultDisplay = document.getElementById("dice-result");
  const playerTurnDisplay = document.getElementById("player-turn");
  const rollDiceBtn = document.getElementById("roll-dice");
  const resetGameBtn = document.getElementById("reset-game");
  const skipTurnBtn = document.getElementById("skip-turn");

  const boardSize = 24;
  let playerTurn = "white";
  let diceRoll = 0;

  const rosettes = [0, 2, 10, 18, 20];

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
      if ([12, 15, 14, 17].includes(i)) square.classList.add("blank");
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
    if (!targetSquare || !isValidMove(draggedPiece, targetSquare)) return;

    const targetId = parseInt(targetSquare.getAttribute("square-id"));
    if (
      targetSquare.firstChild &&
      targetSquare.firstChild.getAttribute("data-color") === playerTurn
    ) {
      return;
    }
    if (rosettes.includes(targetId) && targetSquare.firstChild) {
      return;
    }
    if (
      targetSquare.firstChild &&
      targetSquare.firstChild.getAttribute("data-color") !== playerTurn
    ) {
      targetSquare.firstChild.remove();
    }

    targetSquare.appendChild(draggedPiece);
    draggedPiece.classList.remove("dragging");

    if (diceRoll !== 4 && !rosettes.includes(targetId)) {
      switchTurn();
    }
  });

  function isValidMove(piece, targetSquare) {
    const currentSquare = piece.parentElement;
    const currentId = parseInt(currentSquare.getAttribute("square-id"));
    const targetId = parseInt(targetSquare.getAttribute("square-id"));
    const path = paths[playerTurn];

    const currentIdx = path.indexOf(currentId);
    if (currentIdx === -1) return false;

    const newIdx = currentIdx + diceRoll;
    if (newIdx >= path.length) return false;

    return path[newIdx] === targetId;
  }

  function switchTurn() {
    playerTurn = playerTurn === "white" ? "black" : "white";
    playerTurnDisplay.textContent = playerTurn;
  }

  skipTurnBtn.addEventListener("click", () => {
    switchTurn();
  });

  resetGameBtn.addEventListener("click", () => {
    playerTurn = "white";
    playerTurnDisplay.textContent = playerTurn;
    createBoard();
  });

  createBoard();
});
