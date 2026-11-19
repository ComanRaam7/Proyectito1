
document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTOS DEL HTML

    const cuadricula = document.getElementById("grade");
    const elementoPuntuacion = document.getElementById("pontuacao");
    const elementoOleada = document.getElementById("oleada");
    const panelFinJuego = document.getElementById("game-over-panel");
    const botonReiniciar = document.getElementById("reiniciar");

    // CONFIGURACIÓN DEL JUEGO

    const tamanoCuadricula = 15;

    const formacionInicial = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39
    ];

    // Crear las 225 celdas una sola vez.

    cuadricula.innerHTML = "";

    for (let i = 0; i < tamanoCuadricula * tamanoCuadricula; i++) {

        const celda = document.createElement("div");

        cuadricula.appendChild(celda);
    }

    const celdas = document.querySelectorAll("#grade div");

    // VARIABLES DEL JUEGO

    let invasores = [];
    let posicionJugador = 202;
    let direccion = 1;
    let debeBajar = false;
    let intervaloInvasores = null;
    let invasoresEliminados = [];
    let puntos = 0;
    let oleada = 1;
    let velocidad = 300;
    let juegoTerminado = false;

    // INICIAR JUEGO

    function iniciarJuego() {

        clearInterval(intervaloInvasores);

        juegoTerminado = false;
        puntos = 0;
        oleada = 1;
        velocidad = 300;
        posicionJugador = 202;

        elementoPuntuacion.textContent = puntos;
        elementoOleada.textContent = oleada;

        panelFinJuego.style.display = "none";

        // Limpiar el tablero visualmente.

        celdas.forEach(celda => {

            celda.classList.remove(
                "invasor",
                "jogador",
                "tiro",
                "KABUM"
            );
        });

        // Mostrar al jugador en su posición inicial.

        celdas[posicionJugador].classList.add("jogador");

        generarOleada();
    }

    // GENERAR OLEADA

    function generarOleada() {

        clearInterval(intervaloInvasores);

        // Limpiar los restos de naves y explosiones anteriores.

        celdas.forEach(celda => {

            celda.classList.remove("invasor", "KABUM");
        });

        invasores = [...formacionInicial];

        invasoresEliminados = [];

        direccion = 1;
        debeBajar = false;

        // Dibujar los invasores.

        invasores.forEach(posicion => {

            celdas[posicion].classList.add("invasor");
        });

        // Iniciar el movimiento automático.

        intervaloInvasores = setInterval(
            moverInvasores,
            velocidad
        );
    }

    // MOVER JUGADOR

    function moverJugador(evento) {

        if (juegoTerminado) return;

        // Evitar que las teclas muevan el desplazamiento del navegador.

        if ([32, 37, 38, 39, 40].includes(evento.keyCode)) {

            if (evento.preventDefault) {
                evento.preventDefault();
            }
        }

        // Eliminar la posición anterior del jugador.

        celdas[posicionJugador].classList.remove("jogador");

        // Mover a la izquierda.

        if (evento.keyCode === 37) {

            if (posicionJugador % tamanoCuadricula !== 0) {

                posicionJugador--;
            }
        }

        // Mover a la derecha.

        else if (evento.keyCode === 39) {

            if (
                posicionJugador % tamanoCuadricula !==
                tamanoCuadricula - 1
            ) {

                posicionJugador++;
            }
        }

        // Dibujar al jugador en su nueva posición.

        celdas[posicionJugador].classList.add("jogador");
    }

    // MOVER INVASORES

    function moverInvasores() {

        if (juegoTerminado) return;

        // Obtener únicamente los invasores que siguen vivos.

        const invasoresVivos = invasores.filter(
            (_, indice) => !invasoresEliminados.includes(indice)
        );

        if (invasoresVivos.length === 0) return;

        // Comprobar los extremos de la formación.

        const bordeIzquierdo = invasoresVivos.some(
            posicion => posicion % tamanoCuadricula === 0
        );

        const bordeDerecho = invasoresVivos.some(
            posicion => posicion % tamanoCuadricula === tamanoCuadricula - 1
        );

        // Limpiar las posiciones anteriores.

        invasores.forEach(posicion => {

            if (celdas[posicion]) {

                celdas[posicion].classList.remove("invasor");
            }
        });

        // Cambiar de dirección al llegar a los bordes.

        if (bordeIzquierdo && direccion === -1) {

            direccion = 1;
            debeBajar = true;

        } else if (bordeDerecho && direccion === 1) {

            direccion = -1;
            debeBajar = true;
        }

        // Actualizar las posiciones.

        for (let i = 0; i < invasores.length; i++) {

            invasores[i] += debeBajar
                ? tamanoCuadricula
                : direccion;
        }

        debeBajar = false;

        // Comprobar si los invasores alcanzaron al jugador.

        for (let i = 0; i < invasores.length; i++) {

            if (!invasoresEliminados.includes(i)) {

                const posicion = invasores[i];

                if (
                    posicion >= celdas.length - tamanoCuadricula ||
                    posicion === posicionJugador
                ) {

                    finalizarJuego();

                    return;
                }

                // Dibujar los invasores que siguen vivos.

                celdas[posicion].classList.add("invasor");
            }
        }
    }

    // FINALIZAR JUEGO

    function finalizarJuego() {

        juegoTerminado = true;

        clearInterval(intervaloInvasores);

        panelFinJuego.style.display = "block";
    }

    // DISPARAR

    function disparar(evento) {

        if (juegoTerminado) return;

        // Comprobar si se presionó la barra espaciadora.

        if (evento.keyCode === 32) {

            if (evento.preventDefault) {
                evento.preventDefault();
            }

            let posicionDisparo = posicionJugador;

            const intervaloDisparo = setInterval(
                moverDisparo,
                80
            );

            // MOVIMIENTO DEL DISPARO

            function moverDisparo() {

                if (juegoTerminado) {

                    clearInterval(intervaloDisparo);

                    celdas[posicionDisparo].classList.remove("tiro");

                    return;
                }

                // Eliminar la posición anterior del disparo.

                celdas[posicionDisparo].classList.remove("tiro");

                // Avanzar una fila hacia arriba.

                posicionDisparo -= tamanoCuadricula;

                // Comprobar si el disparo salió del tablero.

                if (posicionDisparo < 0) {

                    clearInterval(intervaloDisparo);

                    return;
                }

                // DETECTAR IMPACTO

                if (
                    celdas[posicionDisparo].classList.contains("invasor")
                ) {

                    celdas[posicionDisparo].classList.remove("tiro");

                    celdas[posicionDisparo].classList.remove("invasor");

                    // Mostrar explosión.

                    celdas[posicionDisparo].classList.add("KABUM");

                    const celdaImpacto = posicionDisparo;

                    setTimeout(() => {

                        celdas[celdaImpacto].classList.remove("KABUM");

                    }, 250);

                    clearInterval(intervaloDisparo);

                    // Identificar al invasor eliminado.

                    const indiceInvasor = invasores.indexOf(
                        posicionDisparo
                    );

                    if (
                        indiceInvasor !== -1 &&
                        !invasoresEliminados.includes(indiceInvasor)
                    ) {

                        invasoresEliminados.push(indiceInvasor);

                        // Sumar 10 puntos por cada invasor eliminado.

                        puntos += 10;

                        elementoPuntuacion.textContent = puntos;
                    }

                    // ========================================
                    // COMPROBAR SI TERMINÓ LA OLEADA
                    // ========================================

                    if (
                        invasoresEliminados.length === invasores.length
                    ) {

                        clearInterval(intervaloInvasores);

                        oleada++;

                        elementoOleada.textContent = oleada;

                        // Aumentar la velocidad de los invasores.

                        velocidad = Math.max(100, velocidad - 35);

                        // Iniciar la siguiente oleada.

                        setTimeout(() => {

                            if (!juegoTerminado) {

                                generarOleada();
                            }

                        }, 600);
                    }

                    return;
                }

                // Si no hubo impacto, continuar dibujando el disparo.

                celdas[posicionDisparo].classList.add("tiro");
            }
        }
    }

    // Botón para mover a la izquierda.

    document.getElementById("esquerda").addEventListener(
        "click",
        () => moverJugador({ keyCode: 37 })
    );

    // Botón para mover a la derecha.

    document.getElementById("direita").addEventListener(
        "click",
        () => moverJugador({ keyCode: 39 })
    );

    // Botón para disparar.

    document.getElementById("atirar").addEventListener(
        "click",
        () => disparar({ keyCode: 32 })
    );

    // Botón para reiniciar la partida.

    botonReiniciar.addEventListener("click", iniciarJuego);

    // EVENTOS DEL TECLADO

    document.addEventListener("keydown", moverJugador);

    document.addEventListener("keyup", disparar);

    // INICIAR PRIMERA PARTIDA

    iniciarJuego();

});
