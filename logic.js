let sampleTimes = [];
let magicNumber;
let guessesLeft;
let score = 0;
const leaderboardKey = "speedcubingLeaderboard";

const input = document.getElementById("guessInput");
const submitBtn = document.getElementById("submitGuess");
const playAgainBtn = document.getElementById("playAgain");
const message = document.getElementById("message");
const scoreElem = document.getElementById("score");
const leaderboardList = document.getElementById("leaderboardList");

function loadLeaderboard() {
  const data = localStorage.getItem(leaderboardKey);
  return data ? JSON.parse(data) : [];
}

function saveLeaderboard(leaderboard) {
  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
}

function updateLeaderboardDisplay() {
  const leaderboard = loadLeaderboard();
  leaderboardList.innerHTML = "";
  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No scores yet.</li>";
    return;
  }
  leaderboard.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

function updateScore(newScore) {
  score = newScore;
  scoreElem.textContent = score;
}

function promptForName() {
  let name = "";
  while (!name) {
    name = prompt("🎉 You guessed correctly! Enter your name for the leaderboard:").trim();
  }
  return name;
}

function addScoreToLeaderboard(name, score) {
  let leaderboard = loadLeaderboard();
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 5) leaderboard = leaderboard.slice(0, 5);
  saveLeaderboard(leaderboard);
  updateLeaderboardDisplay();
}

function startGame() {
  magicNumber = sampleTimes[Math.floor(Math.random() * sampleTimes.length)];
  guessesLeft = 4;

  input.disabled = false;
  submitBtn.disabled = false;
  playAgainBtn.classList.add("hidden");

  message.textContent = "";
  input.value = "";
  input.focus();

  updateScore(score);
}

function handleGuess() {
  const userGuess = parseFloat(input.value);
  const magicNum = magicNumber;

  if (isNaN(userGuess)) {
    message.textContent = "Please enter a valid time, e.g., 6.83";
    return;
  }

  guessesLeft--;

  if (userGuess === magicNum) {
    score++;
    updateScore(score);

    message.textContent = `🎉 Correct! The magic time was ${magicNum.toFixed(2)} seconds.`;
    endGame();

    const playerName = promptForName();
    addScoreToLeaderboard(playerName, score);
  } else if (guessesLeft > 0) {
    const hint = userGuess > magicNum ? "Too high!" : "Too low!";
    message.textContent = `❌ ${hint} You have ${guessesLeft} guess${guessesLeft === 1 ? "" : "es"} left.`;
  } else {
    message.textContent = `💥 Out of guesses! The time was ${magicNum.toFixed(2)} seconds.`;
    endGame();
  }

  input.value = "";
  input.focus();
}

function endGame() {
  input.disabled = true;
  submitBtn.disabled = true;
  playAgainBtn.classList.remove("hidden");
}

submitBtn.addEventListener("click", handleGuess);
playAgainBtn.addEventListener("click", startGame);

// Fetch magic numbers from JSON and start game
fetch('./numbers.json')
  .then((res) => res.json())
  .then((data) => {
    sampleTimes = data.times;
    updateLeaderboardDisplay();
    startGame();
  })
  .catch((err) => {
    console.error("Failed to load magic numbers:", err);
    message.textContent = "⚠️ Could not load magic numbers. Please try again later.";
    submitBtn.disabled = true;
  });
