"use strict";

/*
    ==========================================
    FRANÇAIS AVEC GUS
    Flashcards A1-B2
    ==========================================
*/

let tarjetas = [];
let tarjetasFiltradas = [];
let indice = 0;


/* ==========================================
   ELEMENTOS DEL DOM
   ========================================== */

const nivelFilter = document.getElementById("nivelFilter");
const modoFiltro = document.getElementById("modoFiltro");

const contador = document.getElementById("contador");
const barraProgreso = document.getElementById("barraProgreso");

const info = document.getElementById("info");
const frances = document.getElementById("frances");
const espanol = document.getElementById("espanol");

const mostrarBtn = document.getElementById("mostrarBtn");
const favoritaBtn = document.getElementById("favoritaBtn");

const anteriorBtn = document.getElementById("anteriorBtn");
const escucharBtn = document.getElementById("escucharBtn");
const siguienteBtn = document.getElementById("siguienteBtn");

const dificilBtn = document.getElementById("dificilBtn");
const facilBtn = document.getElementById("facilBtn");

const inicioBtn = document.getElementById("inicioBtn");
const todasBtn = document.getElementById("todasBtn");
const resumenBtn = document.getElementById("resumenBtn");
const reiniciarBtn = document.getElementById("reiniciarBtn");

const mensaje = document.getElementById("mensaje");


/* ==========================================
   INICIO
   ========================================== */

document.addEventListener("DOMContentLoaded", iniciar);


async function iniciar() {

    configurarEventos();

    try {

        const respuesta = await fetch(
            "francais_flashcards_A1_B2_v1.json"
        );

        if (!respuesta.ok) {

            throw new Error(
                `Error HTTP ${respuesta.status}`
            );
        }

        const data = await respuesta.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "El JSON no contiene una lista de tarjetas."
            );
        }

        tarjetas = data;

        actualizarEstadisticas();

        aplicarFiltros();

    } catch (error) {

        console.error(
            "Error cargando las tarjetas:",
            error
        );

        mostrarErrorCarga(error);
    }
}


/* ==========================================
   EVENTOS
   ========================================== */

function configurarEventos() {

    nivelFilter.addEventListener(
        "change",
        aplicarFiltros
    );

    modoFiltro.addEventListener(
        "change",
        aplicarFiltros
    );


    mostrarBtn.addEventListener(
        "click",
        mostrarRespuesta
    );


    favoritaBtn.addEventListener(
        "click",
        marcarFavorita
    );


    anteriorBtn.addEventListener(
        "click",
        anterior
    );


    escucharBtn.addEventListener(
        "click",
        escuchar
    );


    siguienteBtn.addEventListener(
        "click",
        siguiente
    );


    dificilBtn.addEventListener(
        "click",
        marcarDificil
    );


    facilBtn.addEventListener(
        "click",
        marcarFacil
    );


    inicioBtn.addEventListener(
        "click",
        irInicio
    );


    todasBtn.addEventListener(
        "click",
        mostrarTodas
    );


    resumenBtn.addEventListener(
        "click",
        mostrarResumen
    );


    reiniciarBtn.addEventListener(
        "click",
        reiniciarProgreso
    );
}


/* ==========================================
   LOCAL STORAGE
   ========================================== */

function obtenerProgreso() {

    try {

        return JSON.parse(
            localStorage.getItem("francesGus")
        ) || {};

    } catch (error) {

        console.error(
            "Error leyendo progreso:",
            error
        );

        return {};
    }
}


function obtenerFavoritas() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "francesFavoritas"
            )
        ) || [];

    } catch (error) {

        console.error(
            "Error leyendo favoritas:",
            error
        );

        return [];
    }
}


function guardarLocalStorage(
    clave,
    valor
) {

    localStorage.setItem(
        clave,
        JSON.stringify(valor)
    );
}


/* ==========================================
   FILTROS
   ========================================== */

function aplicarFiltros() {

    const nivel = nivelFilter.value;
    const modo = modoFiltro.value;

    const progreso = obtenerProgreso();
    const favoritas = obtenerFavoritas();


    tarjetasFiltradas = tarjetas.filter(card => {

        /* FILTRO POR NIVEL */

        if (
            nivel !== "Todos" &&
            card.nivel !== nivel
        ) {

            return false;
        }


        /* FILTRO POR ESTADO */

        switch (modo) {

            case "favoritas":

                return favoritas.includes(
                    card.id
                );


            case "aprendidas":

                return Boolean(
                    progreso[card.id] &&
                    progreso[card.id].aprendido
                );


            case "dificiles":

                return Boolean(
                    progreso[card.id] &&
                    !progreso[card.id].aprendido
                );


            case "pendientes":

                return !progreso[card.id];


            case "todas":
            default:

                return true;
        }
    });


    indice = 0;

    cargarTarjeta();
}


/* ==========================================
   CARGAR TARJETA
   ========================================== */

function cargarTarjeta() {

    if (
        tarjetasFiltradas.length === 0
    ) {

        frances.innerText =
            "No hay tarjetas";

        espanol.innerText = "";

        info.innerText =
            "Prueba otro nivel o filtro.";

        contador.innerText =
            "Tarjeta 0 de 0";

        barraProgreso.value = 0;

        mostrarBtn.disabled = true;
        favoritaBtn.disabled = true;
        anteriorBtn.disabled = true;
        escucharBtn.disabled = true;
        siguienteBtn.disabled = true;
        dificilBtn.disabled = true;
        facilBtn.disabled = true;

        actualizarBotonFavorita();

        return;
    }


    mostrarBtn.disabled = false;
    favoritaBtn.disabled = false;
    anteriorBtn.disabled = false;
    escucharBtn.disabled = false;
    siguienteBtn.disabled = false;
    dificilBtn.disabled = false;
    facilBtn.disabled = false;


    const card =
        tarjetasFiltradas[indice];


    /* CONTADOR */

    contador.innerText =
        `Tarjeta ${indice + 1} de ${tarjetasFiltradas.length}`;


    /* BARRA */

    const porcentaje =
        ((indice + 1) /
        tarjetasFiltradas.length) * 100;

    barraProgreso.value =
        porcentaje;


    /* INFORMACIÓN */

    const tipo =
        card.tipo === "frase"
            ? "💬 Frase"
            : "🔤 Vocabulario";


    info.innerText =
        `📘 ${card.nivel}  |  🏷 ${card.tema}  |  ${tipo}`;


    /* FRANCÉS */

    frances.innerText =
        card.frances;


    /* RESPUESTA OCULTA */

    espanol.innerText = "";


    /* FAVORITA */

    actualizarBotonFavorita();


    /* CLASE PARA EL TIPO */

    frances.classList.remove(
        "tipo-frase",
        "tipo-vocabulario"
    );


    if (card.tipo === "frase") {

        frances.classList.add(
            "tipo-frase"
        );

    } else {

        frances.classList.add(
            "tipo-vocabulario"
        );
    }


    /* VOLVER ARRIBA */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ==========================================
   MOSTRAR RESPUESTA
   ========================================== */

function mostrarRespuesta() {

    if (
        tarjetasFiltradas.length === 0
    ) {

        return;
    }


    const card =
        tarjetasFiltradas[indice];


    espanol.innerText =
        card.espanol;
}


/* ==========================================
   SIGUIENTE
   ========================================== */

function siguiente() {

    if (
        tarjetasFiltradas.length === 0
    ) {

        return;
    }


    indice++;


    if (
        indice >=
        tarjetasFiltradas.length
    ) {

        indice = 0;
    }


    cargarTarjeta();
}


/* ==========================================
   ANTERIOR
   ========================================== */

function anterior() {

    if (
        tarjetasFiltradas.length === 0
    ) {

        return;
    }


    indice--;


    if (indice < 0) {

        indice =
            tarjetasFiltradas.length - 1;
    }


    cargarTarjeta();
}


/* ==========================================
   AUDIO
   ========================================== */

function escuchar() {

    if (
        tarjetasFiltradas.length === 0
    ) {

        return;
    }


    if (
        !("speechSynthesis" in window)
    ) {

        mostrarMensaje(
            "Tu navegador no permite la pronunciación automática."
        );

        return;
    }


    const texto =
        tarjetasFiltradas[indice].frances;


    window.speechSynthesis.cancel();


    const voz =
        new SpeechSynthesisUtterance(
            texto
        );


    voz.lang = "fr-FR";
    voz.rate = 0.9;
    voz.pitch = 1;
    voz.volume = 1;


    window.speechSynthesis.speak(
        voz
    );
}


/* ==========================================
   MARCAR FÁCIL
   ========================================== */

function marcarFacil() {

    guardarProgreso(true);
}


/* ==========================================
   MARCAR DIFÍCIL
   ========================================== */

function marcarDificil() {

    guardarProgreso(false);
}


/* ==========================================
   GUARDAR PROGRESO
   ========================================== */

function guardarProgreso(
    aprendido
) {

    if (
        tarjetasFiltradas.length === 0
    ) {

        return;
    }


    const progreso =
        obtenerProgreso();


    const id =
        tarjetasFiltradas[indice].id;


    progreso[id] = {

        aprendido: aprendido,

        fecha:
            new Date().toISOString()
    };


    guardarLocalStorage(
        "francesGus",
        progreso
    );


    actualizarEstadisticas();


    /*
        Si estamos dentro de un filtro,
        recalculamos la lista.
    */

    const tarjetaActualId = id;


    aplicarFiltros();


    /*
        Si la tarjeta sigue dentro
        del filtro, intentamos mantener
        una posición razonable.
    */

    if (
        tarjetasFiltradas.length > 0
    ) {

        const nuevaPosicion =
            tarjetasFiltradas.findIndex(
                card =>
                    card.id === tarjetaActualId
            );


        if (
            nuevaPosicion !== -1
        ) {

            indice =
                (nuevaPosicion + 1) %
                tarjetasFiltradas.length;

            cargarTarjeta();

        } else {

            /*
                Si la tarjeta desapareció
                del filtro, mostramos la
                primera disponible.
            */

            indice = 0;

            cargarTarjeta();
        }
    }


    mostrarMensaje(
        aprendido
            ? "✅ Marcada como aprendida"
            : "❌ Marcada como difícil"
    );
}


/* ==========================================
   FAVORITAS
   ========================================== */

function marcarFavorita() {

    if (
        tarjetasFiltradas.length === 0
    ) {

        return;
    }


    const favoritas =
        obtenerFavoritas();


    const id =
        tarjetasFiltradas[indice].id;


    const posicion =
        favoritas.indexOf(id);


    if (posicion === -1) {

        favoritas.push(id);

        mostrarMensaje(
            "⭐ Añadida a favoritas"
        );

    } else {

        favoritas.splice(
            posicion,
            1
        );

        mostrarMensaje(
            "☆ Eliminada de favoritas"
        );
    }


    guardarLocalStorage(
        "francesFavoritas",
        favoritas
    );


    actualizarEstadisticas();


    actualizarBotonFavorita();


    /*
        Si estamos viendo solo favoritas
        y quitamos la favorita actual,
        actualizamos la lista.
    */

    if (
        modoFiltro.value === "favoritas"
    ) {

        aplicarFiltros();
    }
}


/* ==========================================
   ACTUALIZAR BOTÓN FAVORITA
   ========================================== */

function actualizarBotonFavorita() {

    if (
        tarjetasFiltradas.length === 0
    ) {

        favoritaBtn.innerText =
            "☆ Favorita";

        return;
    }


    const favoritas =
        obtenerFavoritas();


    const id =
        tarjetasFiltradas[indice].id;


    const esFavorita =
        favoritas.includes(id);


    if (esFavorita) {

        favoritaBtn.innerText =
            "⭐ Quitar favorita";

        favoritaBtn.classList.add(
            "is-favorite"
        );

    } else {

        favoritaBtn.innerText =
            "☆ Favorita";

        favoritaBtn.classList.remove(
            "is-favorite"
        );
    }
}


/* ==========================================
   ESTADÍSTICAS
   ========================================== */

function actualizarEstadisticas() {

    const progreso =
        obtenerProgreso();

    const favoritas =
        obtenerFavoritas();


    let aprendidas = 0;
    let dificiles = 0;


    Object.values(progreso)
        .forEach(item => {

            if (item.aprendido) {

                aprendidas++;

            } else {

                dificiles++;
            }
        });


    document.getElementById(
        "aprendidas"
    ).innerText =
        aprendidas;


    document.getElementById(
        "dificiles"
    ).innerText =
        dificiles;


    document.getElementById(
        "favoritas"
    ).innerText =
        favoritas.length;


    document.getElementById(
        "total"
    ).innerText =
        tarjetas.length;
}


/* ==========================================
   INICIO
   ========================================== */

function irInicio() {

    nivelFilter.value = "Todos";
    modoFiltro.value = "todas";

    indice = 0;

    aplicarFiltros();
}


/* ==========================================
   MOSTRAR TODAS
   ========================================== */

function mostrarTodas() {

    nivelFilter.value = "Todos";
    modoFiltro.value = "todas";

    indice = 0;

    aplicarFiltros();

    mostrarMensaje(
        "📚 Mostrando todas las tarjetas"
    );
}


/* ==========================================
   RESUMEN
   ========================================== */

function mostrarResumen() {

    const progreso =
        obtenerProgreso();

    const favoritas =
        obtenerFavoritas();


    let aprendidas = 0;
    let dificiles = 0;


    Object.values(progreso)
        .forEach(item => {

            if (item.aprendido) {

                aprendidas++;

            } else {

                dificiles++;
            }
        });


    const porcentaje =
        tarjetas.length > 0
            ? Math.round(
                (aprendidas /
                tarjetas.length) * 100
            )
            : 0;


    alert(
`📊 RESUMEN

✅ Aprendidas: ${aprendidas}

❌ Difíciles: ${dificiles}

⭐ Favoritas: ${favoritas.length}

📚 Total: ${tarjetas.length}

🎯 Progreso: ${porcentaje}%`
    );
}


/* ==========================================
   REINICIAR PROGRESO
   ========================================== */

function reiniciarProgreso() {

    const confirmar =
        confirm(
            "¿Seguro que quieres borrar todo el progreso y las favoritas?"
        );


    if (!confirmar) {

        return;
    }


    localStorage.removeItem(
        "francesGus"
    );

    localStorage.removeItem(
        "francesFavoritas"
    );


    actualizarEstadisticas();


    nivelFilter.value = "Todos";
    modoFiltro.value = "todas";

    indice = 0;

    aplicarFiltros();


    mostrarMensaje(
        "♻️ Progreso reiniciado"
    );
}


/* ==========================================
   MENSAJES
   ========================================== */

let timeoutMensaje;


function mostrarMensaje(texto) {

    mensaje.innerText =
        texto;


    mensaje.classList.add(
        "visible"
    );


    clearTimeout(
        timeoutMensaje
    );


    timeoutMensaje =
        setTimeout(() => {

            mensaje.classList.remove(
                "visible"
            );

        }, 2200);
}


/* ==========================================
   ERROR DE CARGA
   ========================================== */

function mostrarErrorCarga(error) {

    frances.innerText =
        "⚠️ No se pudieron cargar las tarjetas.";

    espanol.innerText = "";

    info.innerText =
        "Comprueba que el archivo JSON está en la misma carpeta.";

    contador.innerText =
        "Error al cargar";

    barraProgreso.value = 0;


    mensaje.innerText =
        "Si abriste index.html directamente, usa un servidor local como Live Server.";

    mensaje.classList.add(
        "visible"
    );


    console.error(error);
}


/* ==========================================
   SERVICE WORKER
   ========================================== */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(() => {

                    console.log(
                        "Service Worker registrado"
                    );

                })
                .catch(error => {

                    /*
                        El Service Worker no es
                        necesario para que funcionen
                        las flashcards.
                    */

                    console.warn(
                        "Service Worker no disponible:",
                        error
                    );
                });
        }
    );
}
