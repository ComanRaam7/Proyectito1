
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const instruction = document.getElementById("instruction");
const startButton = document.getElementById("startButton");

// ========================================
// PALETA DE COLORES GRAYSCALE
// ========================================

const COLORS = {
    background: "#191919",
    grid: "#292929",
    ground: "#303030",
    accent: "#64a19d",
    player: "#64a19d",
    playerEyes: "#161616",
    obstacle: "#777777",
    obstacleBorder: "#d9d9d9"
};

const ground = 250;

// ========================================
// JUGADOR
// ========================================

const player = {
    x: 80,
    y: 208,
    size: 38,
    velocityY: 0,
    gravity: 1800,
    jumpForce: -610,
    grounded: true,
    rotation: 0
};

// ========================================
// VARIABLES DEL JUEGO
// ========================================

let obstacles = [];
let score = 0;
let speed = 370;
let spawnTimer = 0;
let nextSpawn = 1.3;
let lastTime = 0;
let gameState = "ready";

// ========================================
// DIBUJAR FONDO
// ========================================

function drawBackground() {

    // Fondo principal
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cuadrícula
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ground);
        ctx.stroke();
    }

    for (let y = 10; y < ground; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Suelo
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, ground, canvas.width, 50);

    // Línea superior del suelo
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(0, ground, canvas.width, 4);
}

// ========================================
// DIBUJAR JUGADOR
// ========================================

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x + player.size / 2,
        player.y + player.size / 2
    );

    ctx.rotate(player.rotation);

    // Cuerpo del jugador
    ctx.fillStyle = COLORS.player;

    ctx.fillRect(
        -player.size / 2,
        -player.size / 2,
        player.size,
        player.size
    );

    // Ojos del cubo
    ctx.fillStyle = COLORS.playerEyes;

    ctx.fillRect(-9, -8, 7, 7);
    ctx.fillRect(5, -8, 7, 7);

    ctx.restore();
}

// ========================================
// CREAR OBSTÁCULOS
// ========================================

function createObstacle() {

    const height = 38;

    obstacles.push({
        x: canvas.width,
        y: ground - height,
        width: 38,
        height: height
    });
}

// ========================================
// DIBUJAR OBSTÁCULOS
// ========================================

function drawObstacles() {

    obstacles.forEach(obstacle => {

        ctx.fillStyle = COLORS.obstacle;

        ctx.beginPath();

        ctx.moveTo(obstacle.x, ground);

        ctx.lineTo(
            obstacle.x + obstacle.width / 2,
            obstacle.y
        );

        ctx.lineTo(
            obstacle.x + obstacle.width,
            ground
        );

        ctx.closePath();

        ctx.fill();

        // Borde del obstáculo
        ctx.strokeStyle = COLORS.obstacleBorder;
        ctx.lineWidth = 2;

        ctx.stroke();
    });
}

// ========================================
// SALTAR
// ========================================

function jump() {

    if (gameState === "ready") {
        startGame();
    }

    if (gameState !== "playing") return;

    if (player.grounded) {

        player.velocityY = player.jumpForce;
        player.grounded = false;
    }
}

// ========================================
// ACTUALIZAR JUGADOR
// ========================================

function updatePlayer(delta) {

    player.velocityY += player.gravity * delta;
    player.y += player.velocityY * delta;

    if (player.y + player.size >= ground) {

        player.y = ground - player.size;
        player.velocityY = 0;
        player.grounded = true;
        player.rotation = 0;

    } else {

        player.rotation += 5 * delta;
    }
}

// ========================================
// ACTUALIZAR OBSTÁCULOS
// ========================================

function updateObstacles(delta) {

    spawnTimer += delta;

    if (spawnTimer >= nextSpawn) {

        createObstacle();

        spawnTimer = 0;
        nextSpawn = 1.1 + Math.random() * 0.7;
    }

    obstacles.forEach(obstacle => {

        obstacle.x -= speed * delta;
    });

    obstacles = obstacles.filter(
        obstacle => obstacle.x + obstacle.width > 0
    );
}

// ========================================
// DETECTAR COLISIONES
// ========================================

function checkCollision() {

    for (const obstacle of obstacles) {

        const collision =
            player.x + player.size - 7 > obstacle.x + 7 &&
            player.x + 7 < obstacle.x + obstacle.width - 7 &&
            player.y + player.size - 5 > obstacle.y + 10;

        if (collision) {

            endGame();
            return;
        }
    }
}

// ========================================
// ACTUALIZAR PUNTUACIÓN
// ========================================

function updateScore(delta) {

    score += delta * 10;

    scoreElement.textContent = Math.floor(score);

    // Aumentar velocidad progresivamente
    speed = Math.min(370 + score * 1.5, 650);
}

// ========================================
// DIBUJAR TODO
// ========================================

function draw() {

    drawBackground();
    drawPlayer();
    drawObstacles();
}

// ========================================
// BUCLE PRINCIPAL
// ========================================

function gameLoop(timestamp) {

    const delta = Math.min((timestamp - lastTime) / 1000, 0.033);

    lastTime = timestamp;

    if (gameState === "playing") {

        updatePlayer(delta);
        updateObstacles(delta);
        updateScore(delta);
        checkCollision();
    }

    draw();

    requestAnimationFrame(gameLoop);
}

// ========================================
// INICIAR PARTIDA
// ========================================

function startGame() {

    player.y = ground - player.size;
    player.velocityY = 0;
    player.grounded = true;
    player.rotation = 0;

    obstacles = [];

    score = 0;
    speed = 370;
    spawnTimer = 0;
    nextSpawn = 1.3;

    scoreElement.textContent = "0";

    gameState = "playing";

    overlay.style.display = "none";
}

// ========================================
// FINALIZAR PARTIDA
// ========================================

function endGame() {

    gameState = "gameover";

    message.textContent = "¡GAME OVER!";

    instruction.textContent =
        "Puntuación final: " + Math.floor(score);

    startButton.textContent = "REINTENTAR";

    overlay.style.display = "flex";
}

// ========================================
// BOTÓN DE INICIO Y REINICIO
// ========================================

startButton.addEventListener("click", startGame);

// ========================================
// CONTROLES DEL TECLADO
// ========================================

document.addEventListener("keydown", function(event) {

    if (event.code === "Space" || event.code === "ArrowUp") {

        event.preventDefault();

        if (!event.repeat) {

            if (gameState === "gameover") {

                startGame();

            } else {

                jump();
            }
        }
    }
});

// ========================================
// CONTROL CON CLIC O PANTALLA TÁCTIL
// ========================================

canvas.addEventListener("pointerdown", function() {

    jump();
});

// ========================================
// INICIAR ANIMACIÓN
// ========================================

// Dibujar pantalla inicial
draw();

// Iniciar bucle del juego
requestAnimationFrame(gameLoop);
