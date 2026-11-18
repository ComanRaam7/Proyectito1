const TAMANO = 3;
let celdas = [];
let turno = 'X';
let movimientos = 0;

// Crear el tablero de juego
function inicializarJuego() {
    const tablero = document.createElement('table');
    tablero.setAttribute('border', 1);
    tablero.setAttribute('cellspacing', 0);

    for (let fila = 0; fila < TAMANO; fila++) {
        const nuevaFila = document.createElement('tr');
        tablero.appendChild(nuevaFila);

        for (let columna = 0; columna < TAMANO; columna++) {
            const celda = document.createElement('td');

            celda.style.height = '120px';
            celda.style.width = '120px';
            celda.style.textAlign = 'center';
            celda.style.verticalAlign = 'middle';

            celda.classList.add('col' + columna, 'row' + fila);

            // Identificar las diagonales
            if (fila === columna) {
                celda.classList.add('diagonal0');
            }

            if (columna === TAMANO - fila - 1) {
                celda.classList.add('diagonal1');
            }

            // Guardar la posición de cada celda
            celda.dataset.fila = fila;
            celda.dataset.columna = columna;

            celda.addEventListener('click', realizarJugada);

            nuevaFila.appendChild(celda);
            celdas.push(celda);
        }
    }

    document.getElementById('tictactoe').appendChild(tablero);

    iniciarNuevaPartida();
}

// Reiniciar el juego
function iniciarNuevaPartida() {
    movimientos = 0;
    turno = 'X';

    celdas.forEach(celda => {
        celda.textContent = '';
        celda.classList.remove('x', 'o', 'win');
    });

    document.getElementById('turn').textContent =
        'Turno del jugador ' + turno;
}

// Comprobar si existe un ganador
function verificarGanador(celda) {
    const fila = Number(celda.dataset.fila);
    const columna = Number(celda.dataset.columna);
    const claseJugador = turno.toLowerCase();

    // Comprobar las filas y columnas correspondientes
    const lineas = [
        '#tictactoe .row' + fila,
        '#tictactoe .col' + columna
    ];

    // Comprobar las diagonales cuando corresponda
    if (fila === columna) {
        lineas.push('#tictactoe .diagonal0');
    }

    if (columna === TAMANO - fila - 1) {
        lineas.push('#tictactoe .diagonal1');
    }

    // Verificar que todas las celdas de una línea
    // pertenezcan al jugador actual
    for (const selector of lineas) {
        const linea = Array.from(
            document.querySelectorAll(selector)
        );

        if (
            linea.length === TAMANO &&
            linea.every(celda =>
                celda.classList.contains(claseJugador)
            )
        ) {
            linea.forEach(celda => {
                celda.classList.add('win');
            });

            return true;
        }
    }

    return false;
}

// Realizar una jugada
function realizarJugada(evento) {
    const celda = evento.currentTarget;

    // Evitar seleccionar una casilla ocupada
    if (
        celda.classList.contains('x') ||
        celda.classList.contains('o')
    ) {
        return;
    }

    // Colocar la ficha del jugador actual
    celda.textContent = turno;
    celda.classList.add(turno.toLowerCase());

    movimientos++;

    // Comprobar si el jugador ganó
    if (verificarGanador(celda)) {
        alert('¡Ganador: Jugador ' + turno + '!');
        iniciarNuevaPartida();
    }

    // Comprobar si existe un empate
    else if (movimientos === TAMANO * TAMANO) {
        alert('¡Empate!');
        iniciarNuevaPartida();
    }

    // Cambiar el turno del jugador
    else {
        turno = turno === 'X' ? 'O' : 'X';

        document.getElementById('turn').textContent =
            'Turno del jugador ' + turno;
    }
}

// Cambiar entre el tema claro y oscuro
document.getElementById('theme-switch').addEventListener(
    'change',
    function() {
        document.body.classList.toggle('dark', this.checked);
    }
);

// Iniciar el juego
inicializarJuego();
