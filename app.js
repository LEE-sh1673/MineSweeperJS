import { saveScore, loadScore } from "./score.js";

// emojis for graphics.
const ANGRY_FACE = "👿";
const HAPPY_FACE = "🙂";
const VICTORY_FACE = "😲";
const BOMB_ICON = "💥";
const FLAG_ICON = "🚩";

// header elements.
const itemSmile = document.getElementById("item__smilely");
const itemNumsFlag = document.getElementById("item__numsFlag");
const itemTimer = document.getElementById("item__timer");

// mobile ui elements.
const normalPickBtn = document.getElementById("pickBtn");
const flagPickBtn = document.getElementById("flagBtn");
const gameStatus = document.querySelector(".mobile__gameStatus");
const highScore = document.querySelector(".mobile__highScore");

let isFirstClick = true;

// for count time.
let timer = false;
let count = 0;

// this support to mobile
let isMobile = false;
let touchMode = 0; //* [0]: normal click / [1]: flag click

// update header panel '001... 002... 999' forms.
function updatePanel(panel, num) {
  panel.innerHTML = ("00" + num).slice(-3);
}

// display some message when gameover or win.
function showGameStatus(message = "", color = "inherit") {
  gameStatus.innerHTML = message;
  gameStatus.style.color = color;
}

setInterval(() => {
  if (timer) {
    updatePanel(itemTimer, count);
    count++;
  }
}, 1000);

// support mobile version (under 500px layout.)
if (window.innerWidth <= 500) {
  isMobile = true;
  highScore.innerHTML = loadScore() + " sec";
  flagPickBtn.classList.remove("btn__active");
  normalPickBtn.classList.add("btn__active");

  normalPickBtn.addEventListener("click", () => {
    touchMode = 0;
    flagPickBtn.classList.remove("btn__active");
    normalPickBtn.classList.add("btn__active");
  });

  flagPickBtn.addEventListener("click", () => {
    touchMode = 1;
    flagPickBtn.classList.add("btn__active");
    normalPickBtn.classList.remove("btn__active");
  });
}

// when web page is loaded, create game board and set the variable.
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid"); // grid element
  let width = 10; // grid height (N)
  let totalSquares = width * width; // total grid size (N * N)
  let bombAmount = 20; // number of bombs in grid.
  let flags = 0; // number of current flags in grid.
  let squares = []; // each cells in grid
  let isGameOver = false;

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
    for (let i = 0; i < squares.length; i++) {
      let total = 0;
      const isLeftEdge = i % width == 0;
      const isRightEdge = i % width === width - 1;

      //*  check neighboring squares.
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

    square.classList.remove("bomb");
    for (let i = 0; i < squares[swapIdx].classList.length; i++) {
      const currentItem = squares[swapIdx].classList.item(i);
      square.classList.add(currentItem);
      squares[swapIdx].classList.remove(currentItem);
    }
    square.setAttribute("data", squares[swapIdx].getAttribute("data"));
    squares[swapIdx].classList.add("bomb");
    squares[swapIdx].removeAttribute("data");
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

    updatePanel(itemNumsFlag, bombAmount);
    itemTimer.innerHTML = "000";

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
        updatePanel(itemNumsFlag, bombAmount - flags);
      }
      return;
    }
    if (!square.classList.contains("checked") && flags < bombAmount) {
      if (!square.classList.contains("flag")) {
        square.classList.add("flag");
        square.innerHTML = FLAG_ICON;
        flags++;
        checkForWin();
      } else {
        square.classList.remove("flag");
        square.innerHTML = "";
        flags--;
      }
      updatePanel(itemNumsFlag, bombAmount - flags);
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

  //* check neighboring squares once square is clicked. (use recursion.)
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
    itemSmile.innerHTML = ANGRY_FACE;

    // show all of the bombs in grid.
    squares.forEach((square) => {
      if (square.classList.contains("bomb")) {
        square.classList.add("bomb-on");
        square.innerHTML = BOMB_ICON;
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
        saveScore(count - 1);
        isGameOver = true;
        timer = false;
        itemSmile.innerHTML = VICTORY_FACE;
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
      flagPickBtn.classList.remove("btn__active");
      normalPickBtn.classList.add("btn__active");
      highScore.innerHTML = loadScore() + " sec";
    }
    itemSmile.innerHTML = HAPPY_FACE;
    showGameStatus();
    createBoard();
  }

  itemSmile.addEventListener("click", restartGame);
});
