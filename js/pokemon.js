
const catalogoCriaturas = [
    {
        id: "pyrofox",
        nombre: "Pyrofox",
        tipo: "Fuego",

        imgFrente: "assets/img/imgP/pyrofox_frente.png",
        imgEspalda: "assets/img/imgP/pyrofox_espalda.png",

        voltearFrente: true,
        voltearEspalda: false,

        hpMax: 120,
        velocidad: 70,

        ataques: [
            { nombre: "Placaje", dano: 20 },
            { nombre: "Ascuas", dano: 32 },
            { nombre: "Arañazo Veloz", dano: 26 },
            { nombre: "Llamarada", dano: 45 }
        ]
    },

    {
        id: "aquatort",
        nombre: "Aquatort",
        tipo: "Agua",

        imgFrente: "assets/img/imgP/Aquatort_Frente.png",
        imgEspalda: "assets/img/imgP/Aquatort_Espalda.png",

        voltearFrente: false,
        voltearEspalda: false,

        hpMax: 140,
        velocidad: 50,

        ataques: [
            { nombre: "Mordisco", dano: 22 },
            { nombre: "Pistola Agua", dano: 30 },
            { nombre: "Cabezazo", dano: 28 },
            { nombre: "Hidrobomba", dano: 44 }
        ]
    },

    {
        id: "floravine",
        nombre: "Floravine",
        tipo: "Planta",

        imgFrente: "assets/img/imgP/Floravine_frente.png",
        imgEspalda: "assets/img/imgP/Floravine_espalda.png",

        voltearFrente: false,
        voltearEspalda: true,

        hpMax: 130,
        velocidad: 60,

        ataques: [
            { nombre: "Látigo Cepa", dano: 24 },
            { nombre: "Hoja Afilada", dano: 34 },
            { nombre: "Derribo", dano: 28 },
            { nombre: "Rayo Solar", dano: 46 }
        ]
    }
];

let jugador = {};
let rival = {};

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// NARRACIÓN DEL COMBATE

async function narrarGBA(mensaje, pausaFinal = 1000) {

    const cajaTexto = document.getElementById("caja-texto");

    cajaTexto.textContent = "";

    for (let i = 0; i < mensaje.length; i++) {

        cajaTexto.textContent += mensaje[i];

        await esperar(22);
    }

    if (pausaFinal > 0) {
        await esperar(pausaFinal);
    }
}

// MENÚ DE SELECCIÓN

function mostrarMenuSeleccion() {

    const contenedor = document.getElementById("lista-criaturas");

    contenedor.innerHTML = "";

    catalogoCriaturas.forEach((criatura) => {

        const tarjeta = document.createElement("div");

        tarjeta.className = "tarjeta-seleccion";

        tarjeta.innerHTML = `
            <img
                class="avatar-seleccion"
                src="${criatura.imgFrente}"
                alt="${criatura.nombre}"
            >

            <strong>${criatura.nombre}</strong>

            <div class="stats-mini">
                Tipo: ${criatura.tipo}<br>
                HP: ${criatura.hpMax} | Vel: ${criatura.velocidad}
            </div>
        `;

        tarjeta.onclick = () => iniciarCombate(criatura);

        contenedor.appendChild(tarjeta);
    });
}

// CLONAR CRIATURA

function clonarCriatura(base) {

    return {
        ...base,
        hpActual: base.hpMax,
        ataques: base.ataques.map(a => ({ ...a }))
    };
}

// INICIAR COMBATE

async function iniciarCombate(criaturaElegida) {

    document.getElementById("pantalla-seleccion").classList.add("oculto");

    document.getElementById("pantalla-combate").classList.remove("oculto");

    document.getElementById("btn-reiniciar").style.display = "none";

    jugador = clonarCriatura(criaturaElegida);

    // Seleccionar un rival aleatorio.

    const opcionesRival = catalogoCriaturas.filter(
        c => c.id !== criaturaElegida.id
    );

    const rivalAleatorio = opcionesRival[
        Math.floor(Math.random() * opcionesRival.length)
    ];

    rival = clonarCriatura(rivalAleatorio);

    // Configurar imagen del jugador.

    const spriteJ = document.getElementById("sprite-jugador");

    spriteJ.src = jugador.imgEspalda;
    spriteJ.alt = jugador.nombre;

    spriteJ.classList.toggle(
        "voltear",
        jugador.voltearEspalda
    );

    // Configurar imagen del rival.

    const spriteR = document.getElementById("sprite-rival");

    spriteR.src = rival.imgFrente;
    spriteR.alt = rival.nombre;

    spriteR.classList.toggle(
        "voltear",
        rival.voltearFrente
    );

    actualizarInterfaz();

    // Crear botones de ataques.

    const panel = document.getElementById("panel-ataques");

    panel.innerHTML = "";

    jugador.ataques.forEach((ataque, index) => {

        const boton = document.createElement("button");

        boton.textContent = `${ataque.nombre} (${ataque.dano})`;

        boton.onclick = () => jugarTurno(index);

        panel.appendChild(boton);
    });

    bloquearBotones(true);

    await narrarGBA(`¡El rival envía a ${rival.nombre}!`, 900);

    await narrarGBA(`¡Adelante, ${jugador.nombre}!`, 900);

    await narrarGBA(`¿Qué debería hacer ${jugador.nombre}?`, 0);

    bloquearBotones(false);
}

// VOLVER A SELECCIÓN

function volverASeleccion() {

    document.getElementById("pantalla-combate").classList.add("oculto");

    document.getElementById("pantalla-seleccion").classList.remove("oculto");
}

// ACTUALIZAR INTERFAZ

function actualizarInterfaz() {

    // Información del jugador.

    document.getElementById("nombre-jugador").textContent = jugador.nombre;

    document.getElementById("tipo-jugador").textContent = jugador.tipo;

    document.getElementById("hp-jugador").textContent =
        `${jugador.hpActual} / ${jugador.hpMax}`;

    const porcJugador = (jugador.hpActual / jugador.hpMax) * 100;

    const barraJ = document.getElementById("barra-jugador");

    barraJ.style.width = `${porcJugador}%`;

    cambiarColorBarra(barraJ, porcJugador);

    // Información del rival.

    document.getElementById("nombre-rival").textContent = rival.nombre;

    document.getElementById("tipo-rival").textContent = rival.tipo;

    document.getElementById("hp-rival").textContent =
        `${rival.hpActual} / ${rival.hpMax}`;

    const porcRival = (rival.hpActual / rival.hpMax) * 100;

    const barraR = document.getElementById("barra-rival");

    barraR.style.width = `${porcRival}%`;

    cambiarColorBarra(barraR, porcRival);
}

// CAMBIAR COLOR DE BARRA DE VIDA

function cambiarColorBarra(elementoBarra, porcentaje) {

    if (porcentaje > 50) {

        elementoBarra.style.backgroundColor = "#a6e3a1";

    } else if (porcentaje > 20) {

        elementoBarra.style.backgroundColor = "#f9e2af";

    } else {

        elementoBarra.style.backgroundColor = "#f38ba8";
    }
}

// BLOQUEAR BOTONES

function bloquearBotones(estado) {

    const botones = document.querySelectorAll("#panel-ataques button");

    botones.forEach(btn => btn.disabled = estado);
}

// EJECUTAR TURNO

async function jugarTurno(indiceAtaqueJugador) {

    bloquearBotones(true);

    const ataqueJugador = jugador.ataques[indiceAtaqueJugador];

    const indiceRandom = Math.floor(
        Math.random() * rival.ataques.length
    );

    const ataqueRival = rival.ataques[indiceRandom];

    let primero, segundo;

    // Determinar quién ataca primero según su velocidad.

    if (jugador.velocidad >= rival.velocidad) {

        primero = {
            atacante: jugador,
            defensor: rival,
            ataque: ataqueJugador,
            esJugador: true
        };

        segundo = {
            atacante: rival,
            defensor: jugador,
            ataque: ataqueRival,
            esJugador: false
        };

    } else {

        primero = {
            atacante: rival,
            defensor: jugador,
            ataque: ataqueRival,
            esJugador: false
        };

        segundo = {
            atacante: jugador,
            defensor: rival,
            ataque: ataqueJugador,
            esJugador: true
        };
    }

    await ejecutarGolpe(primero);

    if (primero.defensor.hpActual > 0) {

        await ejecutarGolpe(segundo);
    }

    if (jugador.hpActual <= 0 || rival.hpActual <= 0) {

        await finalizarCombate();

    } else {

        await narrarGBA(`¿Qué debería hacer ${jugador.nombre}?`, 0);

        bloquearBotones(false);
    }
}

async function ejecutarGolpe(turno) {

    const spriteAtacante = document.getElementById(
        turno.esJugador ? "sprite-jugador" : "sprite-rival"
    );

    const spriteDefensor = document.getElementById(
        turno.esJugador ? "sprite-rival" : "sprite-jugador"
    );

    const prefijo = turno.esJugador ? "Tu" : "El";

    await narrarGBA(
        `¡${prefijo} ${turno.atacante.nombre} usó ${turno.ataque.nombre}!`,
        500
    );

    // Animación de ataque.

    spriteAtacante.classList.add(
        turno.esJugador ? "anim-atacar" : "anim-atacar-rival"
    );

    await esperar(250);

    spriteAtacante.classList.remove(
        "anim-atacar",
        "anim-atacar-rival"
    );

    // Animación de daño.

    spriteDefensor.classList.add("anim-dano");

    await esperar(250);

    spriteDefensor.classList.remove("anim-dano");

    // Restar puntos de salud.

    turno.defensor.hpActual -= turno.ataque.dano;

    if (turno.defensor.hpActual < 0) {

        turno.defensor.hpActual = 0;
    }

    actualizarInterfaz();

    await narrarGBA(
        `¡${turno.defensor.nombre} perdió ${turno.ataque.dano} PS!`,
        900
    );
}

async function finalizarCombate() {

    if (jugador.hpActual <= 0) {

        await narrarGBA(
            `¡Tu ${jugador.nombre} se ha debilitado!`,
            1000
        );

        await narrarGBA("¡Has perdido el combate!", 0);

    } else {

        await narrarGBA(
            `¡El ${rival.nombre} rival se ha debilitado!`,
            1000
        );

        await narrarGBA("¡Ganaste la batalla!", 0);
    }

    document.getElementById("btn-reiniciar").style.display = "block";
}

mostrarMenuSeleccion();
