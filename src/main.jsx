import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

/**
 * 3D tilt effect — progressively enhanced for cards with class `.tilt-card`.
 * Attached once per card via MutationObserver; skipped if already bound.
 */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    if (card._tiltBound) return;
    card._tiltBound = true;

    card.addEventListener('mousemove', (e) => {
      const rect    = card.getBoundingClientRect();
      const rotateX = (((e.clientY - rect.top)  / rect.height) - 0.5) * -16;
      const rotateY = (((e.clientX - rect.left) / rect.width)  - 0.5) *  16;
      card.style.transform =
        `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform =
        'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

// Attach tilt listeners to any dynamically rendered cards
const tiltObserver = new MutationObserver(initTiltCards);
tiltObserver.observe(document.body, { childList: true, subtree: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
