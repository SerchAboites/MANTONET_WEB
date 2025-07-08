document.addEventListener('DOMContentLoaded', () => {

  // --- Parte 1: Preparamos el HTML dinámicamente ---
  // Este código se ejecuta una sola vez al cargar la página.
  document.querySelectorAll('.servicio-desplegable').forEach((detail) => {
    // Obtenemos los elementos hijos y el summary
    const children = Array.from(detail.children);
    const summary = detail.querySelector('summary');
    
    // Creamos el div que envolverá el contenido
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('details-content-wrapper');

    // Movemos cada elemento de contenido (p, ul, etc.) dentro del nuevo wrapper
    children.forEach(child => {
      if (child !== summary) {
        contentWrapper.appendChild(child);
      }
    });

    // Añadimos el wrapper con todo el contenido de vuelta al <details>
    detail.appendChild(contentWrapper);
  });


  // --- Parte 2: Lógica de la animación (acordeón) ---
  // Esta es la misma lógica de antes, adaptada a tus clases.
  document.querySelectorAll('.servicio-desplegable').forEach((detail) => {
    const summary = detail.querySelector('summary');

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (detail.dataset.animating) return;

      document.querySelectorAll('.servicio-desplegable[open]').forEach((openDetail) => {
        if (openDetail !== detail) {
          closeDetail(openDetail);
        }
      });

      if (detail.open) {
        closeDetail(detail);
      } else {
        openDetail(detail);
      }
    });
  });

  function openDetail(detail) {
    const content = detail.querySelector('.details-content-wrapper');
    detail.dataset.animating = true;
    detail.open = true;
    content.style.maxHeight = content.scrollHeight + 'px';
    
    content.addEventListener('transitionend', () => {
      delete detail.dataset.animating;
    }, { once: true });
  }

  function closeDetail(detail) {
    const content = detail.querySelector('.details-content-wrapper');
    detail.dataset.animating = true;
    content.style.maxHeight = null;
    
    content.addEventListener('transitionend', () => {
      detail.open = false;
      delete detail.dataset.animating;
    }, { once: true });
  }
});