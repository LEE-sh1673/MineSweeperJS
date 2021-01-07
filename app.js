const ANGRY_FACE = "👿";
const HAPPY_FACE = "🙂";
const item__smile = document.getElementById("item__smilely");
const item__numsFlag = document.getElementById("item__numsFlag");
const item__timer = document.getElementById("item__timer");
const ctrl__normalBtn = document.getElementById("pickBtn");
const ctrl__flagBtn = document.getElementById("flagBtn");

let isMobile = false;
let timer = false;
let count = 0;
let touchMode = 0;

function pad(num) {
  return ("00" + num).slice(-3);
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let width = 10;
  let bombAmount = 20;
  let flags = 0;
  let squares = [];
  let isGameOver = false;
  let totalSquares = width * width;

  if (window.innerWidth <= 500) {
    isMobile = true;
    ctrl__flagBtn.classList.remove("btn__active");
    ctrl__normalBtn.classList.add("btn__active");
  }

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

    item__numsFlag.innerHTML = pad(bombAmount, 3);
    item__timer.innerHTML = "000";

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.setAttribute("id", i);
      square.classList.add(shuffledArray[i]);
      grid.appendChild(square);
      squares.push(square);

      if (!isMobile) {
        //* normal click
        square.addEventListener("click", (event) => {
          handleSquareClick(square);
        });

        //* ctrl and right click
        square.oncontextmenu = (event) => {
          event.preventDefault();
          addFlag(square);
        };
      } else {
        ctrl__flagBtn.addEventListener("click", (event) => {
          touchMode = event.path[1].value;
          ctrl__flagBtn.classList.add("btn__active");
          ctrl__normalBtn.classList.remove("btn__active");
        });

        ctrl__normalBtn.addEventListener("click", (event) => {
          touchMode = event.path[1].value;
          ctrl__flagBtn.classList.remove("btn__active");
          ctrl__normalBtn.classList.add("btn__active");
        });

        square.addEventListener("click", () => {
          if (touchMode === "flag") {
            addFlag(square);
          } else {
            handleSquareClick(square);
          }
        });
      }
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
          case 4:
            squares[i].classList.add("score_4");
            break;
          case 4:
            squares[i].classList.add("score_5");
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
    if (flags === bombAmount) {
      if (
        !square.classList.contains("checked") &&
        square.classList.contains("flag")
      ) {
        square.classList.remove("flag");
        square.innerHTML = "";
        flags--;
        item__numsFlag.innerHTML = pad(bombAmount - flags, 3);
      }
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
      item__numsFlag.innerHTML = pad(bombAmount - flags, 3);
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
      gameOver();
    } else {
      let total = square.getAttribute("data");
      timer = true;

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
  function gameOver() {
    console.log("BOOM! GAME OVER!!");
    isGameOver = true;
    timer = false;
    item__smile.innerHTML = ANGRY_FACE;

    // show all of the bombs in grid.
    squares.forEach((square) => {
      if (square.classList.contains("bomb")) {
        square.classList.add("bomb-on");
        square.innerHTML = "💣";
      }
    });
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

  //* restart the game
  function restartGame() {
    grid.innerHTML = "";
    squares = [];
    isGameOver = false;
    timer = false;
    flags = 0;
    count = 0;
    if (isMobile) {
      touchMode = "normal";
      ctrl__flagBtn.classList.remove("btn__active");
      ctrl__normalBtn.classList.add("btn__active");
    }
    item__smile.innerHTML = HAPPY_FACE;
    createBoard();
  }

  item__smile.addEventListener("click", restartGame);
});

setInterval(() => {
  if (timer) {
    item__timer.innerHTML = ("00" + count).slice(-3);
    count++;
  }
}, 1000);
