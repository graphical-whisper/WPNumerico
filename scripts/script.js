// Get DOM elements
const cards = document.querySelectorAll('.card');
const popup = document.getElementById('popup');
const popupImg = document.getElementById('popup-img');
const popupTitle = document.getElementById('popup-title');
const popupDescription = document.getElementById('popup-description');
const playBtn = document.getElementById('play-btn');
const closeBtn = document.getElementById('close-btn');
/*
// Elementos de votación dinámicos
const voteBtn = document.createElement('button');
voteBtn.id = 'vote-btn';
voteBtn.textContent = '¡Votar por este juego!';
const voteMessage = document.createElement('p');
voteMessage.className = 'vote-message';

// Añadir elementos al popup
document.querySelector('.popup-content').appendChild(voteBtn);
document.querySelector('.popup-content').appendChild(voteMessage);
*/
// Descriptions for each card
const descriptions = {
  1: "Se juega utilizando las teclas de adelante, izquierda, derecha del teclado. Con la tecla adelante se desplaza, con la izquierda y derecha se mueve el vehículo a los lados. La intención es superar los carros en medio de los distintos entornos.",
  2: "Se juega utilizando las teclas de adelante, izquierda, derecha del teclado. Con la tecla adelante se desplaza, con la izquierda y derecha se mueve el vehículo a los lados. La intención es superar los carros en medio de los distintos entornos.",
  3: "El jugador debe lanzar un proyectil (un pájaro) para impactar un objetivo. Se puede apuntar de dos formas:\nModo Manual: arrastrando el mouse estilo Angry Birds.\nModo Automático: el juego calcula el ángulo óptimo usando el método de la secante.\nEl jugador ajusta la fuerza arrastrando el mouse hacia atrás.\nSi el pájaro impacta el objetivo, se avanza al siguiente nivel.\nHay niveles con objetivos móviles y obstáculos que se deben evitar.",
  4: "Este es un marcador de posición para la descripción del juego 4. Asegúrate de actualizarlo con detalles del juego.",
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

/*
async function registerVote(gameId) {
  try {
    const voterKey = getVoterKey();
    const res = await fetch('/.netlify/functions/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, voterKey })
    });

    if (res.status === 200) {
      // El voto se registró correctamente
      localStorage.setItem(`voted-${gameId}`, 'true');
      return true;
    }
    // En caso de 409 u otro código
    console.warn('Respuesta inesperada al votar:', res.status);
    return false;
  } catch (err) {
    console.error('Error en registerVote:', err);
    return false;
  }
}
*/

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
/*
    // Configurar sistema de votación
    const hasVoted = localStorage.getItem(`voted-${id}`);
    voteBtn.disabled = hasVoted;
    voteMessage.textContent = hasVoted ? "Ya votaste por este juego" : "";

    // Manejador de votación
    voteBtn.onclick = async () => {
      voteBtn.disabled = true;
      const success = await registerVote(id);
      
      if (success) {
        voteMessage.textContent = "✅ ¡Voto registrado!";
        voteBtn.disabled = true;
      } else {
        voteMessage.textContent = "❌ Error al votar, intenta nuevamente";
        voteBtn.disabled = false;
      }
    };
*/
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