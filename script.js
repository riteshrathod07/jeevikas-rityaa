"use strict";

/* ==========================================
   JEEVIKA'S RITYAA
   Complete romantic mini-game.
   No user configuration required.
========================================== */

const $ = (id) => document.getElementById(id);

const ui = {
  brandTitle: $("brandTitle"),
  topNote: $("topNote"),

  welcomeScreen: $("welcomeScreen"),
  welcomeEyebrow: $("welcomeEyebrow"),
  welcomeTitle: $("welcomeTitle"),
  welcomeDescription: $("welcomeDescription"),
  startButton: $("startButton"),
  startButtonText: $("startButtonText"),
  welcomeFooter: $("welcomeFooter"),

  gameScreen: $("gameScreen"),
  gameEyebrow: $("gameEyebrow"),
  gameTitle: $("gameTitle"),
  gameDescription: $("gameDescription"),
  scoreLabel: $("scoreLabel"),
  targetLabel: $("targetLabel"),
  timeLabel: $("timeLabel"),
  score: $("score"),
  targetScore: $("targetScore"),
  timeLeft: $("timeLeft"),
  gameBoard: $("gameBoard"),
  basket: $("basket"),
  boardMessage: $("boardMessage"),
  boardMessageText: $("boardMessageText"),
  leftButton: $("leftButton"),
  rightButton: $("rightButton"),
  playButton: $("playButton"),
  playButtonText: $("playButtonText"),
  controlHint: $("controlHint"),

  resultScreen: $("resultScreen"),
  resultEyebrow: $("resultEyebrow"),
  resultTitle: $("resultTitle"),
  resultMessage: $("resultMessage"),
  finalScoreLabel: $("finalScoreLabel"),
  finalScore: $("finalScore"),
  replayButton: $("replayButton"),
  replayButtonText: $("replayButtonText"),
  homeButton: $("homeButton"),
  footerText: $("footerText")
};

/* Game settings */

const SETTINGS = {
  target: 20,
  duration: 30,
  spawnInterval: 650,
  fallSpeed: 155,
  basketStep: 7,
  heartSymbols: ["♥", "♡", "❤", "💗"]
};

/* All website text is already written here. */

const COPY = {
  title: "JEEVIKA'S RITYAA",

  topNote: "A LITTLE WORLD OF OUR OWN",
  footer: "A LITTLE WORLD MADE WITH LOVE FOR MY DEAR PRINCESS",

  welcomeEyebrow: "SOMETHING SPECIAL, JUST FOR YOU FROM YOUR BHONDU",
  welcomeDescription:
    "MADE WITH LOVE FOR MY BELOVED GF",
  welcomeButton: "I LOVE YOU JEEVIKA",
  welcomeFooter: "A LITTLE LOVE NOTE FROM RITYAA FOR HIS JAANU",

  gameEyebrow: "YOUR LITTLE LOVE QUEST",
  gameTitle: "Catch the love",
  gameDescription:
    "Every heart is a little piece of happiness. Catch as many as you can!",
  scoreLabel: "HEARTS CAUGHT",
  targetLabel: "HEARTS TO WIN",
  timeLabel: "TIME LEFT",
  startGameButton: "Let's play",
  readyMessage: "Ready, pretty girl? Let's collect some love.",
  controlHint: "Move with the arrows, tap the buttons, or touch the board.",

  winEyebrow: "BABYYY TU JITT GAYII ",
  winTitle: "You caught all my love!",
  winMessage:
    "yeahhhhhh you did it !! congratsss baygirlll aapko miltaa hai bht saara pyar.\n\nYou deserve all the flowers, all the happiness, all the forehead kisses, and all the little moments that make life beautiful.\n\nAnd if I could make one wish, it would be to see that pretty smile of yours a thousand more times. ♡",

  loseEyebrow: "OOPS! GAME KI AISI TAISI MERI",
  loseTitle: "EK AUR BAAR TRY KAR TOH",
  loseMessage:
    "Babyyyy i love youu so muchh tu bht pyari hai yk.\n\nTake a breath, smile a little, and try again. There are always more hearts to catch and more reasons to be happy. ♡",

  finalScoreLabel: "HEARTS YOU COLLECTED",
  replayButton: "Let's play again",
  homeButton: "I LOVE YOU RITYA"
};

/* Runtime state */

const game = {
  score: 0,
  timeLeft: SETTINGS.duration,
  basketX: 50,
  hearts: [],
  running: false,
  frameId: null,
  lastFrame: 0,
  lastSpawn: 0,
  endTime: 0,
  pointerActive: false
};

/* Safe text helpers */

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function applyCopy() {
  document.title = COPY.title;

  setText(ui.brandTitle, COPY.title);
  setText(ui.topNote, COPY.topNote);

  setText(ui.welcomeEyebrow, COPY.welcomeEyebrow);
  ui.welcomeTitle.innerHTML = "JEEVIKA'S <em>RITYAA</em>";
  setText(ui.welcomeDescription, COPY.welcomeDescription);
  setText(ui.startButtonText, COPY.welcomeButton);
  setText(ui.welcomeFooter, COPY.welcomeFooter);

  setText(ui.gameEyebrow, COPY.gameEyebrow);
  setText(ui.gameTitle, COPY.gameTitle);
  setText(ui.gameDescription, COPY.gameDescription);
  setText(ui.scoreLabel, COPY.scoreLabel);
  setText(ui.targetLabel, COPY.targetLabel);
  setText(ui.timeLabel, COPY.timeLabel);
  setText(ui.targetScore, String(SETTINGS.target));
  setText(ui.playButtonText, COPY.startGameButton);
  setText(ui.boardMessageText, COPY.readyMessage);
  setText(ui.controlHint, COPY.controlHint);

  setText(ui.finalScoreLabel, COPY.finalScoreLabel);
  setText(ui.replayButtonText, COPY.replayButton);
  setText(ui.homeButton, COPY.homeButton);
  setText(ui.footerText, COPY.footer);
}

/* Screen navigation */

function showScreen(activeScreen) {
  const screens = [
    ui.welcomeScreen,
    ui.gameScreen,
    ui.resultScreen
  ];

  screens.forEach((screen) => {
    const isActive = screen === activeScreen;

    screen.hidden = !isActive;
    screen.classList.toggle("active", isActive);
  });
}

/* Game cleanup and reset */

function stopGame() {
  game.running = false;

  if (game.frameId !== null) {
    cancelAnimationFrame(game.frameId);
    game.frameId = null;
  }
}

function clearHearts() {
  game.hearts.forEach(({ element }) => element.remove());
  game.hearts = [];
}

function resetGame() {
  stopGame();
  clearHearts();

  game.score = 0;
  game.timeLeft = SETTINGS.duration;
  game.basketX = 50;
  game.lastFrame = 0;
  game.lastSpawn = 0;
  game.endTime = 0;

  ui.basket.style.left = "50%";
  ui.boardMessage.style.opacity = "1";

  updateStats();
}

function updateStats() {
  setText(ui.score, String(game.score));
  setText(ui.timeLeft, String(game.timeLeft));
}

/* Basket movement */

function moveBasket(direction) {
  if (!game.running) return;

  game.basketX = Math.max(
    7,
    Math.min(93, game.basketX + direction * SETTINGS.basketStep)
  );

  ui.basket.style.left = `${game.basketX}%`;
}

/* Falling hearts */

function spawnHeart() {
  const element = document.createElement("span");

  element.className = "falling-heart";
  element.setAttribute("aria-hidden", "true");

  const symbols = SETTINGS.heartSymbols;

  element.textContent =
    symbols[Math.floor(Math.random() * symbols.length)];

  const boardWidth = ui.gameBoard.clientWidth;
  const x = Math.random() * Math.max(1, boardWidth - 34);

  element.style.left = `${x}px`;
  ui.gameBoard.appendChild(element);

  game.hearts.push({
    element,
    x,
    y: -35,
    speed: SETTINGS.fallSpeed * (0.8 + Math.random() * 0.4)
  });
}

/* Collision detection */

function isCaught(heart) {
  const boardWidth = ui.gameBoard.clientWidth;
  const boardHeight = ui.gameBoard.clientHeight;
  const basketWidth = ui.basket.offsetWidth;

  const basketCenter = (game.basketX / 100) * boardWidth;
  const heartCenter = heart.x + 17;

  const horizontalHit =
    heartCenter >= basketCenter - basketWidth / 2 &&
    heartCenter <= basketCenter + basketWidth / 2;

  const verticalHit =
    heart.y + 28 >= boardHeight - 66 &&
    heart.y <= boardHeight - 10;

  return horizontalHit && verticalHit;
}

function updateHearts(deltaTime) {
  const boardHeight = ui.gameBoard.clientHeight;
  const seconds = deltaTime / 1000;

  game.hearts = game.hearts.filter((heart) => {
    heart.y += heart.speed * seconds;
    heart.element.style.top = `${heart.y}px`;

    if (isCaught(heart)) {
      heart.element.remove();
      game.score += 1;
      updateStats();

      if (game.score >= SETTINGS.target) {
        finishGame(true);
      }

      return false;
    }

    if (heart.y > boardHeight) {
      heart.element.remove();
      return false;
    }

    return true;
  });
}

/* Main animation and timer */

function gameLoop(timestamp) {
  if (!game.running) return;

  if (game.lastFrame === 0) {
    game.lastFrame = timestamp;
    game.lastSpawn = timestamp;
    game.endTime = timestamp + SETTINGS.duration * 1000;
  }

  const deltaTime = Math.min(timestamp - game.lastFrame, 50);
  game.lastFrame = timestamp;

  if (timestamp - game.lastSpawn >= SETTINGS.spawnInterval) {
    spawnHeart();
    game.lastSpawn = timestamp;
  }

  updateHearts(deltaTime);

  if (!game.running) return;

  game.timeLeft = Math.max(
    0,
    Math.ceil((game.endTime - timestamp) / 1000)
  );

  updateStats();

  if (game.timeLeft <= 0) {
    finishGame(game.score >= SETTINGS.target);
    return;
  }

  game.frameId = requestAnimationFrame(gameLoop);
}

/* Game start and result */

function startGame() {
  resetGame();

  game.running = true;
  ui.boardMessage.style.opacity = "0";

  game.frameId = requestAnimationFrame(gameLoop);
}

function finishGame(won) {
  if (!game.running) return;

  stopGame();
  clearHearts();

  setText(
    ui.resultEyebrow,
    won ? COPY.winEyebrow : COPY.loseEyebrow
  );

  setText(
    ui.resultTitle,
    won ? COPY.winTitle : COPY.loseTitle
  );

  setText(
    ui.resultMessage,
    won ? COPY.winMessage : COPY.loseMessage
  );

  setText(ui.finalScore, String(game.score));

  showScreen(ui.resultScreen);
}

function goHome() {
  resetGame();
  showScreen(ui.welcomeScreen);
}

/* Mouse, keyboard, and touch controls */

function bindEvents() {
  ui.startButton.addEventListener("click", () => {
    resetGame();
    showScreen(ui.gameScreen);
  });

  ui.playButton.addEventListener("click", () => {
    if (!game.running) {
      startGame();
    }
  });

  ui.replayButton.addEventListener("click", () => {
    showScreen(ui.gameScreen);
    startGame();
  });

  ui.homeButton.addEventListener("click", goHome);

  ui.leftButton.addEventListener("click", () => moveBasket(-1));
  ui.rightButton.addEventListener("click", () => moveBasket(1));

  document.addEventListener("keydown", (event) => {
    if (!game.running) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
    }

    if (event.key === "ArrowLeft") moveBasket(-1);
    if (event.key === "ArrowRight") moveBasket(1);
  });

  ui.gameBoard.addEventListener("pointerdown", (event) => {
    if (!game.running) return;

    game.pointerActive = true;
    ui.gameBoard.setPointerCapture?.(event.pointerId);
    moveBasketToPointer(event);
  });

  ui.gameBoard.addEventListener("pointermove", (event) => {
    if (!game.running || !game.pointerActive) return;

    moveBasketToPointer(event);
  });

  ui.gameBoard.addEventListener("pointerup", () => {
    game.pointerActive = false;
  });

  ui.gameBoard.addEventListener("pointercancel", () => {
    game.pointerActive = false;
  });
}

function moveBasketToPointer(event) {
  const bounds = ui.gameBoard.getBoundingClientRect();

  const position =
    ((event.clientX - bounds.left) / bounds.width) * 100;

  game.basketX = Math.max(7, Math.min(93, position));
  ui.basket.style.left = `${game.basketX}%`;
}

/* Initialize everything */

function initializeGame() {
  applyCopy();
  resetGame();
  bindEvents();
  showScreen(ui.welcomeScreen);
}

initializeGame();