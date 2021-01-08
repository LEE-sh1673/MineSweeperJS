const PREV_SCORE = "currentHighScore";

export function saveScore(time) {
  const currentHighScore = loadScore();

  if (currentHighScore === "N/R") {
    localStorage.setItem(PREV_SCORE, time);
  } else if (parseInt(currentHighScore) > time) {
    localStorage.setItem(PREV_SCORE, time);
  }
}

export function loadScore() {
  const currentHighScore = localStorage.getItem(PREV_SCORE);

  if (currentHighScore !== null) {
    return currentHighScore;
  } else {
    return "N/R";
  }
}
