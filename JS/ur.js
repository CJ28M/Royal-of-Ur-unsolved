document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("game-board");
  const diceResultDisplay = document.getElementById("dice-result");
  const playerTurnDisplay = document.getElementById("player-turn");
  const rollDiceBtn = document.getElementById("roll-dice");
  const resetGameBtn = document.getElementById("reset-game");
  const skipTurnBtn = document.getElementById("skip-turn"); // Skip turn button

  const boardSize = 24; // 3x8 board
  let playerTurn = "white"; // Starts with white
  let diceRoll = 0;

  const rosettes = [0, 2, 10, 18, 20]; // Squares that grant extra turns

  // Paths for both players
  const paths = {
    white: [12, 9, 6, 3, 0, 1, 4, 7, 10, 13, 16, 19, 20, 23, 22, 21, 18, 15],
    black: [14, 11, 8, 5, 2, 1, 4, 7, 10, 13, 16, 19, 18, 21, 22, 23, 20, 17],
  };

  // Create the game board
  function createBoard() {
    board.innerHTML = ""; // Clear board before recreating it
    for (let i = 0; i < boardSize; i++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.setAttribute("square-id", i);

      if (rosettes.includes(i)) {
        square.classList.add("rosette");
      }

      if ([12, 15, 14, 17].includes(i)) {
        square.classList.add("blank");
      }

      board.appendChild(square);
    }

    // Create pieces for each player, placed along the path
    for (let i = 0; i < 7; i++) {
      createPiece("white", 12); // White pieces now start at square 12
      createPiece("black", 14); // Black pieces now start at square 14
    }
  }

  // Create pieces for the board
  function createPiece(color, position) {
    const piece = document.createElement("div");
    piece.classList.add("piece", color);
    piece.setAttribute("draggable", true);
    piece.setAttribute("data-color", color);
    document.querySelector(`[square-id="${position}"]`).appendChild(piece);
  }

  // Roll the dice when clicked
  rollDiceBtn.addEventListener("click", () => {
    diceRoll = Math.floor(Math.random() * 5); // Random roll between 0 and 4
    diceResultDisplay.textContent = diceRoll;
    if (diceRoll === 0) switchTurn(); // Skip turn if roll is 0
  });

  // Handle drag start for piece movement
  document.addEventListener("dragstart", (e) => {
    if (
      e.target.classList.contains("piece") &&
      e.target.getAttribute("data-color") === playerTurn
    ) {
      e.dataTransfer.setData("text", e.target.outerHTML);
      e.target.classList.add("dragging");
    }
  });

  // Allow piece to be dragged over squares
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  // Handle the drop event for moving pieces
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggedPiece = document.querySelector(".dragging");
    if (!draggedPiece) return;

    const targetSquare = e.target.closest(".square");
    if (!targetSquare || !isValidMove(draggedPiece, targetSquare)) return;

    const targetId = parseInt(targetSquare.getAttribute("square-id"));

    // Check if there is already a piece of the same color in the target square
    if (
      targetSquare.firstChild &&
      targetSquare.firstChild.getAttribute("data-color") === playerTurn
    ) {
      return; // Prevent landing on another piece of the same color
    }

    // Prevent capturing pieces on rosettes
    if (rosettes.includes(targetId) && targetSquare.firstChild) {
      return; // Do not capture a piece on a rosette
    }

    // If the piece is a black piece and lands on a white piece, return the white piece to its start position
    if (
      playerTurn === "black" &&
      targetSquare.firstChild &&
      targetSquare.firstChild.getAttribute("data-color") === "white"
    ) {
      const capturedPiece = targetSquare.firstChild;
      capturedPiece.remove(); // Remove the white piece
      returnToStart("white"); // Return the white piece to its starting position
    }

    // If there is a piece already in the target square (other than the same color), capture it and return it to the start
    if (targetSquare.firstChild) {
      const capturedPiece = targetSquare.firstChild;
      const capturedColor = capturedPiece.getAttribute("data-color");

      // Remove the captured piece and return it to the start
      capturedPiece.remove();
      returnToStart(capturedColor);
    }

    // Place the dragged piece in the target square
    targetSquare.appendChild(draggedPiece);
    draggedPiece.classList.remove("dragging");

    // Function to return the captured piece to its starting position
    function returnToStart(color) {
      const startingSquareId = color === "white" ? 12 : 14; // White pieces start at square 12, black pieces start at square 14
      const startingSquare = document.querySelector(
        `[square-id="${startingSquareId}"]`
      );

      // Create the piece again and place it at the starting square
      createPiece(color, startingSquareId);
    }

    // Extra Turn Conditions: Rolling a 4 or landing on a rosette, but no extra turn on capture
    if (diceRoll !== 4 && !rosettes.includes(targetId)) {
      switchTurn(); // Switch turn if not a 4 or rosette
    } else {
      if (playerTurn === "black") {
        setTimeout(aiMove, 1000); // Allow AI to move immediately after this action
      }
    }
  });

  // Validate if a move is legal based on dice roll and path
  function isValidMove(piece, targetSquare) {
    const currentSquare = piece.parentElement;
    const currentId = parseInt(currentSquare.getAttribute("square-id"));
    const targetId = parseInt(targetSquare.getAttribute("square-id"));
    const path = paths[playerTurn];

    const currentIdx = path.indexOf(currentId);
    if (currentIdx === -1) return false;

    const newIdx = currentIdx + diceRoll;
    if (newIdx >= path.length) return false; // Ensure it's within path bounds

    return path[newIdx] === targetId;
  }

  // Switch turns between players
  function switchTurn() {
    playerTurn = playerTurn === "white" ? "black" : "white";
    playerTurnDisplay.textContent = playerTurn;
    if (playerTurn === "black") setTimeout(aiMove, 1000); // AI's turn after delay
  }

  // AI movement logic
  function aiMove() {
    diceRoll = Math.floor(Math.random() * 5); // AI rolls its own dice
    diceResultDisplay.textContent = diceRoll;

    if (diceRoll === 0) {
      switchTurn();
      return;
    }

    const pieces = document.querySelectorAll(".piece.black");
    for (let piece of pieces) {
      const currentSquare = piece.parentElement;
      const currentId = parseInt(currentSquare.getAttribute("square-id"));
      const path = paths.black;
      const currentIdx = path.indexOf(currentId);

      if (currentIdx === -1) continue;

      const newIdx = currentIdx + diceRoll;
      if (newIdx >= path.length) continue;

      const targetId = path[newIdx];
      const targetSquare = document.querySelector(`[square-id="${targetId}"]`);

      if (isValidMove(piece, targetSquare)) {
        if (targetSquare.firstChild) {
          targetSquare.firstChild.remove(); // Capture piece on target square
        }
        targetSquare.appendChild(piece);

        // Extra Turn for AI: Rolling a 4 or landing on a rosette, but no extra turn on capture
        if (diceRoll !== 4 && !rosettes.includes(targetId)) {
          switchTurn(); // Switch turn if not a 4 or rosette
        } else {
          // If AI rolls a 4 or lands on a rosette, roll again
          setTimeout(aiMove, 1000); // AI will automatically take another turn
        }
        break;
      }
    }
  }

  // Handle the Skip Turn Button
  skipTurnBtn.addEventListener("click", () => {
    switchTurn(); // Simply switch to the other player
  });

  // Reset the game state
  resetGameBtn.addEventListener("click", () => {
    playerTurn = "white";
    playerTurnDisplay.textContent = playerTurn;
    createBoard(); // Recreate the board and pieces
  });

  // Function to check if a piece can be "scored"
  function checkForScoring(piece) {
    const currentSquare = piece.parentElement;
    const currentId = parseInt(currentSquare.getAttribute("square-id"));
    const path = paths[piece.getAttribute("data-color")];

    if (currentId === path[path.length - 1]) {
      // Final square in the path
      if (diceRoll === 1) {
        // Piece can be scored off the board
        currentSquare.removeChild(piece);
        // Do something like increase score or show message
      }
    }
  }

  createBoard(); // Initialize the game board
});
