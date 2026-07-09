import { gsap } from 'gsap';

export function initLandingSequence(onComplete) {
  const overlay = document.getElementById('landing-overlay');
  const introLine = document.getElementById('intro-line');
  const introCard = document.getElementById('intro-card');
  const dashboard = document.getElementById('dashboard');

  if (!overlay || !introLine || !introCard || !dashboard) {
    if (onComplete) onComplete();
    return;
  }

  // Create sequence timeline
  const tl = gsap.timeline({
    onComplete: () => {
      // Clean up overlay element
      overlay.style.display = 'none';
      if (onComplete) onComplete();
    }
  });

  // Ensure initial visibility is correct
  gsap.set(dashboard, { opacity: 0, y: 30 });
  gsap.set(introLine, { opacity: 0, scale: 0.95 });
  gsap.set(introCard, { opacity: 0, scale: 0.95 });

  // 1. First statement
  tl.to(introLine, {
    opacity: 1,
    scale: 1,
    duration: 1.6,
    ease: 'power3.out'
  })
  .to(introLine, {
    opacity: 0,
    scale: 1.05,
    duration: 1.2,
    delay: 1.5,
    ease: 'power3.in'
  });

  // 2. Loop through core technical assertions
  const builders = [
    'I build AI.',
    'I build Products.',
    'I build Startups.',
    'I build the Future.'
  ];

  builders.forEach((phrase) => {
    tl.add(() => {
      introLine.textContent = phrase;
    })
    .to(introLine, {
      opacity: 1,
      scale: 1,
      duration: 1.0,
      ease: 'power2.out'
    })
    .to(introLine, {
      opacity: 0,
      scale: 1.02,
      duration: 0.8,
      delay: 1.0,
      ease: 'power2.in'
    });
  });

  // 3. Brand Identity Reveal
  tl.to(introCard, {
    opacity: 1,
    scale: 1,
    duration: 1.8,
    ease: 'power3.out'
  })
  .to(introCard, {
    opacity: 0,
    scale: 1.05,
    duration: 1.2,
    delay: 2.0,
    ease: 'power3.in'
  });

  // 4. Smooth reveal of the dashboard
  tl.to(overlay, {
    clipPath: 'circle(0% at 50% 50%)',
    duration: 1.8,
    ease: 'power4.inOut'
  }, '-=0.5')
  .to(dashboard, {
    opacity: 1,
    y: 0,
    duration: 1.6,
    ease: 'power3.out'
  }, '-=1.2');
}
