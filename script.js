const player = document.getElementById('player');
const game = document.querySelector('.game');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const portfolioBtn = document.getElementById('portfolio-btn');
const btnPortfolio = document.getElementById('btn-portfolio');
const volumeControl = document.getElementById('volume-control');
const milestoneSound = new Audio('sons/milestone.mp3');

const gameCompleteScreen = document.getElementById('game-complete');
const playAgainBtn = document.getElementById('play-again-btn');
const backPortfolioBtn = document.getElementById('back-portfolio-btn');

// Sons
const jumpSound = new Audio('sons/jump.mp3');
const gameOverSound = new Audio('sons/gameover.mp3');
const backgroundMusic = new Audio('sons/background.mp3');
const gameCompleteSound = new Audio('sons/win.mp3'); // Som do fim do jogo
gameCompleteSound.preload = 'auto';

// Sons de moeda
const coinSounds = [
  new Audio('sons/coin.mp3'),
  new Audio('sons/coin.mp3'),
  new Audio('sons/coin.mp3'),
];
let coinSoundIndex = 0;

backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

let isJumping = false;
let velocity = 0;
const gravity = 0.5;
const jumpPower = 13;
let positionY = 0;
const groundHeight = 140;

let score = 0;
let gameRunning = true;
let lastMilestoneScore = -1; // Controle milestone

let musicStarted = false;

function startMusic() {
  if (!musicStarted) {
    backgroundMusic.play().catch(() => {});
    musicStarted = true;
    document.removeEventListener('click', startMusic);
  }
}

document.addEventListener('click', startMusic);

function jump() {
  if (!isJumping && gameRunning) {
    velocity = jumpPower;
    isJumping = true;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

function gameLoop() {
  if (!gameRunning) return;

  velocity -= gravity;
  positionY += velocity;

  if (positionY <= 0) {
    positionY = 0;
    velocity = 0;
    isJumping = false;
  }

  player.style.bottom = `${groundHeight + positionY}px`;
  requestAnimationFrame(gameLoop);

  // Milestone a cada 10 pontos
  if (score > 0 && score % 10 === 0 && score !== lastMilestoneScore) {
    showMilestone(`Sweeet! ${score} points!`);
    milestoneSound.play();
    lastMilestoneScore = score;
  }
}

function showMilestone(text) {
  const milestone = document.getElementById('milestone');
  milestone.innerText = text;
  milestone.style.display = 'flex';
  setTimeout(() => {
    milestone.style.display = 'none';
  }, 1500);
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') jump();
});

function gameOver() {
  gameRunning = false;
  finalScoreText.innerText = `Only ${score} points? Bruh...`;
  gameOverScreen.style.display = 'flex';
  backgroundMusic.pause();
  gameOverSound.play();
  player.style.backgroundImage = "url('img/playerdead.png')";
}

function gameComplete() {
  gameRunning = false;
  backgroundMusic.pause();
  gameCompleteSound.currentTime = 0;
  gameCompleteSound.play();

  gameOverScreen.style.display = 'none';
  gameCompleteScreen.style.display = 'flex';
}

restartBtn.addEventListener('click', () => {
  location.reload();
});

portfolioBtn.addEventListener('click', () => {
  window.location.href = '../eng/home.html';
});

btnPortfolio.addEventListener('click', () => {
  window.location.href = '../eng/home.html';
});

playAgainBtn.addEventListener('click', () => {
  location.reload();
});

backPortfolioBtn.addEventListener('click', () => {
  window.location.href = '../eng/home.html';
});

volumeControl.addEventListener('input', () => {
  const volume = parseFloat(volumeControl.value);
  backgroundMusic.volume = volume;
  jumpSound.volume = volume;
  gameOverSound.volume = volume;
  milestoneSound.volume = volume;
  gameCompleteSound.volume = volume;
  coinSounds.forEach(sound => sound.volume = volume);
});

gameLoop();

function spawnObstacle() {
  if (!gameRunning) return;

  const obstacle = document.createElement('img');
  obstacle.classList.add('obstacle');

  const height = Math.floor(Math.random() * 50) + 30;
  const width = Math.floor(Math.random() * 40) + 30;

  obstacle.style.height = `${height}px`;
  obstacle.style.width = `${width}px`;
  obstacle.style.position = 'absolute';
  obstacle.style.bottom = '150px';

  game.appendChild(obstacle);

  let pos = window.innerWidth;
  let scored = false;

  function move() {
    if (!gameRunning) {
      obstacle.remove();
      return;
    }

    pos -= 5;
    obstacle.style.left = `${pos}px`;

    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    const playerHitbox = {
      top: playerRect.top + 10,
      bottom: playerRect.bottom - 10,
      left: playerRect.left + 10,
      right: playerRect.right - 10,
    };

    const isColliding = !(
      playerHitbox.top > obstacleRect.bottom ||
      playerHitbox.bottom < obstacleRect.top ||
      playerHitbox.right < obstacleRect.left ||
      playerHitbox.left > obstacleRect.right
    );

    if (isColliding) {
      gameOver();
      return;
    }

    if (!scored && pos + width < player.offsetLeft) {
      score++;
      scoreDisplay.innerText = `Score: ${score}`;

      // Som moeda imediatamente
      const sound = coinSounds[coinSoundIndex];
      sound.pause();
      sound.currentTime = 0;
      sound.play();
      coinSoundIndex = (coinSoundIndex + 1) % coinSounds.length;

      scored = true;

      if(score >= 50){
        gameComplete();
      }
    }

    if (pos < -width) {
      obstacle.remove();
      return;
    }

    requestAnimationFrame(move);
  }

  move();
}

setInterval(() => {
  if (gameRunning) spawnObstacle();
}, 2000);
