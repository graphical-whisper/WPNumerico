// Get DOM elements
const cards = document.querySelectorAll('.card');
const popup = document.getElementById('popup');
const popupImg = document.getElementById('popup-img');
const popupTitle = document.getElementById('popup-title');
const popupDescription = document.getElementById('popup-description');
const playBtn = document.getElementById('play-btn');
const closeBtn = document.getElementById('close-btn');

// Modifica el objeto descriptions en tu script.js
const descriptions = {
  1: {
      howToPlay: "El jugador debe visitar planetas para evaluar el terreno y las condiciones del ambiente. Controles: A y D para moverse, T para terraformar, Q para salir.",
      method: "Método de Newton-Raphson",
      implementation: `Cuando el jugador terraforma (T), el juego itera la función F y su derivada F' usando la posición actual. Si |F(x)| < 10⁻⁷, se encuentra la raíz permitiendo la terraformación. Fórmula: 
      xₙ₊₁ = xₙ - F(xₙ)/F'(xₙ)`
  },
  2: {
      howToPlay: "Controles: teclas de dirección (↑ para acelerar, ← → para mover). Objetivo: esquivar vehículos en diferentes entornos manteniendo alta velocidad.",
      method: "Derivada Regresiva",
      implementation: `Cálculo en tiempo real de velocidad (v = Δx/Δt) y aceleración (a = Δv/Δt) usando diferencias hacia atrás. Actualiza cada frame:
      aₜ = (vₜ - vₜ₋₁)/Δt
      vₜ = (xₜ - xₜ₋₁)/Δt`
  },
  3: {
      howToPlay: "Lanzar pájaro con: Click y arrastre (modo manual) o cálculo automático con método numérico. Objetivo: impactar blancos móviles.",
      method: "Método de la Secante",
      implementation: `Resuelve θ en la ecuación de trayectoria:
      f(θ) = x tanθ - (gx²)/(2v²cos²θ) - y = 0
      Iteración: θₙ₊₁ = θₙ - f(θₙ)(θₙ - θₙ₋₁)/(f(θₙ) - f(θₙ₋₁))`
  },
  4: {
      howToPlay: "Controles: click/espacio para impulsar al pájaro. Esquivar tuberías y ganar puntos pasando entre ellas.",
      method: "Interpolación de Euler",
      implementation: `Actualización de posición y velocidad cada frame:
      vₜ₊₁ = vₜ + gΔt + impulso
      yₜ₊₁ = yₜ + vₜΔt
      donde g = 9.8 m/s² y Δt = tiempo entre frames`
  }
};

// Actualiza el manejador de clics de las tarjetas
// Modifica el manejador de clics de las tarjetas
cards.forEach((card) => {
  card.addEventListener('click', () => {
      const imgSrc = card.querySelector('img').src; // Obtener src de la imagen de la tarjeta
      const title = card.querySelector('h3').textContent;
      const id = card.dataset.id;
      const folderName = card.dataset.folder;
      const gameInfo = descriptions[id];

      // Actualizar contenido del popup
      popupImg.src = imgSrc; // Usar la misma imagen de la tarjeta
      popupTitle.textContent = title;
      document.getElementById('popup-howtoplay').textContent = gameInfo.howToPlay;
      document.getElementById('popup-method').textContent = gameInfo.method;
      document.getElementById('popup-implementation').textContent = gameInfo.implementation;
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