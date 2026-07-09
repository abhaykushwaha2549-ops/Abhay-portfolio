export function initMotherboard() {
  const chips = document.querySelectorAll('.motherboard-chip');
  const modal = document.getElementById('chip-modal-overlay');
  const modalClose = document.getElementById('chip-modal-close-trigger');
  
  const titlePlaceholder = document.getElementById('chip-title-placeholder');
  const subtitlePlaceholder = document.getElementById('chip-subtitle-placeholder');
  const projectsBox = document.getElementById('chip-projects-box');

  if (!chips.length || !modal || !modalClose) return;

  const techDetails = {
    python: {
      title: 'Python Processor',
      subtitle: 'Artificial Intelligence & OS Automation',
      projects: [
        { title: 'Ultron AI', role: 'Autonomous Conversational Assistant & OS Agent' },
        { title: 'AI Surveillance Drone', role: 'Computer Vision & Target Tracking' }
      ]
    },
    cpp: {
      title: 'C++ Mainframe Core',
      subtitle: 'Embedded Firmware & Robotics Logic',
      projects: [
        { title: 'Robotic Hand', role: 'High-speed Telemetry Joint Mappings' },
        { title: 'AI Surveillance Drone', role: 'PID Control Loop & Sensor Reading' },
        { title: 'Distributed Smart Home', role: 'ESP32 Firmware relays' }
      ]
    },
    esp: {
      title: 'ESP32 / ESP8266 Transceiver',
      subtitle: 'Internet of Things & Wireless Ecosystems',
      projects: [
        { title: 'LightInMotion', role: 'Real-time UDP LED controllers' },
        { title: 'Distributed Smart Home', role: 'Inter-device node relays' },
        { title: 'AI Surveillance Drone', role: 'Onboard flight transceiver' }
      ]
    },
    web: {
      title: 'Full-Stack JavaScript Engine',
      subtitle: 'Cross-platform Apps & Cloud Architectures',
      projects: [
        { title: 'Scrims Nation', role: 'Esports Platform Co-founder & Architect' },
        { title: 'LightInMotion App', role: 'Electron Desktop & TV client sync utility' }
      ]
    }
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const techKey = chip.getAttribute('data-tech');
      const details = techDetails[techKey];
      if (details) {
        titlePlaceholder.textContent = details.title;
        subtitlePlaceholder.textContent = details.subtitle;
        
        projectsBox.innerHTML = details.projects.map(proj => `
          <div class="chip-project-item">
            <span class="chip-proj-title">${proj.title}</span>
            <span class="chip-proj-role">${proj.role}</span>
          </div>
        `).join('');
        
        modal.classList.add('active');
      }
    });
  });

  modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}
