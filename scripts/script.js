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
  1: "Acá irá la descripción del juego 1.",
  2: "Acá irá la descripción del juego 2.",
  3: "Acá irá la descripción del juego 3.",
  4: "Acá irá la descripción del juego 4.",
  5: "Acá irá la descripción del juego 5.",
};


cards.forEach((card) => {
  card.addEventListener('click', () => {
    const imgSrc = card.querySelector('img').src;
    const title = card.querySelector('h3').textContent;
    const id = card.dataset.id;
    const folderName = card.dataset.folder; // Nuevo atributo
    const description = descriptions[id];
  
    popupImg.src = imgSrc;
    popupTitle.textContent = title;
    popupDescription.textContent = description;
    playBtn.href = `https://webpageanalisisnumerico.netlify.app/${folderName}/`;
    
    popup.style.display = 'flex';
  });
});

// Close popup
closeBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});

// Close popup when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === popup) {
    popup.style.display = 'none';
  }
});