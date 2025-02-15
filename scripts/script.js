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
  1: "This is the description for item 1.",
  2: "This is the description for item 2.",
  3: "This is the description for item 3.",
  4: "This is the description for item 4.",
};

// Add click event to cards
cards.forEach((card) => {
  card.addEventListener('click', () => {
    const imgSrc = card.querySelector('img').src;
    const title = card.querySelector('h3').textContent;
    const id = card.dataset.id;
    const description = descriptions[id];

    // Update popup content
    popupImg.src = imgSrc;
    popupTitle.textContent = title;
    popupDescription.textContent = description;
    playBtn.href = `https://example.com/play/${id}`; // Replace with your external link

    // Show popup
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