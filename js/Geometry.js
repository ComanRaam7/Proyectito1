const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const instruction = document.getElementById("instruction");
const startButton = document.getElementById("startButton");

const ground = 250;

// Jugador
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

// Variables del juego
let obstacles = [];
let score = 0;
let speed = 370;
let spawnTimer = 0;
let nextSpawn = 1.3;
let lastTime = 0;
let gameState = "ready";

// Fondo
function drawBackground() {
    ctx.fillStyle = "#171733";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cuadrícula
    ctx.strokeStyle = "#29294d";
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
    ctx.fillStyle = "#30305d";
    ctx.fillRect(0, ground, canvas.width, 50);

    ctx.fillStyle = "#00eaff";
    ctx.fillRect(0, ground, canvas.width, 4);
}

// Dibujar jugador
function drawPlayer() {
    ctx.save();

    ctx.translate(
        player.x + player.size / 2,
        player.y + player.size / 2
    );

    ctx.rotate(player.rotation);

    ctx.fillStyle = "#00eaff";
    ctx.fillRect(
        -player.size / 2,
        -player.size / 2,
        player.size,
        player.size
    );

    // Ojos del cubo
    ctx.fillStyle = "#171733";
    ctx.fillRect(-9, -8, 7, 7);
    ctx.fillRect(5, -8, 7, 7);

    ctx.restore();
}

// Crear obstáculos
function createObstacle() {
    const height = 38;

    obstacles.push({
        x: canvas.width,
        y: ground - height,
        width: 38,
        height: height
    });
}

// Dibujar obstáculos
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = "#ff3864";

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

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// Saltar
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

// Actualizar jugador
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

// Actualizar obstáculos
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

// Detectar colisiones
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

// Actualizar puntuación
function updateScore(delta) {
    score += delta * 10;

    scoreElement.textContent = Math.floor(score);

    // Aumentar velocidad progresivamente
    speed = Math.min(370 + score * 1.5, 650);
}

// Dibujar todo
function draw() {
    drawBackground();
    drawPlayer();
    drawObstacles();
}

// Bucle principal
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

// Iniciar partida
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

// Finalizar partida
function endGame() {
    gameState = "gameover";

    message.textContent = "¡GAME OVER!";
    instruction.textContent =
        "Puntuación final: " + Math.floor(score);

    startButton.textContent = "REINTENTAR";

    overlay.style.display = "flex";
}

// Botón de inicio y reinicio
startButton.addEventListener("click", startGame);

// Controles del teclado
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

// Control con clic o pantalla táctil
canvas.addEventListener("pointerdown", function() {
    jump();
});

// Dibujar pantalla inicial
draw();

// Iniciar animación
requestAnimationFrame(gameLoop);