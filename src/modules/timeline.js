import { gsap } from 'gsap';

export function initTimeline() {
  const nodes = document.querySelectorAll('.timeline-node');
  const overlayContainer = document.getElementById('timeline-overlays-container');
  if (!nodes.length || !overlayContainer) return;

  const milestoneData = [
    {
      year: '2025',
      title: 'Smart Home Automation & Core C++',
      body: `
        <p>Initialized engineering path in my first year of college. Fused electrical relays with low-level microcontrollers to automate local home appliances.</p>
        <ul>
          <li>Programmed C++ routines on ESP8266 development boards.</li>
          <li>Set up secure local WiFi networks connecting multiple microchips.</li>
          <li>Established remote toggles using local webservers and analog sensors.</li>
        </ul>
      `
    },
    {
      year: '2026',
      title: 'Kinetic Robotic Hand Fabrications',
      body: `
        <p>Designed and built an anthropomorphic kinetic hand replicating fingers mechanics.</p>
        <ul>
          <li>Constructed CAD mechanical frames modeling biological joints.</li>
          <li>Integrated multi-axis servo actuators mapped to analog flex sensors on glove controllers.</li>
          <li>Programmed signal filters to suppress analog sensor jitter and signal noise.</li>
        </ul>
      `
    },
    {
      year: '2027',
      title: 'AI Surveillance Drone & LightInMotion Brand',
      body: `
        <p>Launched LightInMotion, an online smart ambient lighting brand, while building custom flight stabilization systems.</p>
        <ul>
          <li>Programmed PID control loops executing real-time sensor mapping (MPU6050 Accelerometer/Gyroscope & BMP280 Altitude).</li>
          <li>Created and bootstrapped LightInMotion commercial store and custom controllers running WLED.</li>
          <li>Tested UDP telemetry transmissions streaming system logs to ground relays.</li>
        </ul>
      `
    },
    {
      year: '2028',
      title: 'Ecosystem Engineering & Cross-Platform Apps',
      body: `
        <p>Built out the software ecosystem for LightInMotion, providing instant light syncing across platforms.</p>
        <ul>
          <li>Engineered a high-performance desktop application using Electron to map screen pixels to LEDs.</li>
          <li>Built Android and TV applications for WLED and Hyperion sync hubs.</li>
          <li>Deployed automated update servers validating client signatures for firmware packages.</li>
        </ul>
      `
    },
    {
      year: '2029',
      title: 'Co-Founded Scrims Nation & Agentic Assistant',
      body: `
        <p>Co-founded esports automation portal Scrims Nation and engineered local voice-activated OS agents.</p>
        <ul>
          <li>Co-founded and engineered Scrims Nation to manage tournament flows, skill matchmaking, and prize distributions.</li>
          <li>Built Ultron AI - a voice-activated personal assistant executing local files operations and natural language OS triggers.</li>
          <li>Integrated LLM orchestration tools with system control webhooks.</li>
        </ul>
      `
    },
    {
      year: 'Future',
      title: 'Edge AI, Intelligent Mechatronics & B.Tech CSE',
      body: `
        <p>Scaling robotics control systems using Edge computing neural nets. Completing Bachelor of Technology in Computer Science Engineering (Expected June 2029).</p>
        <ul>
          <li>Researching low-power neural engines running on microcontrollers.</li>
          <li>Building modular robotic arms for precision gesture replication.</li>
          <li>Designing multi-layer PCBs optimizing power distribution grids.</li>
        </ul>
      `
    }
  ];

  // Generate overlay HTML dynamically
  overlayContainer.innerHTML = milestoneData.map((data, idx) => `
    <div class="timeline-overlay" id="timeline-overlay-${idx}">
      <div class="timeline-modal">
        <button class="timeline-modal-close" data-close="${idx}">&times;</button>
        <div class="timeline-modal-year">${data.year}</div>
        <h3 class="timeline-modal-title">${data.title}</h3>
        <div class="timeline-modal-body">${data.body}</div>
      </div>
    </div>
  `).join('');

  // Attach click listeners to nodes
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const idx = node.getAttribute('data-index');
      openOverlay(idx);
    });
  });

  // Attach click listeners to close buttons
  const closeButtons = document.querySelectorAll('.timeline-modal-close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-close');
      closeOverlay(idx);
    });
  });

  // Close overlays on background click
  const overlays = document.querySelectorAll('.timeline-overlay');
  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const id = overlay.getAttribute('id').split('-').pop();
        closeOverlay(id);
      }
    });
  });

  function openOverlay(idx) {
    const overlay = document.getElementById(`timeline-overlay-${idx}`);
    if (!overlay) return;

    // Highlight active timeline node
    nodes.forEach(n => n.classList.remove('active'));
    const node = document.querySelector(`.timeline-node[data-index="${idx}"]`);
    if (node) node.classList.add('active');

    // Show overlay
    overlay.classList.add('active');
    
    // Animate content entrance
    const modal = overlay.querySelector('.timeline-modal');
    gsap.fromTo(modal, 
      { scale: 0.85, y: 30, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
  }

  function closeOverlay(idx) {
    const overlay = document.getElementById(`timeline-overlay-${idx}`);
    if (!overlay) return;

    const modal = overlay.querySelector('.timeline-modal');
    gsap.to(modal, {
      scale: 0.85,
      y: 30,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => {
        overlay.classList.remove('active');
      }
    });
  }
}
