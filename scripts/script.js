// Get DOM elements
const cards = document.querySelectorAll('.card');
const popup = document.getElementById('popup');
const popupImg = document.getElementById('popup-img');
const popupTitle = document.getElementById('popup-title');
const popupDescription = document.getElementById('popup-description');
const playBtn = document.getElementById('play-btn');
const closeBtn = document.getElementById('close-btn');

// Descriptions for each card
const descriptions = {
  1: "El jugador tiene visitar planetas para evaluar el terreno y las condiciones del ambiente en cada planeta y poder definir si es apto para ser habitable o por el  contrario no tiene las condiciones para ser habitado, el jugador se puede mover con las letras A y D, T para terraformar y Q para salir.",
  2: "Se juega utilizando las teclas de adelante, izquierda, derecha del teclado. Con la tecla adelante se desplaza, con la izquierda y derecha se mueve el vehículo a los lados. La intención es superar los carros en medio de los distintos entornos.",
  3: "El jugador debe lanzar un proyectil (un pájaro) para impactar un objetivo. Se puede apuntar de dos formas:\nModo Manual: arrastrando el mouse estilo Angry Birds.\nModo Automático: el juego calcula el ángulo óptimo usando el método de la secante.\nEl jugador ajusta la fuerza arrastrando el mouse hacia atrás.\nSi el pájaro impacta el objetivo, se avanza al siguiente nivel.\nHay niveles con objetivos móviles y obstáculos que se deben evitar.",
  4: "El jugador controla un pájaro que debe pasar entre tuberías en movimiento sin chocar. Cada vez que pasa entre dos tuberías gana un punto. El reto es sobrevivir controlando el vuelo contra la gravedad. El juego termina si el pájaro choca con una tubería o el suelo. El objetivo es conseguir la mayor cantidad de puntos posible.",
  5: "Este es un marcador de posición para la descripción del juego 5. Asegúrate de actualizarlo con detalles del juego.",
};

function getVoterKey() {
  let key = localStorage.getItem('voterKey');
  if (!key) {
    // Usa el API nativo para generar un UUID
    key = crypto.randomUUID();
    localStorage.setItem('voterKey', key);
  }
  return key;
}

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const imgSrc = card.querySelector('img').src;
    const title = card.querySelector('h3').textContent;
    const id = card.dataset.id;
    const folderName = card.dataset.folder;
    const description = descriptions[id];

    // Actualizar contenido del popup
    popupImg.src = imgSrc;
    popupTitle.textContent = title;
    popupDescription.textContent = description;
    playBtn.href = `https://webpageanalisisnumerico.netlify.app/${folderName}/`;

    popup.style.display = 'flex';
  });
});

// Cerrar popup
closeBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === popup) {
    popup.style.display = 'none';
  }
});