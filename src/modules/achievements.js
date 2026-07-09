export function initAchievements() {
  const cards = document.querySelectorAll('.achievement-card');
  if (!cards.length) return;

  const credentials = {
    microsoft: {
      desc: 'Recognitions and accolades in Microsoft developer events, focusing on cloud services and system automation solutions.'
    },
    linkedin: {
      desc: 'Top score skills validations across technical areas: C++, Python, JavaScript, and Object-Oriented Programming principles.'
    },
    hackathon: {
      desc: 'First place achievements in regional hackathons for developing hardware-integrated emergency IoT systems and robotic prototypes.'
    },
    workshops: {
      desc: 'Conducted expert presentations on embedded programming, ESP32 networking, and beginner hardware prototyping workshops.'
    }
  };

  cards.forEach(card => {
    const inner = card.querySelector('.achievement-card-inner');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = -(y - centerY) / 8;
      const rotateY = (x - centerX) / 8;
      
      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      inner.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0)';
    });

    card.addEventListener('mouseenter', () => {
      inner.style.transition = 'none';
    });

    // Expand details on click
    card.addEventListener('click', () => {
      const awardKey = card.getAttribute('data-award');
      const details = credentials[awardKey];
      if (details) {
        alert(`${card.querySelector('.achievement-title').textContent}\n\nValidation Info: ${details.desc}`);
      }
    });

  });
}
