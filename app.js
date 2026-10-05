let tarjetas = [];
let tarjetasFiltradas = [];
let indice = 0;

fetch("francais_flashcards_A1_B2_v1.json")
.then(r => r.json())
.then(data => {

    tarjetas = data;
    tarjetasFiltradas = [...tarjetas];

    cargarTarjeta();

});

const nivelFilter = document.getElementById("nivelFilter");

nivelFilter.addEventListener("change", filtrarNivel);

function filtrarNivel(){

    const nivel = nivelFilter.value;

    if(nivel === "Todos"){

        tarjetasFiltradas = [...tarjetas];

    }else{

        tarjetasFiltradas =
            tarjetas.filter(t => t.nivel === nivel);
    }

    indice = 0;

    cargarTarjeta();
}

function cargarTarjeta(){

    if(tarjetasFiltradas.length === 0){

        document.getElementById("frances").innerText =
            "No hay tarjetas";

        document.getElementById("espanol").innerText = "";

        return;
    }

    let card = tarjetasFiltradas[indice];

    document.getElementById("contador").innerText =
        "Tarjeta " +
        (indice + 1) +
        " de " +
        tarjetasFiltradas.length;

    document.getElementById("barraProgreso").value =
        ((indice + 1) / tarjetasFiltradas.length) * 100;

    document.getElementById("info").innerText =
        "📘 " +
        card.nivel +
        " | 🏷 " +
        card.tema;

    document.getElementById("frances").innerText =
        card.frances;

    document.getElementById("espanol").innerText = "";
}

document
.getElementById("mostrarBtn")
.addEventListener("click", () => {

    document.getElementById("espanol").innerText =
        tarjetasFiltradas[indice].espanol;

});

function siguiente(){

    indice++;

    if(indice >= tarjetasFiltradas.length){

        indice = 0;
    }

    cargarTarjeta();
}

function anterior(){

    indice--;

    if(indice < 0){

        indice = tarjetasFiltradas.length - 1;
    }

    cargarTarjeta();
}

function escuchar(){

    if(tarjetasFiltradas.length === 0){
        return;
    }

    const texto =
        tarjetasFiltradas[indice].frances;

    let voz =
        new SpeechSynthesisUtterance(texto);

    voz.lang = "fr-FR";

    speechSynthesis.speak(voz);
}

function marcarFacil(){

    guardarProgreso(true);
}

function marcarDificil(){

    guardarProgreso(false);
}

function guardarProgreso(acierto){

    let progreso =
        JSON.parse(
            localStorage.getItem("francesGus")
        ) || {};

    let id =
        tarjetasFiltradas[indice].id;

    progreso[id] = {

        aprendido: acierto,
        fecha: new Date().toISOString()

    };

    localStorage.setItem(
        "francesGus",
        JSON.stringify(progreso)
    );

    siguiente();
}

if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register(
        "service-worker.js"
    );

}
