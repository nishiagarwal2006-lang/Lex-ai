import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// 3D Tilt effect — applied to all .tilt-card elements after render
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    if (card._tiltBound) return;
    card._tiltBound = true;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform =
        `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform =
        'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

// Re-run periodically to catch dynamically rendered tilt cards
const observer = new MutationObserver(() => initTiltCards());
observer.observe(document.body, { childList: true, subtree: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
