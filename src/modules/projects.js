export function initProjects() {
  const containers = document.querySelectorAll('.project-slideshow-container');
  containers.forEach(container => {
    setupSlideshowForContainer(container);
  });

  // Expose function globally for the Admin Panel
  window.rebuildSlideshow = setupSlideshowForContainer;
}

export function setupSlideshowForContainer(container) {
  const wrapper = container.querySelector('.slides-wrapper');
  const slides = container.querySelectorAll('.slide-item');
  const prevBtn = container.querySelector('.slide-nav-prev');
  const nextBtn = container.querySelector('.slide-nav-next');
  const dotsContainer = container.querySelector('.slide-dots-indicator');
  
  if (!wrapper || !slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  // 1. Generate dots indicators dynamically
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('span');
      dot.className = `slide-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('data-slide-to', i);
      dotsContainer.appendChild(dot);
    }
  }

  const dots = dotsContainer ? dotsContainer.querySelectorAll('.slide-dot') : [];

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    // Translate wrapper
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update active classes on dots
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Reset transforms to first slide
  goToSlide(0);

  // 2. Set up event listeners for navigation buttons (cloning to avoid stacking events on rebuild)
  if (prevBtn) {
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    newPrevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
    });
  }

  if (nextBtn) {
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    newNextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
    });
  }

  // 3. Set up event listeners for dots indicators
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide-to'), 10);
      goToSlide(slideIndex);
    });
  });
}

