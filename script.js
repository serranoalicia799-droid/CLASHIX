
let puntosJugador = 0;
let puntosVictor = 0;
let selectedPhoto = "";

const dificultadVictor = "EXTREMO";
const LIMITE_RONDAS = 5;
const RECOMPENSA_XP = 500;

let historialJugador = [];
let dueloEnCurso = false;
let partidaTerminada = false;

let experienciaJugador =
  Number(localStorage.getItem("clashixXP")) || 0;

// ==============================
// SISTEMA DE MÚSICA CLASHIX
// ==============================

const menuMusic = document.getElementById("menuMusic");
const arenaMusic = document.getElementById("arenaMusic");

const cancionesMenu = [
  "menu/royalty.mp3",
  "menu/on-and-on.mp3"
];

const cancionesArena = [
  "arena/sunflower.mp3",
  "arena/alone.mp3"
];

let indiceMenu = -1;
let indiceArena = -1;

function elegirCancion(lista, indiceActual) {
  if (lista.length === 1) return 0;

  let nuevoIndice;

  do {
    nuevoIndice = Math.floor(Math.random() * lista.length);
  } while (nuevoIndice === indiceActual);

  return nuevoIndice;
}

function reproducirMusica(tipo) {
  if (tipo === "menu") {
    arenaMusic.pause();

    if (!menuMusic.paused) return;

    indiceMenu = elegirCancion(cancionesMenu, indiceMenu);
    menuMusic.src = cancionesMenu[indiceMenu];
    menuMusic.volume = 0.35;

    menuMusic.play().catch(() => {
      console.log("La música del menú espera la interacción del jugador.");
    });
  }

  if (tipo === "arena") {
    menuMusic.pause();

    if (!arenaMusic.paused) return;

    indiceArena = elegirCancion(cancionesArena, indiceArena);
    arenaMusic.src = cancionesArena[indiceArena];
    arenaMusic.volume = 0.45;

    arenaMusic.play().catch(() => {
      console.log("La música de arena espera la interacción del jugador.");
    });
  }
}

menuMusic.addEventListener("ended", () => {
  if (document.getElementById("home").classList.contains("active")) {
    menuMusic.pause();
    reproducirMusica("menu");
  }
});

arenaMusic.addEventListener("ended", () => {
  if (document.getElementById("arena").classList.contains("active")) {
    arenaMusic.pause();
    reproducirMusica("arena");
  }
});

// ==============================
// NAVEGACIÓN
// ==============================

function showSetup() {
  document.getElementById("home").classList.remove("active");
  document.getElementById("setup").classList.add("active");
  document.getElementById("playerName").focus();
}

function showHome() {
  document.getElementById("setup").classList.remove("active");
  document.getElementById("home").classList.add("active");

  arenaMusic.pause();
  reproducirMusica("menu");
}

// ==============================
// INTERFAZ DE RECOMPENSAS
// ==============================

function prepararInterfaz() {
  const arena = document.getElementById("arena");

  if (!document.getElementById("playerXP")) {
    const xp = document.createElement("div");
    xp.id = "playerXP";
    xp.textContent = "⭐ " + experienciaJugador + " XP";
    xp.style.cssText =
      "text-align:center;padding:10px;color:#d8c5ff;font-weight:bold;";
    arena.prepend(xp);
  }

  actualizarXP();
}

function actualizarXP() {
  const xp = document.getElementById("playerXP");

  if (xp) {
    xp.textContent = "⭐ " + experienciaJugador + " XP";
  }
}

// ==============================
// ENTRAR A LA ARENA
// ==============================

function enterArena() {
  const name = document.getElementById("playerName").value.trim();
  const error = document.getElementById("error");

  if (name.length < 2) {
    error.textContent = "Escribe un nombre de al menos 2 caracteres.";
    return;
  }

  error.textContent = "";

  document.getElementById("setup").classList.remove("active");
  document.getElementById("arena").classList.add("active");

  document.getElementById("arenaPlayer").textContent = name;

  const arenaPhoto = document.getElementById("arenaPhoto");
  const arenaPlaceholder = document.getElementById("arenaPlaceholder");

  if (selectedPhoto) {
    arenaPhoto.src = selectedPhoto;
    arenaPhoto.style.display = "block";
    arenaPlaceholder.style.display = "none";
  } else {
    arenaPhoto.style.display = "none";
    arenaPlaceholder.style.display = "block";
  }

  reproducirMusica("arena");

  prepararInterfaz();
  iniciarNuevaPartida();
}

// ==============================
// NUEVA PARTIDA
// ==============================

function iniciarNuevaPartida() {
  puntosJugador = 0;
  puntosVictor = 0;
  historialJugador = [];
  dueloEnCurso = false;
  partidaTerminada = false;

  document.getElementById("score").textContent = "0 - 0";
  document.getElementById("battleMessage").textContent =
    "VÍCTOR EXTREMO — ESPERANDO JUGADA...";

  const botones = document.querySelectorAll(
    "#arena button[onclick^='chooseMove']"
  );

  botones.forEach(boton => boton.disabled = false);

  const pantalla = document.getElementById("matchResult");

  if (pantalla) {
    pantalla.remove();
  }
}

// ==============================
// INTELIGENCIA EXTREMO
// ==============================

function elegirJugadaVictor() {
  const jugadas = ["piedra", "papel", "tijera"];

  const contras = {
    piedra: "papel",
    papel: "tijera",
    tijera: "piedra"
  };

  const historial = historialJugador.slice(-15);

  if (historial.length < 2) {
    return jugadas[Math.floor(Math.random() * 3)];
  }

  const frecuencia = {
    piedra: 0,
    papel: 0,
    tijera: 0
  };

  historial.forEach(jugada => {
    frecuencia[jugada]++;
  });

  const masUsada = jugadas.reduce((a, b) =>
    frecuencia[a] >= frecuencia[b] ? a : b
  );

  const ultimas = historial.slice(-5);

  const frecuenciaReciente = {
    piedra: 0,
    papel: 0,
    tijera: 0
  };

  ultimas.forEach(jugada => {
    frecuenciaReciente[jugada]++;
  });

  const masReciente = jugadas.reduce((a, b) =>
    frecuenciaReciente[a] >= frecuenciaReciente[b] ? a : b
  );

  const ultima = historial[historial.length - 1];
  const penultima = historial[historial.length - 2];

  if (ultima === penultima) {
    return contras[ultima];
  }

  const tendencia =
    frecuencia[masUsada] + frecuenciaReciente[masReciente];

  if (tendencia >= 5) {
    return contras[masReciente];
  }

  return jugadas[Math.floor(Math.random() * 3)];
}

// ==============================
// SISTEMA DE BATALLA
// ==============================

function chooseMove(jugadaJugador) {
  if (dueloEnCurso || partidaTerminada) return;

  dueloEnCurso = true;

  const mensaje = document.getElementById("battleMessage");

  const botones = document.querySelectorAll(
    "#arena button[onclick^='chooseMove']"
  );

  botones.forEach(boton => boton.disabled = true);

  const jugadaVictor = elegirJugadaVictor();

  historialJugador.push(jugadaJugador);

  let cuenta = 3;

  mensaje.textContent = "VÍCTOR ESTÁ ANALIZANDO...";

  const intervalo = setInterval(() => {
    mensaje.textContent = cuenta;
    cuenta--;

    if (cuenta < 0) {
      clearInterval(intervalo);

      mensaje.textContent =
        "TU JUGADA: " + jugadaJugador.toUpperCase() +
        " | VÍCTOR: " + jugadaVictor.toUpperCase();

      if (jugadaJugador === jugadaVictor) {
        mensaje.textContent += " — EMPATE";
      } else if (
        (jugadaJugador === "piedra" && jugadaVictor === "tijera") ||
        (jugadaJugador === "papel" && jugadaVictor === "piedra") ||
        (jugadaJugador === "tijera" && jugadaVictor === "papel")
      ) {
        puntosJugador++;
        mensaje.textContent += " — ¡GANASTE LA RONDA!";
      } else {
        puntosVictor++;
        mensaje.textContent += " — VÍCTOR GANA LA RONDA";
      }

      document.getElementById("score").textContent =
        puntosJugador + " - " + puntosVictor;

      if (
        puntosJugador >= LIMITE_RONDAS ||
        puntosVictor >= LIMITE_RONDAS
      ) {
        finalizarPartida();
      } else {
        botones.forEach(boton => boton.disabled = false);
        dueloEnCurso = false;
      }
    }
  }, 1000);
}

// ==============================
// FINAL DE PARTIDA
// ==============================

function finalizarPartida() {
  partidaTerminada = true;
  dueloEnCurso = false;

  const ganoJugador = puntosJugador >= LIMITE_RONDAS;

  const titulo = ganoJugador
    ? "¡VICTORIA!"
    : "VÍCTOR HA GANADO";

  const descripcion = ganoJugador
    ? "Has conquistado la arena de CLASHIX."
    : "Esta vez VÍCTOR fue superior. ¡Inténtalo de nuevo!";

  if (ganoJugador) {
    experienciaJugador += RECOMPENSA_XP;
    localStorage.setItem("clashixXP", experienciaJugador);
    actualizarXP();
  }

  const pantalla = document.createElement("div");
  pantalla.id = "matchResult";

  pantalla.style.cssText = `
    position:fixed;
    inset:0;
    z-index:9999;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(5,8,22,0.94);
    padding:20px;
  `;

  const tarjeta = document.createElement("div");

  tarjeta.style.cssText = `
    max-width:420px;
    width:100%;
    padding:30px 20px;
    text-align:center;
    border:1px solid #7555db;
    border-radius:20px;
    background:linear-gradient(145deg,#15172e,#24204a);
    color:white;
    font-family:Arial,sans-serif;
    box-shadow:0 0 30px rgba(100,70,220,0.3);
  `;

  const encabezado = document.createElement("h1");
  encabezado.textContent = ganoJugador ? "🏆 " + titulo : "⚔️ " + titulo;
  encabezado.style.color = ganoJugador ? "#d9c16b" : "#c4b5fd";
  encabezado.style.fontSize = "28px";
  encabezado.style.margin = "0 0 15px";
  encabezado.style.letterSpacing = "2px";

  const texto = document.createElement("p");
  texto.textContent = descripcion;

  const marcador = document.createElement("h2");
  marcador.textContent = puntosJugador + " - " + puntosVictor;

  const recompensa = document.createElement("h2");
  recompensa.textContent = ganoJugador
    ? "⭐ +" + RECOMPENSA_XP + " XP"
    : "⭐ Sin recompensa esta vez";

  recompensa.style.color = "#d9c16b";

  const boton = document.createElement("button");
  boton.textContent = "JUGAR DE NUEVO";
  boton.style.cssText = `
    margin-top:15px;
    padding:13px 24px;
    border:0;
    border-radius:10px;
    background:linear-gradient(90deg,#3978ff,#8954e8);
    color:white;
    font-weight:bold;
    cursor:pointer;
  `;

  boton.addEventListener("click", iniciarNuevaPartida);

  tarjeta.append(encabezado, texto, marcador, recompensa, boton);
  pantalla.appendChild(tarjeta);
  document.body.appendChild(pantalla);
}

// ==============================
// FOTO DEL JUGADOR
// ==============================

const profilePhoto = document.getElementById("profilePhoto");
const profilePreview = document.getElementById("profilePreview");
const profilePlaceholder = document.getElementById("profilePlaceholder");

profilePhoto.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Selecciona una imagen válida.");
    return;
  }

  if (selectedPhoto) {
    URL.revokeObjectURL(selectedPhoto);
  }

  selectedPhoto = URL.createObjectURL(file);

  profilePreview.src = selectedPhoto;
  profilePreview.style.display = "block";
  profilePlaceholder.style.display = "none";
});

// ==============================
// IMAGEN DE VÍCTOR
// ==============================

const victorImage = document.getElementById("victorImage");
const victorPhoto = document.getElementById("victorPhoto");
const victorPlaceholder = document.getElementById("victorPlaceholder");

victorImage.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Selecciona una imagen válida.");
    return;
  }

  victorPhoto.src = URL.createObjectURL(file);
  victorPhoto.style.display = "block";
  victorPlaceholder.style.display = "none";
});

// ==============================
// INICIO DE MÚSICA
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  reproducirMusica("menu");
});
