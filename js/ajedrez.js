
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

// Estado principal de la partida.
const partida = new Chess();
const tablero = document.getElementById("tablero");
const mensajeTurno = document.getElementById("mensaje-turno");
const estadoPartida = document.getElementById("estado-partida");
const listaCapturas = document.getElementById("lista-capturas");
const botonReiniciar = document.getElementById("reiniciar");

const ARCHIVO_IMAGENES = "assets/img/Ajedrez/";
const COLUMNAS = "abcdefgh";

const NOMBRES_PIEZAS = {
    p: "Peón",
    n: "Caballo",
    b: "Alfil",
    r: "Torre",
    q: "Reina",
    k: "Rey"
};

const ARCHIVOS_PIEZAS = {
    p: "peon",
    n: "caballo",
    b: "alfil",
    r: "torre",
    q: "reina",
    k: "rey"
};

let casillaSeleccionada = null;
let movimientosLegales = [];
let ultimaJugada = null;
let promocionPendiente = null;

// Obtener la ruta de la imagen de cada pieza.
function obtenerRutaPieza(tipo, color) {
    const nombreArchivo = ARCHIVOS_PIEZAS[tipo];
    const sufijoColor = color === "w" ? "B" : "N";

    return `${ARCHIVO_IMAGENES}${nombreArchivo}${sufijoColor}.png`;
}

// Crear la imagen de una pieza.
function crearImagenPieza(tipo, color, textoAlternativo = "") {
    const imagen = document.createElement("img");

    imagen.src = obtenerRutaPieza(tipo, color);

    imagen.alt = textoAlternativo ||
        `${NOMBRES_PIEZAS[tipo]} ${color === "w" ? "blanca" : "negra"}`;

    const clasePieza = {
        p: "peon",
        n: "caballo",
        b: "alfil",
        r: "torre",
        q: "reina",
        k: "rey"
    }[tipo];

    const sufijoColor = color === "w" ? "B" : "N";

    imagen.classList.add(
        "ficha",
        clasePieza,
        color === "w" ? "fBlanca" : "fNegra",
        `${clasePieza}${sufijoColor}`
    );

    imagen.draggable = false;

    return imagen;
}

// Dibujar el tablero de ajedrez.
function dibujarTablero() {
    const posiciones = partida.board();

    tablero.replaceChildren();

    posiciones.forEach((fila, indiceFila) => {
        fila.forEach((pieza, indiceColumna) => {
            const nombreColumna = COLUMNAS[indiceColumna];
            const numeroFila = 8 - indiceFila;

            const nombreCasilla = `${nombreColumna}${numeroFila}`;

            const casilla = document.createElement("button");

            casilla.type = "button";
            casilla.className = "casilla";

            casilla.classList.add(
                (indiceFila + indiceColumna) % 2 === 0
                    ? "negra"
                    : "blanca"
            );

            casilla.dataset.casilla = nombreCasilla;
            casilla.id = `${indiceColumna + 1}${numeroFila}`;

            casilla.setAttribute("role", "gridcell");
            casilla.setAttribute(
                "aria-label",
                describirCasilla(nombreCasilla, pieza)
            );

            if (pieza) {
                casilla.appendChild(
                    crearImagenPieza(pieza.type, pieza.color)
                );

                casilla.draggable =
                    pieza.color === partida.turn() &&
                    !partida.isGameOver();

                casilla.addEventListener("dragstart", iniciarArrastre);
                casilla.addEventListener("dragend", finalizarArrastre);
            } else {
                casilla.draggable = false;
            }

            casilla.addEventListener("click", () => {
                manejarClicCasilla(nombreCasilla);
            });

            casilla.addEventListener("dragover", permitirSoltar);

            casilla.addEventListener("drop", (evento) => {
                soltarPieza(evento, nombreCasilla);
            });

            if (nombreCasilla === casillaSeleccionada) {
                casilla.classList.add("seleccionada");
            }

            if (
                ultimaJugada &&
                (
                    nombreCasilla === ultimaJugada.from ||
                    nombreCasilla === ultimaJugada.to
                )
            ) {
                casilla.classList.add("ultima-jugada");
            }

            const movimientoDisponible = movimientosLegales.find(
                movimiento => movimiento.to === nombreCasilla
            );

            if (movimientoDisponible) {
                const esCaptura =
                    Boolean(movimientoDisponible.captured) ||
                    movimientoDisponible.flags.includes("e");

                casilla.classList.add(
                    esCaptura
                        ? "captura-posible"
                        : "movimiento-posible"
                );
            }

            tablero.appendChild(casilla);
        });
    });
}

// Describir las casillas del tablero.
function describirCasilla(nombreCasilla, pieza) {
    if (!pieza) {
        return `Casilla ${nombreCasilla}, vacía`;
    }

    const color = pieza.color === "w" ? "blanca" : "negra";

    return `Casilla ${nombreCasilla}, ${NOMBRES_PIEZAS[pieza.type]} ${color}`;
}

// Seleccionar una pieza y calcular sus movimientos legales.
function seleccionarCasilla(nombreCasilla, redibujar = true) {
    const pieza = partida.get(nombreCasilla);

    if (
        !pieza ||
        pieza.color !== partida.turn() ||
        partida.isGameOver()
    ) {
        return false;
    }

    casillaSeleccionada = nombreCasilla;

    movimientosLegales = partida.moves({
        square: nombreCasilla,
        verbose: true
    });

    if (redibujar) {
        dibujarTablero();
    } else {
        actualizarResaltados();
    }

    return true;
}

// Actualizar los indicadores de movimientos posibles.
function actualizarResaltados() {
    tablero.querySelectorAll(".casilla").forEach(casilla => {
        const destino = casilla.dataset.casilla;

        casilla.classList.toggle(
            "seleccionada",
            destino === casillaSeleccionada
        );

        casilla.classList.remove(
            "movimiento-posible",
            "captura-posible"
        );

        const movimiento = movimientosLegales.find(
            opcion => opcion.to === destino
        );

        if (movimiento) {
            const esCaptura =
                Boolean(movimiento.captured) ||
                movimiento.flags.includes("e");

            casilla.classList.add(
                esCaptura
                    ? "captura-posible"
                    : "movimiento-posible"
            );
        }
    });
}

// Controlar los movimientos mediante clics.
function manejarClicCasilla(nombreCasilla) {
    if (partida.isGameOver() || promocionPendiente) {
        return;
    }

    if (casillaSeleccionada) {
        if (nombreCasilla === casillaSeleccionada) {
            limpiarSeleccion();
            return;
        }

        const movimiento = movimientosLegales.find(
            opcion => opcion.to === nombreCasilla
        );

        if (movimiento) {
            intentarMovimiento(
                casillaSeleccionada,
                nombreCasilla
            );

            return;
        }
    }

    const pieza = partida.get(nombreCasilla);

    if (pieza && pieza.color === partida.turn()) {
        seleccionarCasilla(nombreCasilla);
    } else {
        limpiarSeleccion();
    }
}

// Comprobar si un movimiento requiere coronación.
function intentarMovimiento(origen, destino, piezaPromocion = null) {
    const opciones = partida.moves({
        square: origen,
        verbose: true
    }).filter(movimiento => movimiento.to === destino);

    if (opciones.length === 0) {
        estadoPartida.textContent =
            "Movimiento no válido. Selecciona otra casilla.";

        return false;
    }

    const requierePromocion = opciones.some(
        movimiento => Boolean(movimiento.promotion)
    );

    if (requierePromocion && !piezaPromocion) {
        mostrarSelectorCoronacion(origen, destino);
        return false;
    }

    return ejecutarMovimiento(
        origen,
        destino,
        piezaPromocion || undefined
    );
}

// Ejecutar un movimiento validado.
function ejecutarMovimiento(origen, destino, promocion) {
    let movimiento;

    try {
        const datosMovimiento = {
            from: origen,
            to: destino
        };

        if (promocion) {
            datosMovimiento.promotion = promocion;
        }

        movimiento = partida.move(datosMovimiento);

    } catch (error) {
        estadoPartida.textContent =
            "No se pudo realizar ese movimiento.";

        limpiarSeleccion();

        return false;
    }

    if (!movimiento) {
        estadoPartida.textContent = "Movimiento no válido.";

        limpiarSeleccion();

        return false;
    }

    if (movimiento.captured) {
        agregarPiezaCapturada(
            movimiento.captured,
            movimiento.color === "w" ? "b" : "w"
        );
    }

    ultimaJugada = {
        from: movimiento.from,
        to: movimiento.to
    };

    casillaSeleccionada = null;
    movimientosLegales = [];
    promocionPendiente = null;

    ocultarSelectorCoronacion();
    dibujarTablero();
    actualizarEstadoPartida();

    return true;
}

// Agregar piezas capturadas al registro.
function agregarPiezaCapturada(tipo, color) {
    const imagen = crearImagenPieza(tipo, color);

    imagen.title = `${NOMBRES_PIEZAS[tipo]} capturada`;

    listaCapturas.appendChild(imagen);
}

// Mostrar el selector de coronación.
function mostrarSelectorCoronacion(origen, destino) {
    const peon = partida.get(origen);

    if (!peon) {
        return;
    }

    promocionPendiente = {
        origen,
        destino
    };

    const selector = document.getElementById(
        peon.color === "w" ? "coronadaB" : "coronadaN"
    );

    selector.classList.remove("oculto");
}

// Ocultar los selectores de coronación.
function ocultarSelectorCoronacion() {
    document.getElementById("coronadaB").classList.add("oculto");
    document.getElementById("coronadaN").classList.add("oculto");
}

// Configurar las opciones de coronación.
function configurarSelectoresCoronacion() {
    ["coronadaB", "coronadaN"].forEach(identificador => {
        const selector = document.getElementById(identificador);

        selector.querySelectorAll("[data-promocion]").forEach(boton => {
            boton.addEventListener("click", () => {
                if (!promocionPendiente) {
                    return;
                }

                const { origen, destino } = promocionPendiente;
                const pieza = boton.dataset.promocion;

                ejecutarMovimiento(origen, destino, pieza);
            });
        });
    });
}

// Iniciar el arrastre de una pieza.
function iniciarArrastre(evento) {
    const casilla = evento.currentTarget.dataset.casilla;

    const seleccionValida = seleccionarCasilla(casilla, false);

    if (!seleccionValida) {
        evento.preventDefault();
        return;
    }

    evento.dataTransfer.effectAllowed = "move";

    evento.dataTransfer.setData("text/plain", casilla);
}

// Permitir soltar piezas sobre las casillas.
function permitirSoltar(evento) {
    if (casillaSeleccionada && !promocionPendiente) {
        evento.preventDefault();

        evento.dataTransfer.dropEffect = "move";
    }
}

// Controlar el movimiento mediante arrastrar y soltar.
function soltarPieza(evento, destino) {
    evento.preventDefault();

    const origen =
        evento.dataTransfer.getData("text/plain") ||
        casillaSeleccionada;

    if (origen) {
        intentarMovimiento(origen, destino);
    }
}

// Finalizar el arrastre.
function finalizarArrastre() {
    if (casillaSeleccionada && !promocionPendiente) {
        const pieza = partida.get(casillaSeleccionada);

        if (pieza) {
            dibujarTablero();
        }
    }
}

// Limpiar la selección.
function limpiarSeleccion() {
    casillaSeleccionada = null;
    movimientosLegales = [];

    dibujarTablero();
}

// Actualizar el turno y el estado de la partida.
function actualizarEstadoPartida() {
    const colorTurno =
        partida.turn() === "w" ? "blancas" : "negras";

    mensajeTurno.textContent =
        `Turno de las piezas ${colorTurno}`;

    if (partida.isCheckmate()) {
        const ganador =
            partida.turn() === "w" ? "negras" : "blancas";

        estadoPartida.textContent =
            `¡Jaque mate! Ganaron las piezas ${ganador}.`;

    } else if (partida.isStalemate()) {
        estadoPartida.textContent = "Empate por ahogado.";

    } else if (partida.isThreefoldRepetition()) {
        estadoPartida.textContent =
            "Empate por repetición de posición.";

    } else if (partida.isInsufficientMaterial()) {
        estadoPartida.textContent =
            "Empate por material insuficiente.";

    } else if (partida.isDraw()) {
        estadoPartida.textContent =
            "La partida terminó en empate.";

    } else if (partida.isCheck()) {
        estadoPartida.textContent =
            "¡Jaque! El rey está amenazado.";

    } else {
        estadoPartida.textContent =
            "La partida continúa.";
    }
}

// Reiniciar la partida.
function reiniciarPartida() {
    partida.reset();

    casillaSeleccionada = null;
    movimientosLegales = [];
    ultimaJugada = null;
    promocionPendiente = null;

    listaCapturas.replaceChildren();

    ocultarSelectorCoronacion();
    dibujarTablero();
    actualizarEstadoPartida();
}

// Iniciar el juego y configurar los controles.
function iniciarJuego() {
    botonReiniciar.addEventListener("click", reiniciarPartida);

    configurarSelectoresCoronacion();

    reiniciarPartida();
}

// Ejecutar el juego.
iniciarJuego();