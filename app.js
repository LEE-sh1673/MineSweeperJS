document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  const gameOverScreen = document.querySelector(".gameOver");
  let width = 10;
  let bombAmount = 20;
  let flags = 0;
  let squares = [];
  let isGameOver = false;
  let totalSquares = width * width;

  //* set board size and determine amount of bombs.
  switch (width) {
    case 10:
      grid.classList.remove("w5_h5");
      grid.classList.add("w10_h10");
      bombAmount = 20;
      break;
    case 5:
      grid.classList.add("w5_h5");
      grid.classList.remove("w10_h10");
      bombAmount = 10;
      break;
  }

  //* create board.
  function createBoard() {
    //* get shuffled game array with random bombs.
    const bombsArray = Array(bombAmount).fill("bomb"); // 20 positions of value is 'bomb'.
    const emptyArray = Array(width * width - bombAmount).fill("valid"); // 80 positions of value is 'valid'.
    const gameArray = emptyArray.concat(bombsArray);

    //* shuffle the array (using es6 syntaxies.)
    const shuffledArray = gameArray
      .map((a) => [Math.random(), a])
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1]);

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.setAttribute("id", i);
      square.classList.add(shuffledArray[i]);
      grid.appendChild(square);
      squares.push(square);

      //* normal click
      square.addEventListener("click", (event) => {
        handleSquareClick(square);
      });

      //* ctrl and right click
      square.oncontextmenu = (event) => {
        event.preventDefault();
        addFlag(square);
      };
    }

    //* add numbers.
    for (let i = 0; i < squares.length; i++) {
      let total = 0;
      const isLeftEdge = i % width == 0;
      const isRightEdge = i % width === width - 1;

      if (squares[i].classList.contains("valid")) {
        if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains("bomb")) {
          total++;
        }
        if (
          i > width - 1 &&
          !isRightEdge &&
          squares[i + 1 - width].classList.contains("bomb")
        ) {
          total++;
        }
        if (i > width && squares[i - width].classList.contains("bomb")) {
          total++;
        }
        if (
          i > width + 1 &&
          !isLeftEdge &&
          squares[i - width - 1].classList.contains("bomb")
        ) {
          total++;
        }
        if (
          i < totalSquares - 2 &&
          !isRightEdge &&
          squares[i + 1].classList.contains("bomb")
        ) {
          total++;
        }
        if (
          i < totalSquares - width &&
          !isLeftEdge &&
          squares[i + width - 1].classList.contains("bomb")
        ) {
          total++;
        }
        if (
          i < totalSquares - width - 1 &&
          !isRightEdge &&
          squares[i + width + 1].classList.contains("bomb")
        ) {
          total++;
        }
        if (
          i < totalSquares - width &&
          squares[i + width].classList.contains("bomb")
        ) {
          total++;
        }
        squares[i].setAttribute("data", total);

        switch (total) {
          case 1:
            squares[i].classList.add("score_1");
            break;
          case 2:
            squares[i].classList.add("score_2");
            break;
          case 3:
            squares[i].classList.add("score_3");
            break;
        }
      }
    }
  }

  createBoard();

  //* add flag with right click
  function addFlag(square) {
    if (isGameOver) {
      return;
    }
    if (!square.classList.contains("checked") && flags < bombAmount) {
      if (!square.classList.contains("flag")) {
        square.classList.add("flag");
        square.innerHTML = "⛳";
        flags++;
        checkForWin();
      } else {
        square.classList.remove("flag");
        square.innerHTML = "";
        flags--;
      }
    }
  }

  //* click on square actions.
  function handleSquareClick(square) {
    let currentId = square.id;
    if (isGameOver) {
      return;
    }
    if (
      square.classList.contains("checked") ||
      square.classList.contains("flag")
    ) {
      return;
    }
    if (square.classList.contains("bomb")) {
      gameOver(square);
    } else {
      let total = square.getAttribute("data");

      if (total != 0) {
        square.classList.add("checked");
        square.innerHTML = total;
        return;
      }
      checkSquare(square, currentId);
    }
    square.classList.add("checked");
  }

  //* check neighboring squares once square is clicked.
  function checkSquare(square, currentId) {
    const isLeftEdge = currentId % width === 0;
    const isRightEdge = currentId % width === width - 1;

    setTimeout(() => {
      if (currentId > 0 && !isLeftEdge) {
        const newId = squares[parseInt(currentId) - 1].id;
        const newSquare = document.getElementById(newId);
        handleSquareClick(newSquare);
      }
      if (currentId > width - 1 && !isRightEdge) {
        const newId = squares[parseInt(currentId) - width + 1].id;
        const newSquare = document.getElementById(newId);
        handleSquareClick(newSquare);
      }
      if (currentId > width) {
        const newId = squares[parseInt(currentId) - width].id;
        const newSquare = document.getElementById(newId);
        handleSquareClick(newSquare);
      }
      if (currentId > width + 1 && !isLeftEdge) {
        const newId = squares[parseInt(currentId) - width - 1].id;
        const newSquare = document.getElementById(newId);
        handleSquareClick(newSquare);
      }
      if (currentId < totalSquares - 2 && !isRightEdge) {
        const newId = squares[parseInt(currentId) + 1].id;
        const newSquare = document.getElementById(newId);
        handleSquareClick(newSquare);
      }
      if (currentId < totalSquares - width && !isLeftEdge) {
        const newId = squares[parseInt(currentId) + width - 1].id;
        const newSquare = document.getElementById(newId);
        handleSquareClick(newSquare);
      }
      if (currentId < totalSquares - width - 1 && !isRightEdge) {
        const newId = squares[parseInt(currentId) + width + 1].id;
        const newSquare = document.getElementById(newId);
        handleSquareClick(newSquare);
      }
      if (currentId < totalSquares - width) {
        const newId = squares[parseInt(currentId) + width].id;
        const newSquare = document.getElementById(newId);
        handleSquareClick(newSquare);
      }
    }, 10);
  }

  //* game over
  function gameOver(square) {
    console.log("BOOM! GAME OVER!!");
    isGameOver = true;

    // show all of the bombs in grid.
    squares.forEach((square) => {
      if (square.classList.contains("bomb")) {
        square.classList.add("bomb-on");
        square.innerHTML = "💣";
      }
    });
    gameOverScreen.style.visibility = "visible";
    gameOverScreen.style.opacity = "1";
  }

  //* check for win
  function checkForWin() {
    let matches = 0;

    for (let i = 0; i < squares.length; i++) {
      if (
        squares[i].classList.contains("flag") &&
        squares[i].classList.contains("bomb")
      ) {
        matches++;
      }
      if (matches === bombAmount) {
        console.log("YOU WIN");
        isGameOver = true;
      }
    }
  }
});
