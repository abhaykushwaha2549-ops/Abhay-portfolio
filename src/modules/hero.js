export function initHeroHologram() {
  const card = document.getElementById('hologram-card-element');
  const container = document.querySelector('.hologram-container');
  if (!card || !container) return;

  const inner = card.querySelector('.hologram-inner');
  const outerRing = document.querySelector('.ring-outer');
  const innerRing = document.querySelector('.ring-inner');

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element

    // Calculate rotation angles (-15 to 15 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 10;
    const rotateY = (x - centerX) / 10;

    // Apply 3D tilt transformations to card
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    // Parallax on inner avatar and details
    if (inner) {
      inner.style.transform = `translateZ(45px) translateX(${(x - centerX) * 0.05}px) translateY(${(y - centerY) * 0.05}px)`;
    }

    // Parallax on rings
    if (outerRing && innerRing) {
      outerRing.style.transform = `translateX(${(x - centerX) * 0.08}px) translateY(${(y - centerY) * 0.08}px)`;
      innerRing.style.transform = `translateX(${(x - centerX) * -0.05}px) translateY(${(y - centerY) * -0.05}px)`;
    }
  });

  // Reset card state when mouse leaves
  container.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    
    if (inner) {
      inner.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      inner.style.transform = 'translateZ(50px) translateX(0) translateY(0)';
    }

    if (outerRing && innerRing) {
      outerRing.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      outerRing.style.transform = 'translateX(0) translateY(0)';
      innerRing.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      innerRing.style.transform = 'translateX(0) translateY(0)';
    }
  });

  container.addEventListener('mouseenter', () => {
    card.style.transition = 'none';
    if (inner) inner.style.transition = 'none';
  });
}
