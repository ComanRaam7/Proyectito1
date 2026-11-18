
const game = document.getElementById("game-container");
const bird = document.getElementById("bird");
const obstaclesContainer = document.getElementById("obstacles");

const scoreElement = document.getElementById("score");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const instruction = document.getElementById("instruction");
const startButton = document.getElementById("startButton");

// CONFIGURACIÓN
const BIRD_SIZE = 36;
const PIPE_WIDTH = 66;
const PIPE_GAP = 175;
const GROUND_HEIGHT = 38;

const GRAVITY = 1450;
const FLAP_FORCE = -470;

// VARIABLES DEL JUGADOR
let birdX = 0;
let birdY = 0;
let birdVelocity = 0;

// VARIABLES DEL JUEGO
let pipes = [];
let score = 0;
let speed = 185;

let spawnTimer = 0;
let gameState = "ready";
let lastTime = 0;

// ALTURA JUGABLE
function getPlayableHeight() {
    return game.clientHeight - GROUND_HEIGHT;
}

// RESTABLECER POSICIÓN DEL CUBO
function resetBird() {
    birdX = game.clientWidth * 0.22;
    birdY = getPlayableHeight() * 0.45;

    birdVelocity = 0;

    bird.style.left = birdX + "px";
    bird.style.top = birdY + "px";
    bird.style.transform = "rotate(0deg)";
}

// INICIAR PARTIDA
function startGame() {

    score = 0;
    speed = 185;
    spawnTimer = 0;

    pipes = [];

    obstaclesContainer.innerHTML = "";

    scoreElement.textContent = "0";

    // Restablecer cubo
    resetBird();

    // Impulso inicial
    birdVelocity = FLAP_FORCE;

    // Ocultar menú
    overlay.classList.add("hidden");

    // Cambiar estado
    gameState = "playing";

    lastTime = performance.now();
}

// SALTO
function flap() {

    if (gameState !== "playing") return;

    birdVelocity = FLAP_FORCE;
}

// CREAR OBSTÁCULOS
function createPipe() {

    const playableHeight = getPlayableHeight();

    const minHeight = playableHeight * 0.14;

    const maxHeight =
        playableHeight - PIPE_GAP - playableHeight * 0.14;

    const topHeight =
        minHeight + Math.random() * (maxHeight - minHeight);

    const bottomY = topHeight + PIPE_GAP;

    const bottomHeight = playableHeight - bottomY;

    // Crear pareja de obstáculos
    const pair = document.createElement("div");

    pair.className = "pipe-pair";

    // Tubo superior
    const topPipe = document.createElement("div");

    topPipe.className = "pipe top";

    topPipe.style.height = topHeight + "px";

    // Tubo inferior
    const bottomPipe = document.createElement("div");

    bottomPipe.className = "pipe bottom";

    bottomPipe.style.top = bottomY + "px";

    bottomPipe.style.height = bottomHeight + "px";

    // Agregar tubos
    pair.appendChild(topPipe);
    pair.appendChild(bottomPipe);

    obstaclesContainer.appendChild(pair);

    // Registrar obstáculo
    pipes.push({
        element: pair,
        x: game.clientWidth,
        topHeight: topHeight,
        bottomY: bottomY,
        passed: false
    });
}

// ACTUALIZAR CUBO
function updateBird(delta) {

    // Física
    birdVelocity += GRAVITY * delta;

    birdY += birdVelocity * delta;

    // Rotación
    const rotation = Math.max(
        -25,
        Math.min(80, birdVelocity * 0.09)
    );

    bird.style.top = birdY + "px";

    bird.style.transform = `rotate(${rotation}deg)`;

    // Detectar techo y suelo
    if (
        birdY <= 0 ||
        birdY + BIRD_SIZE >= getPlayableHeight()
    ) {
        gameOver();
    }
}

// ACTUALIZAR OBSTÁCULOS
function updatePipes(delta) {

    spawnTimer += delta;

    // Generar nuevos obstáculos
    if (spawnTimer >= 1.55) {

        createPipe();

        spawnTimer = 0;
    }

    // Movimiento y colisiones
    for (const pipe of pipes) {

        pipe.x -= speed * delta;

        pipe.element.style.transform =
            `translateX(${pipe.x}px)`;

        // SUMAR PUNTOS
        if (
            !pipe.passed &&
            pipe.x + PIPE_WIDTH < birdX
        ) {

            pipe.passed = true;

            score++;

            scoreElement.textContent = score;

            // Aumentar velocidad
            speed = Math.min(185 + score * 5, 300);
        }

        // COLISIÓN HORIZONTAL
        const horizontalCollision =
            birdX + BIRD_SIZE - 5 > pipe.x &&
            birdX + 5 < pipe.x + PIPE_WIDTH;

        if (horizontalCollision) {

            // COLISIÓN CON TUBO SUPERIOR
            const topCollision =
                birdY + 5 < pipe.topHeight;

            // COLISIÓN CON TUBO INFERIOR
            const bottomCollision =
                birdY + BIRD_SIZE - 5 > pipe.bottomY;

            if (topCollision || bottomCollision) {

                gameOver();

                return;
            }
        }
    }

    // ELIMINAR OBSTÁCULOS FUERA DE PANTALLA
    pipes = pipes.filter(pipe => {

        if (pipe.x + PIPE_WIDTH < 0) {

            pipe.element.remove();

            return false;
        }

        return true;
    });
}

// FINALIZAR PARTIDA
function gameOver() {

    if (gameState !== "playing") return;

    gameState = "gameover";

    message.textContent = "¡GAME OVER!";

    instruction.textContent =
        "Tu puntuación: " + score;

    startButton.textContent = "REINTENTAR";

    // Mostrar nuevamente el menú
    overlay.classList.remove("hidden");
}

// BUCLE PRINCIPAL
function gameLoop(timestamp) {

    const delta = Math.min(
        (timestamp - lastTime) / 1000,
        0.04
    );

    lastTime = timestamp;

    if (gameState === "playing") {

        updateBird(delta);

        // Evitar actualizar obstáculos después de perder
        if (gameState === "playing") {

            updatePipes(delta);
        }
    }

    requestAnimationFrame(gameLoop);
}

// BOTÓN JUGAR Y REINTENTAR
startButton.addEventListener("click", function() {

    if (
        gameState === "ready" ||
        gameState === "gameover"
    ) {
        startGame();
    }

});

// CONTROLES DEL TECLADO
document.addEventListener("keydown", function(event) {

    if (
        event.code === "Space" ||
        event.code === "ArrowUp"
    ) {

        event.preventDefault();

        if (event.repeat) return;

        if (
            gameState === "ready" ||
            gameState === "gameover"
        ) {

            startGame();

        } else {

            flap();

        }
    }

});

// CLIC Y PANTALLA TÁCTIL
game.addEventListener("pointerdown", function(event) {

    // Evitar activar el juego desde el botón
    if (event.target.closest("button")) return;

    if (
        gameState === "ready" ||
        gameState === "gameover"
    ) {

        startGame();

    } else {

        flap();

    }

});

// PREPARAR JUEGO
resetBird();

// INICIAR ANIMACIÓN
requestAnimationFrame(gameLoop);
