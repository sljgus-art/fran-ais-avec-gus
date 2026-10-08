"use strict";

/* =====================================================
   FRANÇAIS AVEC GUS
   Plataforma de aprendizaje A1-B2
===================================================== */


/* =====================================================
   ESTADO GENERAL
===================================================== */

let tarjetas = [];
let tarjetasFiltradas = [];
let indice = 0;

let nivelUsuario = localStorage.getItem("gusNivel") || "A1";

let progreso =
    JSON.parse(localStorage.getItem("gusProgreso") || "{}");

let favoritas =
    JSON.parse(localStorage.getItem("gusFavoritas") || "[]");

let historialExamenes =
    JSON.parse(localStorage.getItem("gusExamenes") || "[]");


/* =====================================================
   ESTADO FLASHCARDS
===================================================== */

let flashcardModoRepaso = false;


/* =====================================================
   ESTADO PRÁCTICA
===================================================== */

let practicaTipo = "";
let practicaTarjetas = [];
let practicaIndice = 0;
let practicaPuntos = 0;
let practicaRespondida = false;


/* =====================================================
   ESTADO ESCRITURA
===================================================== */

let escrituraTarjetas = [];
let escrituraIndice = 0;
let escrituraAciertos = 0;
let escrituraRespondida = false;


/* =====================================================
   ESTADO EXAMEN
===================================================== */

let examenTarjetas = [];
let examenIndice = 0;
let examenCorrectas = 0;
let examenFalladas = 0;
let examenRespondida = false;


/* =====================================================
   DOM
===================================================== */

const $ = (id) => document.getElementById(id);


/* =====================================================
   INICIO
===================================================== */

document.addEventListener("DOMContentLoaded", iniciar);


async function iniciar() {

    configurarNavegacion();
    configurarEventos();

    actualizarNivelUI();

    try {

        const response =
            await fetch("francais_flashcards_A1_B2_v1.json");

        if (!response.ok) {
            throw new Error(
                `No se pudo cargar el JSON (${response.status})`
            );
        }

        tarjetas = await response.json();

        if (!Array.isArray(tarjetas) || tarjetas.length === 0) {
            throw new Error("El archivo JSON no contiene tarjetas.");
        }

        tarjetas = tarjetas.filter(
            tarjeta =>
                tarjeta &&
                tarjeta.id !== undefined &&
                tarjeta.nivel &&
                tarjeta.frances &&
                tarjeta.espanol
        );

        actualizarTodo();

        indice = 0;
        aplicarFiltros();

        mostrarVista("inicioView");

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudo cargar el archivo de tarjetas."
        );

        $("info").textContent =
            "Comprueba que el JSON esté en la misma carpeta.";

    }


    if ("serviceWorker" in navigator) {

        navigator.serviceWorker
            .register("service-worker.js")
            .catch(error => {
                console.warn(
                    "Service Worker no disponible:",
                    error
                );
            });
    }
}


/* =====================================================
   NAVEGACIÓN
===================================================== */

function configurarNavegacion() {

    document
        .querySelectorAll("[data-view]")
        .forEach(boton => {

            boton.addEventListener("click", () => {

                const vista =
                    boton.dataset.view;

                mostrarVista(vista);

            });

        });
}


function mostrarVista(idVista) {

    document
        .querySelectorAll(".view")
        .forEach(view => {
            view.classList.remove("active");
        });

    const vista = $(idVista);

    if (!vista) return;

    vista.classList.add("active");

    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view === idVista
            );

        });


    if (idVista === "inicioView") {
        actualizarDashboard();
    }

    if (idVista === "repasoView") {
        actualizarPantallaRepaso();
    }

    if (idVista === "progresoView") {
        actualizarProgresoView();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   EVENTOS
===================================================== */

function configurarEventos() {

    $("nivelFilter").addEventListener(
        "change",
        () => {
            flashcardModoRepaso = false;
            aplicarFiltros();
        }
    );

    $("modoFiltro").addEventListener(
        "change",
        aplicarFiltros
    );


    $("nivelInicio").addEventListener(
        "change",
        cambiarNivel
    );


    $("headerNivelBtn").addEventListener(
        "click",
        () => mostrarVista("inicioView")
    );


    $("mostrarBtn").addEventListener(
        "click",
        mostrarRespuesta
    );

    $("escucharBtn").addEventListener(
        "click",
        escuchar
    );

    $("anteriorBtn").addEventListener(
        "click",
        anterior
    );

    $("siguienteBtn").addEventListener(
        "click",
        siguiente
    );

    $("facilBtn").addEventListener(
        "click",
        () => guardarProgreso("facil")
    );

    $("dificilBtn").addEventListener(
        "click",
        () => guardarProgreso("dificil")
    );

    $("favoritaBtn").addEventListener(
        "click",
        marcarFavorita
    );


    $("empezarRepasoBtn").addEventListener(
        "click",
        iniciarRepaso
    );


    document
        .querySelectorAll(".practice-option")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => iniciarPractica(
                    button.dataset.practice
                )
            );

        });


    $("nextExerciseBtn").addEventListener(
        "click",
        siguienteEjercicio
    );
   
    $("empezarEscrituraBtn").addEventListener(
        "click",
        iniciarEscritura
    );

    $("checkWritingBtn").addEventListener(
        "click",
        comprobarEscritura
    );

    $("nextWritingBtn").addEventListener(
        "click",
        siguienteEscritura
    );


    $("startExamBtn").addEventListener(
        "click",
        iniciarExamen
    );

    $("nextExamBtn").addEventListener(
        "click",
        siguientePreguntaExamen
    );

    $("newExamBtn").addEventListener(
        "click",
        () => {
            $("examResult").classList.add("hidden");
            $("examSetup").classList.remove("hidden");
        }
    );


    $("resetProgressBtn").addEventListener(
        "click",
        reiniciarProgreso
    );
}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function guardarDatos() {

    localStorage.setItem(
        "gusProgreso",
        JSON.stringify(progreso)
    );

    localStorage.setItem(
        "gusFavoritas",
        JSON.stringify(favoritas)
    );

    localStorage.setItem(
        "gusExamenes",
        JSON.stringify(historialExamenes)
    );

    localStorage.setItem(
        "gusNivel",
        nivelUsuario
    );
}


function estadoTarjeta(id) {

    return progreso[String(id)] || "pendiente";
}


/* =====================================================
   NIVEL
===================================================== */

function cambiarNivel(event) {

    nivelUsuario =
        event.target.value;

    localStorage.setItem(
        "gusNivel",
        nivelUsuario
    );

    actualizarNivelUI();
    actualizarDashboard();
    aplicarFiltros();

    mostrarMensaje(
        `Nivel seleccionado: ${nivelUsuario}`
    );
}


function actualizarNivelUI() {

    $("nivelInicio").value =
        nivelUsuario;

    $("nivelActualTexto").textContent =
        nivelUsuario;

    $("headerNivelBtn").textContent =
        nivelUsuario;
}


/* =====================================================
   FLASHCARDS
===================================================== */

function aplicarFiltros() {

    if (!tarjetas.length) return;

    const nivel =
        $("nivelFilter").value;

    const modo =
        $("modoFiltro").value;


    let lista =
        tarjetas.filter(tarjeta => {

            if (
                nivel !== "TODOS" &&
                tarjeta.nivel !== nivel
            ) {
                return false;
            }

            return true;
        });


    if (flashcardModoRepaso) {

        lista = lista.filter(tarjeta => {

            const estado =
                estadoTarjeta(tarjeta.id);

            return (
                estado !== "facil" ||
                estado === "dificil"
            );

        });

    } else {

        if (modo === "pendientes") {

            lista = lista.filter(
                tarjeta =>
                    estadoTarjeta(tarjeta.id)
                    === "pendiente"
            );

        }

        if (modo === "dificiles") {

            lista = lista.filter(
                tarjeta =>
                    estadoTarjeta(tarjeta.id)
                    === "dificil"
            );

        }

        if (modo === "aprendidas") {

            lista = lista.filter(
                tarjeta =>
                    estadoTarjeta(tarjeta.id)
                    === "facil"
            );

        }

        if (modo === "favoritas") {

            lista = lista.filter(
                tarjeta =>
                    favoritas.includes(tarjeta.id)
            );

        }

    }


    tarjetasFiltradas = lista;

console.log("Tarjetas totales:", tarjetas.length);
console.log("Tarjetas filtradas:", lista.length);
console.log("Nivel seleccionado:", nivel);
console.log("Modo seleccionado:", modo);

if (indice >= tarjetasFiltradas.length) {
    indice = 0;
}

    cargarTarjeta();
}


function cargarTarjeta() {

    if (!tarjetasFiltradas.length) {

        $("frances").textContent =
            "No hay tarjetas";

        $("espanol").textContent =
            "Prueba otro filtro.";

        $("contador").textContent =
            "0 / 0";

        $("info").textContent =
            "Sin resultados";

        $("barraProgreso").style.width =
            "0%";

        $("mostrarBtn").disabled = true;
        $("escucharBtn").disabled = true;

        return;
    }


    $("mostrarBtn").disabled = false;
    $("escucharBtn").disabled = false;


    const tarjeta =
        tarjetasFiltradas[indice];


    $("frances").textContent =
        tarjeta.frances;

    $("espanol").textContent =
        tarjeta.espanol;


    $("tipoTarjeta").textContent =
        tarjeta.tipo === "frase"
            ? "FRASE"
            : "VOCABULARIO";


    $("contador").textContent =
        `${indice + 1} / ${tarjetasFiltradas.length}`;


    $("info").textContent =
        `${tarjeta.nivel} · ${tarjeta.tema}`;


    const porcentaje =
        ((indice + 1) /
            tarjetasFiltradas.length) * 100;


    $("barraProgreso").style.width =
        `${porcentaje}%`;


    $("respuestaBox")
        .classList.add("hidden");


    actualizarBotonFavorita();


    $("anteriorBtn").disabled =
        indice === 0;

    $("siguienteBtn").disabled =
        indice === tarjetasFiltradas.length - 1;

}


function mostrarRespuesta() {

    $("respuestaBox")
        .classList.remove("hidden");
}


function siguiente() {

    if (!tarjetasFiltradas.length) return;

    if (
        indice <
        tarjetasFiltradas.length - 1
    ) {

        indice++;

        cargarTarjeta();

    } else {

        mostrarMensaje(
            "Has llegado al final de este bloque."
        );

    }
}


function anterior() {

    if (!tarjetasFiltradas.length) return;

    if (indice > 0) {

        indice--;

        cargarTarjeta();

    }
}


/* =====================================================
   AUDIO
===================================================== */

function hablar(texto) {

    if (!("speechSynthesis" in window)) {

        mostrarMensaje(
            "Tu navegador no admite audio."
        );

        return;
    }


    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(texto);

    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(
        utterance
    );
}


function escuchar() {

    if (!tarjetasFiltradas.length) return;

    hablar(
        tarjetasFiltradas[indice].frances
    );
}


/* =====================================================
   PROGRESO
===================================================== */

function guardarProgreso(estado) {

    if (!tarjetasFiltradas.length) return;

    const tarjeta =
        tarjetasFiltradas[indice];

    progreso[String(tarjeta.id)] =
        estado;

    guardarDatos();

    actualizarTodo();


    if (estado === "facil") {

        mostrarMensaje(
            "¡Muy bien! Tarjeta aprendida."
        );

    } else {

        mostrarMensaje(
            "La añadiremos a tus repasos."
        );

    }


    /*
       Después de marcar una tarjeta,
       pasamos a la siguiente.
    */

    if (
        indice <
        tarjetasFiltradas.length - 1
    ) {

        indice++;

        cargarTarjeta();

    } else {

        cargarTarjeta();

    }
}


function marcarFavorita() {

    if (!tarjetasFiltradas.length) return;

    const id =
        tarjetasFiltradas[indice].id;

    const posicion =
        favoritas.indexOf(id);


    if (posicion === -1) {

        favoritas.push(id);

        mostrarMensaje(
            "⭐ Añadida a favoritas."
        );

    } else {

        favoritas.splice(
            posicion,
            1
        );

        mostrarMensaje(
            "Favorita eliminada."
        );

    }


    guardarDatos();

    actualizarBotonFavorita();
    actualizarDashboard();
}


function actualizarBotonFavorita() {

    if (!tarjetasFiltradas.length) return;

    const id =
        tarjetasFiltradas[indice].id;

    const esFavorita =
        favoritas.includes(id);

    $("favoritaBtn").textContent =
        esFavorita ? "★" : "☆";

    $("favoritaBtn")
        .classList.toggle(
            "favorite",
            esFavorita
        );
}


/* =====================================================
   REPASO
===================================================== */

function iniciarRepaso() {

    const nivel =
        nivelUsuario === "TODOS"
            ? "TODOS"
            : nivelUsuario;


    $("nivelFilter").value =
        nivel;


    $("modoFiltro").value =
        "todas";


    flashcardModoRepaso = true;

    indice = 0;

    mostrarVista("flashcardsView");

    aplicarFiltros();


    if (!tarjetasFiltradas.length) {

        flashcardModoRepaso = false;

        mostrarMensaje(
            "¡No tienes repasos pendientes! 🎉"
        );

        aplicarFiltros();
    }
}


function actualizarPantallaRepaso() {

    const pendientes =
        contarPorEstado("pendiente");

    const dificiles =
        contarPorEstado("dificil");

    const fav =
        favoritas.length;


    $("repasoPendientes").textContent =
        pendientes;

    $("repasoDificiles").textContent =
        dificiles;

    $("repasoFavoritas").textContent =
        fav;
}


/* =====================================================
   PRÁCTICA
===================================================== */

function iniciarPractica(tipo) {

    practicaTipo = tipo;

    practicaTarjetas =
        obtenerTarjetasNivel(
            nivelUsuario
        );


    if (practicaTarjetas.length < 4) {

        mostrarMensaje(
            "Necesitamos al menos 4 tarjetas para este ejercicio."
        );

        return;
    }


    mezclar(practicaTarjetas);

    practicaTarjetas =
        practicaTarjetas.slice(0, 10);

    practicaIndice = 0;
    practicaPuntos = 0;
    practicaRespondida = false;


    $("practicaMenu")
        .classList.add("hidden");

    $("practicaGame")
        .classList.remove("hidden");


    mostrarEjercicio();
}


function mostrarEjercicio() {

    if (
        practicaIndice >=
        practicaTarjetas.length
    ) {

        terminarPractica();

        return;
    }


    practicaRespondida = false;


    const tarjeta =
        practicaTarjetas[practicaIndice];


    $("ejercicioNumero").textContent =
        `Pregunta ${practicaIndice + 1} / ${practicaTarjetas.length}`;


    $("ejercicioPuntos").textContent =
        `${practicaPuntos} puntos`;


    $("exerciseFeedback")
        .classList.add("hidden");


    $("nextExerciseBtn")
        .classList.add("hidden");


    const audioBtn =
        $("exerciseAudioBtn");


    audioBtn.classList.add("hidden");


    let preguntaFrances;


    if (practicaTipo === "reverse") {

        $("exerciseLabel").textContent =
            "ESPAÑOL";

        preguntaFrances = false;

    } else {

        $("exerciseLabel").textContent =
            "FRANÇAIS";

        preguntaFrances = true;

    }


    if (practicaTipo === "listening") {

        $("exerciseLabel").textContent =
            "ESCUCHA";

        $("exerciseQuestionText").textContent =
            "Pulsa «Escuchar»";

        audioBtn.classList.remove("hidden");

        audioBtn.onclick =
            () => hablar(tarjeta.frances);

    } else {

        $("exerciseQuestionText").textContent =
            preguntaFrances
                ? tarjeta.frances
                : tarjeta.espanol;

    }


    const opciones =
        crearOpciones(
            tarjeta,
            practicaTipo === "reverse"
                ? "frances"
                : "espanol"
        );


    const contenedor =
        $("exerciseOptions");

    contenedor.innerHTML = "";


    opciones.forEach(opcion => {

        const button =
            document.createElement("button");

        button.className =
            "exercise-option";

        button.textContent =
            opcion.texto;

        button.addEventListener(
            "click",
            () => responderEjercicio(
                button,
                opcion.correcta
            )
        );

        contenedor.appendChild(button);

    });
}


function responderEjercicio(
    boton,
    correcta
) {

    if (practicaRespondida) return;

    practicaRespondida = true;


    document
        .querySelectorAll(
            "#exerciseOptions .exercise-option"
        )
        .forEach(button => {
            button.disabled = true;
        });


    if (correcta) {

        boton.classList.add("correct");

        practicaPuntos++;

        $("exerciseFeedback").textContent =
            "✅ ¡Correcto!";

        $("exerciseFeedback")
            .classList.remove("hidden");

    } else {

        boton.classList.add("wrong");

        $("exerciseFeedback").textContent =
            `❌ No exactamente. Respuesta correcta: ${
                practicaTipo === "reverse"
                    ? practicaTarjetas[practicaIndice].frances
                    : practicaTarjetas[practicaIndice].espanol
            }`;

        $("exerciseFeedback")
            .classList.remove("hidden");

    }


    $("ejercicioPuntos").textContent =
        `${practicaPuntos} puntos`;

    $("nextExerciseBtn")
        .classList.remove("hidden");
}


function siguienteEjercicio() {

    practicaIndice++;

    mostrarEjercicio();
}


function terminarPractica() {

    $("practicaGame")
        .classList.add("hidden");

    $("practicaMenu")
        .classList.remove("hidden");


    mostrarMensaje(
        `Práctica terminada: ${practicaPuntos}/${practicaTarjetas.length} correctas.`
    );
}


/* =====================================================
   ESCRITURA
===================================================== */

function iniciarEscritura() {

    escrituraTarjetas =
        obtenerTarjetasNivel(
            nivelUsuario
        );


    mezclar(escrituraTarjetas);

    escrituraTarjetas =
        escrituraTarjetas.slice(0, 10);

    escrituraIndice = 0;
    escrituraAciertos = 0;
    escrituraRespondida = false;


    $("escrituraSetup")
        .classList.add("hidden");

    $("escrituraGame")
        .classList.remove("hidden");


    mostrarPreguntaEscritura();
}


function mostrarPreguntaEscritura() {

    if (
        escrituraIndice >=
        escrituraTarjetas.length
    ) {

        terminarEscritura();

        return;
    }


    const tarjeta =
        escrituraTarjetas[escrituraIndice];


    escrituraRespondida = false;


    $("writingNumber").textContent =
        `Pregunta ${escrituraIndice + 1} / ${escrituraTarjetas.length}`;


    $("writingScore").textContent =
        `${escrituraAciertos} aciertos`;


    $("writingPrompt").textContent =
        tarjeta.espanol;


    $("writingInput").value = "";

    $("writingInput").disabled = false;


    $("checkWritingBtn")
        .classList.remove("hidden");


    $("writingFeedback")
        .classList.add("hidden");


    $("nextWritingBtn")
        .classList.add("hidden");


    setTimeout(
        () => $("writingInput").focus(),
        50
    );
}


function comprobarEscritura() {

    if (escrituraRespondida) return;


    const respuesta =
        $("writingInput").value.trim();


    if (!respuesta) {

        mostrarMensaje(
            "Escribe una respuesta antes de comprobar."
        );

        return;
    }


    escrituraRespondida = true;


    const tarjeta =
        escrituraTarjetas[escrituraIndice];


    const usuario =
        normalizarTexto(respuesta);

    const correcta =
        normalizarTexto(tarjeta.frances);


    const esCorrecta =
        usuario === correcta;


    if (esCorrecta) {

        escrituraAciertos++;

        $("writingFeedback").innerHTML =
            "✅ <strong>¡Correcto!</strong>";

    } else {

        $("writingFeedback").innerHTML =
            `❌ <strong>Respuesta correcta:</strong><br>${escapeHtml(tarjeta.frances)}`;

    }


    $("writingFeedback")
        .classList.remove("hidden");


    $("writingInput").disabled = true;


    $("checkWritingBtn")
        .classList.add("hidden");


    $("nextWritingBtn")
        .classList.remove("hidden");
}


function siguienteEscritura() {

    escrituraIndice++;

    mostrarPreguntaEscritura();
}


function terminarEscritura() {

    $("escrituraGame")
        .classList.add("hidden");

    $("escrituraSetup")
        .classList.remove("hidden");


    mostrarMensaje(
        `Escritura terminada: ${escrituraAciertos}/${escrituraTarjetas.length} correctas.`
    );
}


/* =====================================================
   EXÁMENES
===================================================== */

function iniciarExamen() {

    const nivel =
        $("examLevel").value;

    const cantidad =
        Number(
            $("examLength").value
        );


    let disponibles =
        tarjetas.filter(
            tarjeta =>
                tarjeta.nivel === nivel
        );


    if (disponibles.length < 4) {

        mostrarMensaje(
            "No hay suficientes tarjetas para este examen."
        );

        return;
    }


    mezclar(disponibles);

    examenTarjetas =
        disponibles.slice(
            0,
            Math.min(
                cantidad,
                disponibles.length
            )
        );


    examenIndice = 0;
    examenCorrectas = 0;
    examenFalladas = 0;
    examenRespondida = false;


    $("examSetup")
        .classList.add("hidden");

    $("examResult")
        .classList.add("hidden");

    $("examGame")
        .classList.remove("hidden");


    mostrarPreguntaExamen();
}


function mostrarPreguntaExamen() {

    if (
        examenIndice >=
        examenTarjetas.length
    ) {

        terminarExamen();

        return;
    }


    examenRespondida = false;


    const tarjeta =
        examenTarjetas[examenIndice];


    $("examQuestionNumber").textContent =
        `Pregunta ${examenIndice + 1} / ${examenTarjetas.length}`;


    $("examScore").textContent =
        `${examenCorrectas} correctas`;


    $("examFeedback")
        .classList.add("hidden");


    $("nextExamBtn")
        .classList.add("hidden");


    $("examQuestionType").textContent =
        "FRANCÉS";


    $("examQuestion").textContent =
        tarjeta.frances;


    const opciones =
        crearOpciones(
            tarjeta,
            "espanol"
        );


    const contenedor =
        $("examOptions");

    contenedor.innerHTML = "";


    opciones.forEach(opcion => {

        const button =
            document.createElement("button");

        button.className =
            "exercise-option";

        button.textContent =
            opcion.texto;

        button.addEventListener(
            "click",
            () => responderExamen(
                button,
                opcion.correcta
            )
        );

        contenedor.appendChild(button);

    });
}


function responderExamen(
    boton,
    correcta
) {

    if (examenRespondida) return;

    examenRespondida = true;


    document
        .querySelectorAll(
            "#examOptions .exercise-option"
        )
        .forEach(button => {
            button.disabled = true;
        });


    if (correcta) {

        boton.classList.add("correct");

        examenCorrectas++;

        $("examFeedback").innerHTML =
            "✅ Correcto.";

    } else {

        boton.classList.add("wrong");

        examenFalladas++;

        const tarjeta =
            examenTarjetas[examenIndice];

        $("examFeedback").innerHTML =
            `❌ Incorrecto.<br>
             Respuesta correcta:
             <strong>${escapeHtml(tarjeta.espanol)}</strong>`;

    }


    $("examFeedback")
        .classList.remove("hidden");


    $("examScore").textContent =
        `${examenCorrectas} correctas`;


    $("nextExamBtn")
        .classList.remove("hidden");
}


function siguientePreguntaExamen() {

    examenIndice++;

    mostrarPreguntaExamen();
}


function terminarExamen() {

    const total =
        examenTarjetas.length;


    const porcentaje =
        Math.round(
            (examenCorrectas / total) * 100
        );


    historialExamenes.unshift({

        fecha: new Date().toISOString(),

        nivel:
            examenTarjetas[0]?.nivel || "A1",

        total,

        correctas:
            examenCorrectas,

        falladas:
            examenFalladas,

        porcentaje

    });


    historialExamenes =
        historialExamenes.slice(0, 10);


    guardarDatos();


    $("examGame")
        .classList.add("hidden");

    $("examResult")
        .classList.remove("hidden");


    $("resultScore").textContent =
        `${porcentaje}%`;

    $("resultCorrect").textContent =
        examenCorrectas;

    $("resultWrong").textContent =
        examenFalladas;


    if (porcentaje >= 90) {

        $("resultTitle").textContent =
            "¡Excelente! 🏆";

        $("resultText").textContent =
            "Tienes un dominio muy sólido de este bloque.";

    } else if (porcentaje >= 70) {

        $("resultTitle").textContent =
            "¡Muy bien! 👏";

        $("resultText").textContent =
            "Vas por muy buen camino. Sigue practicando.";

    } else if (porcentaje >= 50) {

        $("resultTitle").textContent =
            "Buen comienzo 💪";

        $("resultText").textContent =
            "Repasa las preguntas falladas y vuelve a intentarlo.";

    } else {

        $("resultTitle").textContent =
            "A seguir practicando 📚";

        $("resultText").textContent =
            "El repaso te ayudará a consolidar estas palabras.";

    }


    actualizarTodo();
}


/* =====================================================
   OPCIONES MÚLTIPLES
===================================================== */

function crearOpciones(
    tarjetaCorrecta,
    campoRespuesta
) {

    const candidatos =
        tarjetas.filter(
            tarjeta =>
                tarjeta.id !==
                tarjetaCorrecta.id
        );


    mezclar(candidatos);


    const distractores =
        candidatos
            .slice(0, 3)
            .map(
                tarjeta =>
                    tarjeta[campoRespuesta]
            );


    const opciones = [

        {
            texto:
                tarjetaCorrecta[campoRespuesta],

            correcta: true

        },

        ...distractores.map(
            texto => ({

                texto,

                correcta: false

            })
        )

    ];


    mezclar(opciones);

    return opciones;
}


/* =====================================================
   PROGRESO / DASHBOARD
===================================================== */

function actualizarTodo() {

    actualizarEstadisticas();

    actualizarDashboard();

    actualizarProgresoView();

    actualizarPantallaRepaso();
}


function actualizarDashboard() {

    if (!tarjetas.length) return;


    const nivel =
        nivelUsuario;


    let lista =
        nivel === "TODOS"
            ? tarjetas
            : tarjetas.filter(
                t => t.nivel === nivel
            );


    const aprendidas =
        lista.filter(
            t => estadoTarjeta(t.id) === "facil"
        ).length;


    const dificiles =
        lista.filter(
            t => estadoTarjeta(t.id) === "dificil"
        ).length;


    const pendientes =
        lista.filter(
            t => estadoTarjeta(t.id) === "pendiente"
        ).length;


    const porcentaje =
        lista.length
            ? Math.round(
                (aprendidas / lista.length) * 100
            )
            : 0;


    $("progresoPorcentaje").textContent =
        `${porcentaje}%`;

    $("progresoInicio").style.width =
        `${porcentaje}%`;

    $("inicioAprendidas").textContent =
        aprendidas;

    $("inicioPendientes").textContent =
        pendientes;

    $("inicioDificiles").textContent =
        dificiles;


    $("repasoPendientesTexto").textContent =
        `${pendientes} tarjetas pendientes`;

}


function actualizarEstadisticas() {

    $("statTotal").textContent =
        tarjetas.length;

    $("statLearned").textContent =
        contarPorEstado("facil");

    $("statDifficult").textContent =
        contarPorEstado("dificil");

    $("statFavorites").textContent =
        favoritas.length;
}


function contarPorEstado(estado) {

    return tarjetas.filter(
        tarjeta =>
            estadoTarjeta(tarjeta.id) === estado
    ).length;
}


/* =====================================================
   PANTALLA PROGRESO
===================================================== */

function actualizarProgresoView() {

    if (!tarjetas.length) return;


    const niveles =
        ["A1", "A2", "B1", "B2"];


    const contenedor =
        $("levelProgressList");

    contenedor.innerHTML = "";


    niveles.forEach(nivel => {

        const lista =
            tarjetas.filter(
                t => t.nivel === nivel
            );


        const aprendidas =
            lista.filter(
                t => estadoTarjeta(t.id)
                    === "facil"
            ).length;


        const porcentaje =
            lista.length
                ? Math.round(
                    (aprendidas / lista.length) * 100
                )
                : 0;


        const row =
            document.createElement("div");

        row.className =
            "level-row";


        row.innerHTML = `

            <div class="level-row-header">
                <strong>${nivel}</strong>
                <span>
                    ${aprendidas}/${lista.length}
                    · ${porcentaje}%
                </span>
            </div>

            <div class="progress-track">
                <div
                    class="progress-fill"
                    style="width:${porcentaje}%"
                ></div>
            </div>
        `;


        contenedor.appendChild(row);

    });


    actualizarHistorialExamenes();
}


function actualizarHistorialExamenes() {

    const contenedor =
        $("examHistoryList");


    if (!historialExamenes.length) {

        contenedor.innerHTML =
            `<p class="empty-text">
                Todavía no has realizado ningún examen.
            </p>`;

        return;
    }


    contenedor.innerHTML = "";


    historialExamenes
        .slice(0, 5)
        .forEach(examen => {

            const item =
                document.createElement("div");

            item.className =
                "exam-history-item";


            const fecha =
                new Date(
                    examen.fecha
                ).toLocaleDateString(
                    "es-ES"
                );


            item.innerHTML = `

                <div>
                    <strong>
                        Examen ${escapeHtml(examen.nivel)}
                    </strong>

                    <small>
                        ${fecha} ·
                        ${examen.correctas}/${examen.total}
                    </small>
                </div>

                <div class="exam-history-score">
                    ${examen.porcentaje}%
                </div>
            `;


            contenedor.appendChild(item);

        });
}


/* =====================================================
   UTILIDADES
===================================================== */

function obtenerTarjetasNivel(nivel) {

    if (nivel === "TODOS") {
        return [...tarjetas];
    }

    return tarjetas.filter(
        tarjeta =>
            tarjeta.nivel === nivel
    );
}


function mezclar(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];
    }

    return array;
}


function normalizarTexto(texto) {

    return texto

        .toLowerCase()

        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[.,!?¿¡;:"'’()-]/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();
}


function escapeHtml(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto;

    return div.innerHTML;
}


function mostrarMensaje(texto) {

    const mensaje =
        $("mensaje");

    mensaje.textContent =
        texto;

    mensaje.classList.add("show");


    clearTimeout(
        mostrarMensaje.timeout
    );


    mostrarMensaje.timeout =
        setTimeout(
            () => {
                mensaje.classList.remove(
                    "show"
                );
            },
            2200
        );
}


function reiniciarProgreso() {

    const confirmar =
        confirm(
            "¿Seguro que quieres borrar todo tu progreso, favoritos y resultados de exámenes?"
        );


    if (!confirmar) return;


    progreso = {};
    favoritas = [];
    historialExamenes = [];


    guardarDatos();

    actualizarTodo();

    aplicarFiltros();


    mostrarMensaje(
        "Progreso reiniciado."
    );
}
