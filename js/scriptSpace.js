document.addEventListener("DOMContentLoaded", () => {
    const grade = document.getElementById("grade");
    const pontuacao = document.getElementById("pontuacao");
    const oleadaDisplay = document.getElementById("oleada");
    const gameOverPanel = document.getElementById("game-over-panel");
    const btnReiniciar = document.getElementById("reiniciar");

    const tamanho = 15; // Cuadrícula 15x15
    const formacionInicial = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39
    ];

    // Crear las 225 celdas una sola vez
    grade.innerHTML = "";
    for (let i = 0; i < tamanho * tamanho; i++) {
        let quadrado = document.createElement("div");
        grade.appendChild(quadrado);
    }

    const quadrados = document.querySelectorAll("#grade div");

    // Variables de estado del juego
    let invasores = [];
    let posicaoJogador = 202;
    let direcao = 1;
    let descer = false;
    let invasoresId = null;
    let atingidos = [];
    let pontos = 0;
    let oleada = 1;
    let velocidad = 300;
    let juegoTerminado = false;

    function iniciarJuego() {
        clearInterval(invasoresId);
        juegoTerminado = false;
        pontos = 0;
        oleada = 1;
        velocidad = 300;
        posicaoJogador = 202;

        pontuacao.textContent = pontos;
        oleadaDisplay.textContent = oleada;
        gameOverPanel.style.display = "none";

        // Limpiar todo el tablero visualmente
        quadrados.forEach(q => q.classList.remove("invasor", "jogador", "tiro", "KABUM"));

        quadrados[posicaoJogador].classList.add("jogador");
        generarOleada();
    }

    function generarOleada() {
        clearInterval(invasoresId);
        
        // Limpiar restos de naves o explosiones previas
        quadrados.forEach(q => q.classList.remove("invasor", "KABUM"));

        invasores = [...formacionInicial];
        atingidos = [];
        direcao = 1;
        descer = false;

        invasores.forEach(invasor => {
            quadrados[invasor].classList.add("invasor");
        });

        invasoresId = setInterval(moverInvasores, velocidad);
    }

    function moverJogador(event) {
        if (juegoTerminado) return;

        // Evitar que las flechas o el espacio muevan el scroll del navegador
        if ([32, 37, 38, 39, 40].includes(event.keyCode)) {
            if (event.preventDefault) event.preventDefault();
        }

        quadrados[posicaoJogador].classList.remove("jogador");

        if (event.keyCode === 37) { // Izquierda
            if (posicaoJogador % tamanho !== 0) {
                posicaoJogador--;
            }
        } else if (event.keyCode === 39) { // Derecha
            if (posicaoJogador % tamanho !== tamanho - 1) {
                posicaoJogador++;
            }
        }

        quadrados[posicaoJogador].classList.add("jogador");
    }

    function moverInvasores() {
        if (juegoTerminado) return;

        // Calcular los extremos reales solo con los invasores que siguen vivos
        const vivos = invasores.filter((_, idx) => !atingidos.includes(idx));
        if (vivos.length === 0) return;

        const bordaEsquerda = vivos.some(pos => pos % tamanho === 0);
        const bordaDireita = vivos.some(pos => pos % tamanho === tamanho - 1);

        invasores.forEach(invasor => {
            if (quadrados[invasor]) {
                quadrados[invasor].classList.remove("invasor");
            }
        });

        if (bordaEsquerda && direcao === -1) {
            direcao = 1;
            descer = true;
        } else if (bordaDireita && direcao === 1) {
            direcao = -1;
            descer = true;
        }

        for (let i = 0; i < invasores.length; i++) {
            invasores[i] += descer ? tamanho : direcao;
        }

        descer = false;

        // Verificar derrota (si un invasor vivo toca al jugador o llega a la fila inferior)
        for (let i = 0; i < invasores.length; i++) {
            if (!atingidos.includes(i)) {
                const pos = invasores[i];
                if (pos >= quadrados.length - tamanho || pos === posicaoJogador) {
                    terminarJuego();
                    return;
                }
                quadrados[pos].classList.add("invasor");
            }
        }
    }

    function terminarJuego() {
        juegoTerminado = true;
        clearInterval(invasoresId);
        gameOverPanel.style.display = "block";
    }

    function atirar(e) {
        if (juegoTerminado) return;

        if (e.keyCode === 32) {
            if (e.preventDefault) e.preventDefault();
            let posicaoTiro = posicaoJogador;
            let tiroId = setInterval(moverTiro, 80);

            function moverTiro() {
                if (juegoTerminado) {
                    clearInterval(tiroId);
                    quadrados[posicaoTiro].classList.remove("tiro");
                    return;
                }

                quadrados[posicaoTiro].classList.remove("tiro");
                posicaoTiro -= tamanho;

                // Si el disparo sale por arriba del tablero
                if (posicaoTiro < 0) {
                    clearInterval(tiroId);
                    return;
                }

                if (quadrados[posicaoTiro].classList.contains("invasor")) {
                    quadrados[posicaoTiro].classList.remove("tiro");
                    quadrados[posicaoTiro].classList.remove("invasor");
                    quadrados[posicaoTiro].classList.add("KABUM");

                    const celdaImpacto = posicaoTiro;
                    setTimeout(() => {
                        quadrados[celdaImpacto].classList.remove("KABUM");
                    }, 250);

                    clearInterval(tiroId);

                    const indiceInvasor = invasores.indexOf(posicaoTiro);
                    if (indiceInvasor !== -1 && !atingidos.includes(indiceInvasor)) {
                        atingidos.push(indiceInvasor);
                        pontos += 10;
                        pontuacao.textContent = pontos;
                    }

                    // Si se eliminaron todos los invasores de la oleada actual
                    if (atingidos.length === invasores.length) {
                        clearInterval(invasoresId);
                        oleada++;
                        oleadaDisplay.textContent = oleada;
                        // Aumentar velocidad hasta un límite jugable de 100ms
                        velocidad = Math.max(100, velocidad - 35);
                        setTimeout(() => {
                            if (!juegoTerminado) generarOleada();
                        }, 600);
                    }
                    return;
                }

                quadrados[posicaoTiro].classList.add("tiro");
            }
        }
    }

    // Eventos de botones en pantalla y teclado
    document.getElementById("esquerda").addEventListener("click", () => moverJogador({ keyCode: 37 }));
    document.getElementById("direita").addEventListener("click", () => moverJogador({ keyCode: 39 }));
    document.getElementById("atirar").addEventListener("click", () => atirar({ keyCode: 32 }));
    btnReiniciar.addEventListener("click", iniciarJuego);

    document.addEventListener("keydown", moverJogador);
    document.addEventListener("keyup", atirar);

    // Arrancar la primera partida
    iniciarJuego();
});