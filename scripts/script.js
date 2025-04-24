// Get DOM elements
const cards = document.querySelectorAll('.card');
const popup = document.getElementById('popup');
const popupImg = document.getElementById('popup-img');
const popupTitle = document.getElementById('popup-title');
const popupDescription = document.getElementById('popup-description');
const playBtn = document.getElementById('play-btn');
const closeBtn = document.getElementById('close-btn');

// Elementos de votación dinámicos
const voteBtn = document.createElement('button');
voteBtn.id = 'vote-btn';
voteBtn.textContent = '¡Votar por este juego!';
const voteMessage = document.createElement('p');
voteMessage.className = 'vote-message';

// Añadir elementos al popup
document.querySelector('.popup-content').appendChild(voteBtn);
document.querySelector('.popup-content').appendChild(voteMessage);

// Descriptions for each card
const descriptions = {
  1: "Se juega utilizando las teclas de adelante, izquierda, derecha del teclado. Con la tecla adelante se desplaza, con la izquierda y derecha se mueve el vehículo a los lados. La intención es superar los carros en medio de los distintos entornos.",
  2: "Se juega utilizando las teclas de adelante, izquierda, derecha del teclado. Con la tecla adelante se desplaza, con la izquierda y derecha se mueve el vehículo a los lados. La intención es superar los carros en medio de los distintos entornos.",
  3: "Acá irá la descripción del juego 3.",
  4: "Acá irá la descripción del juego 4.",
  5: "Acá irá la descripción del juego 5.",
};

// Función para registrar votos
async function registerVote(gameId) {
  try {
    // Simular envío a servidor (reemplazar con tu endpoint real)
    const fakeAPI = await new Promise(resolve => 
      setTimeout(() => resolve({ status: 200 }), 500)
    );

    if (fakeAPI.status === 200) {
      localStorage.setItem(`voted-${gameId}`, 'true');
      return true;
    }
  } catch (error) {
    console.error('Error voting:', error);
    return false;
  }
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