import TileMap from "./TileMap.js";
import Pacman from "./Pacman.js";
import Enemy from "./Enemy.js";
import MovingDirection from "./MovingDirection.js";

const tileSize = 32;
const baseVelocity = 2;  // Base velocity
let velocity = baseVelocity;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let tileMap, pacman, enemies;

let gameOver = false;
let gameWin = false;
let lives = 3;  // Add lives counter
let generation = 1;  // Start with generation 1
const maxGenerations = 2; // Define max generations
const gameOverSound = new Audio("sounds/gameOver.wav");
const gameWinSound = new Audio("sounds/gameWin.wav");

let startButton;
let generationDisplay;

window.onload = function () {
  startButton = document.getElementById("start-button");
  generationDisplay = document.getElementById("generation-display");

  startButton.addEventListener("click", () => startGame(1)); // Start with 1st generation by default
  gameOver = true;

  // Add event listeners for each generation button
  for (let i = 1; i <= maxGenerations; i++) {
    document.getElementById(`generation${i}-button`).addEventListener("click", () => startGame(i));
  }
};

function startGame(selectedGeneration) {
  startButton.style.display = "none";
  canvas.style.display = "block";
  gameOver = false;
  gameWin = false;
  lives = 3;  // Reset lives when the game starts
  generation = selectedGeneration;
  updateGenerationDisplay();
  initializeGame();
}

function endGame() {
  if (gameWin) {
    gameWinSound.play();
    if (generation < maxGenerations) {
      generation++;
      updateGenerationDisplay();
      setTimeout(initializeGame, 2000);  // Move to the next generation after 2 seconds
    } else {
      displayMessage("You Win!");
      setTimeout(() => {
        gameOver = true;
        startButton.style.display = "block";
        canvas.style.display = "none";
        generation = 1;  // Reset generation
        updateGenerationDisplay();
      }, 3000);
    }
  } else if (lives > 0) {
    lives--;  // Decrease lives by one
    initializeGame();  // Reinitialize the game
  } else {
    gameOver = true;
    gameOverSound.play();
    displayMessage("Game Over!");
    setTimeout(() => {
      startButton.style.display = "block";
      canvas.style.display = "none";
      generation = 1;  // Reset generation
      updateGenerationDisplay();
    }, 3000);  // Reset the game after 3 seconds
  }
}

function resetGame() {
  startButton.style.display = "block";
  canvas.style.display = "none";
  gameOver = true;
  generation = 1;  // Reset generation
  updateGenerationDisplay();
}

function initializeGame() {
  if (generation === 1) {
    velocity = baseVelocity; // Set velocity to baseVelocity for generation1
  } else if (generation === 2) {
    velocity = baseVelocity + 2; // Set a different velocity for generation2
  } else {
    velocity = baseVelocity + (generation - 1) * 2;  // Increase difficulty more significantly with each generation
  }
  tileMap = new TileMap(tileSize);
  pacman = tileMap.getPacman(velocity);
  enemies = tileMap.getEnemies(velocity);
  tileMap.setCanvasSize(canvas);
  gameLoop();
}




function gameLoop() {
  if (gameOver || gameWin) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tileMap.draw(ctx);
  pacman.draw(ctx, pause(), enemies);
  enemies.forEach((enemy) => enemy.draw(ctx, pause(), pacman));
  displayLives();  // Display the number of lives
  
  if (detectCollision()) {
    endGame();
    return;
  }
  
  if (checkWinCondition()) {
    endGame();
    return;
  }
  
  requestAnimationFrame(gameLoop);
}

function detectCollision() {
  for (let i = 0; i < enemies.length; i++) {
    if (!pacman.powerDotActive && enemies[i].collideWith(pacman)) {
      return true;
    }
  }
  return false;
}

function checkWinCondition() {
  gameWin = tileMap.didWin();
  return gameWin;
}

function pause() {
  return !pacman.madeFirstMove || gameOver || gameWin;
}

function displayMessage(message) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, canvas.height / 3, canvas.width, 100);
  ctx.font = "50px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function displayLives() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`Lives: ${lives}`, 20, 30);  // Display the number of lives at the top-left corner
}

function updateGenerationDisplay() {
  generationDisplay.textContent = `Generation: ${generation}`;
}
