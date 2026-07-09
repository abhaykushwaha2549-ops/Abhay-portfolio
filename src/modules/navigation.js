import Lenis from 'lenis';

export function initNavigation(lenisRef) {
  const navbar = document.getElementById('hud-navbar');
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let navbarShown = false;

  // Initialize smooth scroll behavior using Lenis
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical'
  });

  // Export Lenis loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  
  if (lenisRef) {
    lenisRef.current = lenis;
  }

  // Scroll event listeners
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Show navbar only after scrolling down 150px
    if (currentScrollY > 150) {
      if (!navbarShown) {
        navbar.style.transform = 'translate(-50%, 0)';
        navbarShown = true;
      }
    } else {
      if (navbarShown) {
        navbar.style.transform = 'translate(-50%, -100px)';
        navbarShown = false;
      }
    }
    
    // Highlight links based on scroll section
    highlightLinks();
    lastScrollY = currentScrollY;
  });

  // Setup click listeners for HUD links to smooth scroll
  const links = document.querySelectorAll('.hud-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        lenis.scrollTo(targetElement, { offset: -40 });
      }
    });
  });

  function highlightLinks() {
    const scrollPos = window.scrollY + 200;
    const sections = document.querySelectorAll('section');
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        links.forEach(l => {
          l.classList.remove('active');
          if (l.getAttribute('href') === `#${id}`) {
            l.style.color = 'var(--text-primary)';
            l.style.textShadow = '0 0 10px var(--accent-blue)';
          } else {
            l.style.color = '';
            l.style.textShadow = '';
          }
        });
      }
    });
  }
}
