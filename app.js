let tarjetas = [];
let tarjetasFiltradas = [];
let indice = 0;

fetch("francais_flashcards_A1_B2_v1.json")
.then(r => r.json())
.then(data => {

    tarjetas = data;
    tarjetasFiltradas = [...tarjetas];

    actualizarEstadisticas();
    cargarTarjeta();

})
.catch(error => {
    console.error("Error cargando JSON:", error);
});

const nivelFilter = document.getElementById("nivelFilter");

nivelFilter.addEventListener("change", filtrarNivel);

const modoFiltro =
    document.getElementById("modoFiltro");

if(modoFiltro){

    modoFiltro.addEventListener(
        "change",
        aplicarFiltroAvanzado
    );
}

function filtrarNivel(){

    const nivel = nivelFilter.value;

    if(nivel === "Todos"){

        tarjetasFiltradas = [...tarjetas];

    }else{

        tarjetasFiltradas =
            tarjetas.filter(
                t => t.nivel === nivel
            );
    }

    indice = 0;

    document.getElementById("espanol").innerText = "";

    cargarTarjeta();
}

function aplicarFiltroAvanzado(){

    const selector =
        document.getElementById("modoFiltro");

    if(!selector){
        return;
    }

    const modo = selector.value;

    let progreso =
        JSON.parse(
            localStorage.getItem("francesGus")
        ) || {};

    let favoritos =
        JSON.parse(
            localStorage.getItem("francesFavoritas")
        ) || [];

    switch(modo){

        case "favoritas":

            tarjetasFiltradas =
                tarjetas.filter(
                    t => favoritos.includes(t.id)
                );

        break;

        case "aprendidas":

            tarjetasFiltradas =
                tarjetas.filter(
                    t =>
                    progreso[t.id] &&
                    progreso[t.id].aprendido
                );

        break;

        case "dificiles":

            tarjetasFiltradas =
                tarjetas.filter(
                    t =>
                    progreso[t.id] &&
                    !progreso[t.id].aprendido
                );

        break;

        case "pendientes":

            tarjetasFiltradas =
                tarjetas.filter(
                    t => !progreso[t.id]
                );

        break;

        default:

            tarjetasFiltradas =
                [...tarjetas];
    }

    indice = 0;

    cargarTarjeta();
}

function cargarTarjeta(){

    if(tarjetasFiltradas.length === 0){

        document.getElementById("frances").innerText =
            "No hay tarjetas";

        document.getElementById("espanol").innerText = "";

        document.getElementById("info").innerText = "";

        document.getElementById("contador").innerText =
            "0 de 0";

        document.getElementById("barraProgreso").value = 0;

        return;
    }

    const card =
        tarjetasFiltradas[indice];

    document.getElementById("contador").innerText =
        "Tarjeta " +
        (indice + 1) +
        " de " +
        tarjetasFiltradas.length;

    document.getElementById("barraProgreso").value =
        ((indice + 1) /
        tarjetasFiltradas.length) * 100;

    document.getElementById("info").innerText =
        "📘 " +
        card.nivel +
        " | 🏷 " +
        card.tema;

    document.getElementById("frances").innerText =
        card.frances;

    document.getElementById("espanol").innerText = "";

    escuchar();
}

document
.getElementById("mostrarBtn")
.addEventListener("click", () => {

    if(tarjetasFiltradas.length === 0){
        return;
    }

    document.getElementById("espanol").innerText =
        tarjetasFiltradas[indice].espanol;
});

function siguiente(){

    if(tarjetasFiltradas.length === 0){
        return;
    }

    indice++;

    if(indice >= tarjetasFiltradas.length){

        indice = 0;
    }

    cargarTarjeta();
}

function anterior(){

    if(tarjetasFiltradas.length === 0){
        return;
    }

    indice--;

    if(indice < 0){

        indice =
            tarjetasFiltradas.length - 1;
    }

    cargarTarjeta();
}

function escuchar(){

    if(tarjetasFiltradas.length === 0){
        return;
    }

    const texto =
        tarjetasFiltradas[indice].frances;

    const voz =
        new SpeechSynthesisUtterance(texto);

    voz.lang = "fr-FR";
    voz.rate = 0.9;
    voz.pitch = 1;
    voz.volume = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(voz);
}

function marcarFacil(){

    guardarProgreso(true);
}

function marcarDificil(){

    guardarProgreso(false);
}

function marcarFavorita(){

    if(tarjetasFiltradas.length === 0){
        return;
    }

    let favoritos =
        JSON.parse(
            localStorage.getItem("francesFavoritas")
        ) || [];

    const id =
        tarjetasFiltradas[indice].id;

    if(!favoritos.includes(id)){

        favoritos.push(id);

        localStorage.setItem(
            "francesFavoritas",
            JSON.stringify(favoritos)
        );

        actualizarEstadisticas();

        alert("⭐ Añadida a favoritas");
    }else{

        alert("⭐ Ya estaba en favoritas");
    }
}

function guardarProgreso(acierto){

    if(tarjetasFiltradas.length === 0){
        return;
    }

    let progreso =
        JSON.parse(
            localStorage.getItem("francesGus")
        ) || {};

    const id =
        tarjetasFiltradas[indice].id;

    progreso[id] = {

        aprendido: acierto,

        fecha:
            new Date().toISOString()
    };

    localStorage.setItem(
        "francesGus",
        JSON.stringify(progreso)
    );

    actualizarEstadisticas();

    siguiente();
}

function actualizarEstadisticas(){

    let progreso =
        JSON.parse(
            localStorage.getItem("francesGus")
        ) || {};

    let favoritos =
        JSON.parse(
            localStorage.getItem("francesFavoritas")
        ) || [];

    let aprendidas = 0;
    let dificiles = 0;

    Object.values(progreso)
    .forEach(item => {

        if(item.aprendido){

            aprendidas++;

        }else{

            dificiles++;
        }

    });

    document.getElementById("aprendidas").innerText =
        aprendidas;

    document.getElementById("dificiles").innerText =
        dificiles;

    document.getElementById("total").innerText =
        tarjetas.length;

    const fav =
        document.getElementById("favoritas");

    if(fav){

        fav.innerText =
            favoritos.length;
    }
}

function irInicio(){

    indice = 0;

    cargarTarjeta();
}

function mostrarTodas(){

    nivelFilter.value = "Todos";

    filtrarNivel();

    const selector =
        document.getElementById("modoFiltro");

    if(selector){
        selector.value = "todas";
    }

    alert("📚 Mostrando todas las tarjetas");
}

function mostrarResumen(){

    let progreso =
        JSON.parse(
            localStorage.getItem("francesGus")
        ) || {};

    let favoritos =
        JSON.parse(
            localStorage.getItem("francesFavoritas")
        ) || [];

    let aprendidas = 0;
    let dificiles = 0;

    Object.values(progreso)
    .forEach(item => {

        if(item.aprendido){

            aprendidas++;

        }else{

            dificiles++;
        }
    });

    const porcentaje =
        tarjetas.length > 0
            ? Math.round(
                (aprendidas / tarjetas.length) * 100
            )
            : 0;

    alert(
`📊 RESUMEN

✅ Aprendidas: ${aprendidas}

❌ Difíciles: ${dificiles}

⭐ Favoritas: ${favoritos.length}

📚 Total: ${tarjetas.length}

🎯 Progreso: ${porcentaje}%`
    );
}

function reiniciarProgreso(){

    if(
        confirm(
            "¿Seguro que quieres borrar todo el progreso?"
        )
    ){

        localStorage.removeItem("francesGus");
        localStorage.removeItem("francesFavoritas");

        actualizarEstadisticas();

        alert(
            "✅ Progreso reiniciado"
        );
    }
}

if("serviceWorker" in navigator){

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
            .register("service-worker.js")
            .then(() => {
                console.log(
                    "Service Worker registrado"
                );
            })
            .catch(error => {
                console.error(
                    "Error registrando Service Worker:",
                    error
                );
            });

        }
    );
}
