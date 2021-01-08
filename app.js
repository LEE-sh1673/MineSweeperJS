const ANGRY_FACE = "👿";
const HAPPY_FACE = "🙂";
const VICTORY_FACE = "😲";
const item__smile = document.getElementById("item__smilely");
const item__numsFlag = document.getElementById("item__numsFlag");
const item__timer = document.getElementById("item__timer");
const ctrl__normalBtn = document.getElementById("pickBtn");
const ctrl__flagBtn = document.getElementById("flagBtn");
const mobile__gameStatus = document.querySelector(".mobile__gameStatus");

let isMobile = false;
let timer = false;
let count = 0;
let touchMode = 0;
let isFirstClick = true;

function pad(num) {
  return ("00" + num).slice(-3);
}

function showGameStatus(message, color = "inherit") {
  mobile__gameStatus.innerHTML = message;
  mobile__gameStatus.style.color = color;
}

if (window.innerWidth <= 500) {
  isMobile = true;
  ctrl__flagBtn.classList.remove("btn__active");
  ctrl__normalBtn.classList.add("btn__active");

  ctrl__normalBtn.addEventListener("click", () => {
    touchMode = 0;
    ctrl__flagBtn.classList.remove("btn__active");
    ctrl__normalBtn.classList.add("btn__active");
  });

  ctrl__flagBtn.addEventListener("click", () => {
    touchMode = 1;
    ctrl__flagBtn.classList.add("btn__active");
    ctrl__normalBtn.classList.remove("btn__active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
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

  //* add numbers in squares
  function initSquares() {
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
            squares[i].style.color = "blue";
            break;
          case 2:
            squares[i].style.color = "green";
            break;
          case 3:
            squares[i].style.color = "red";
            break;
          case 4:
            squares[i].style.color = "purple";
            break;
          case 5:
            squares[i].style.color = "brown";
            break;
        }
      }
    }
  }

  //* handle first click event
  function handleFirstClick(square) {
    //* select random position to switch the value with first position.
    let swapIdx = Math.floor(Math.random() * squares.length);

    while (
      swapIdx == square.id ||
      squares[swapIdx].classList.contains("bomb")
    ) {
      swapIdx = Math.floor(Math.random() * squares.length);
    }

    console.log(squares[swapIdx]);
    square.classList.remove("bomb");
    for (let i = 0; i < squares[swapIdx].classList.length; i++) {
      const currentItem = squares[swapIdx].classList.item(i);
      square.classList.add(currentItem);
      squares[swapIdx].classList.remove(currentItem);
    }
    square.setAttribute("data", squares[swapIdx].getAttribute("data"));
    squares[swapIdx].classList.add("bomb");
    squares[swapIdx].removeAttribute("data");

    console.log(`Swap positions ==> ${square.id} and ${squares[swapIdx].id}`);
    initSquares();
  }

  //* create board.
  function createBoard() {
    //* get shuffled game array with random bombs.
    const bombsArray = Array(bombAmount).fill("bomb"); // 20 positions of value is 'bomb'.
    const emptyArray = Array(width * width - bombAmount).fill("valid"); // 80 positions of value is 'valid'.
    let gameArray = emptyArray.concat(bombsArray);

    //* shuffle the array (using es6 syntaxies.)
    let shuffledArray = gameArray
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
          if (isFirstClick) {
            isFirstClick = false;
            if (square.classList.contains("bomb")) {
              handleFirstClick(square);
            }
          }
          handleSquareClick(square);
        });

        //* ctrl and right click
        square.oncontextmenu = (event) => {
          event.preventDefault();
          addFlag(square);
        };
      } else {
        square.addEventListener("click", () => {
          if (touchMode === 1) {
            addFlag(square);
          } else {
            if (isFirstClick) {
              isFirstClick = false;
              if (square.classList.contains("bomb")) {
                handleFirstClick(square);
              }
            }
            handleSquareClick(square);
          }
        });
      }
    }
    initSquares();
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
    showGameStatus("다시 시작하시려면 상단의 이모콘을 클릭해주세요.", "red");
    isGameOver = true;
    timer = false;
    flags = 999;
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
        showGameStatus(
          `축하합니다! 게임을 클리어 하셨습니다! 모든 지뢰를 찾는데 걸린 시간은 ${
            count - 1
          }초 입니다.`,
          "red"
        );
        isGameOver = true;
        timer = false;
        item__smile.innerHTML = VICTORY_FACE;
      }
    }
  }

  //* restart the game
  function restartGame() {
    grid.innerHTML = "";
    squares = [];
    isGameOver = false;
    isFirstClick = true;
    timer = false;
    flags = 0;
    count = 0;
    if (isMobile) {
      touchMode = "normal";
      ctrl__flagBtn.classList.remove("btn__active");
      ctrl__normalBtn.classList.add("btn__active");
    }
    item__smile.innerHTML = HAPPY_FACE;
    showGameStatus("");
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
