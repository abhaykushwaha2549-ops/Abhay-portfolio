export function initEasterEggs() {
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiIndex = 0;
  let keyBuffer = '';
  
  // Developer Mode Canvas elements
  const devOverlay = document.getElementById('dev-mode-overlay');
  const devCanvas = document.getElementById('dev-mode-canvas');
  let matrixInterval = null;

  window.addEventListener('keydown', (e) => {
    // 1. Konami Code detection
    const requiredKey = konamiCode[konamiIndex];
    if (e.key.toLowerCase() === requiredKey.toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        activateDeveloperMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }

    // 2. Keyword Buffer detection
    keyBuffer += e.key.toUpperCase();
    if (keyBuffer.length > 25) {
      keyBuffer = keyBuffer.slice(-25);
    }

    if (keyBuffer.endsWith('LIGHTINMOTION')) {
      triggerRGBFlash();
      keyBuffer = '';
    } else if (keyBuffer.endsWith('DRONE')) {
      spawnDroneOverlay();
      keyBuffer = '';
    } else if (keyBuffer.endsWith('AI')) {
      const assistant = document.getElementById('ai-assistant-chat');
      if (assistant) assistant.classList.add('active');
      keyBuffer = '';
    }

    // Deactivate Dev Mode on Escape or typing EXIT
    if (e.key === 'Escape' && devOverlay.classList.contains('active')) {
      deactivateDeveloperMode();
    }
  });

  // Matrix Digital Rain
  function activateDeveloperMode() {
    devOverlay.classList.add('active');
    const ctx = devCanvas.getContext('2d');
    
    let width = (devCanvas.width = window.innerWidth);
    let height = (devCanvas.height = window.innerHeight);
    
    const columns = Math.floor(width / 14);
    const yPositions = Array(columns).fill(0);
    
    matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#0f0';
      ctx.font = '12px monospace';
      
      yPositions.forEach((y, index) => {
        const char = String.fromCharCode(Math.floor(Math.random() * 96) + 33);
        const x = index * 14;
        ctx.fillText(char, x, y);
        
        if (y > 100 + Math.random() * 10000) {
          yPositions[index] = 0;
        } else {
          yPositions[index] = y + 12;
        }
      });
    }, 33);
  }

  function deactivateDeveloperMode() {
    devOverlay.classList.remove('active');
    if (matrixInterval) {
      clearInterval(matrixInterval);
      matrixInterval = null;
    }
  }

  // Flash / cycle accent RGB themes
  function triggerRGBFlash() {
    let tick = 0;
    const interval = setInterval(() => {
      const colors = ['#06b6d4', '#d946ef', '#8b5cf6', '#3b82f6', '#f59e0b'];
      const chosenColor = colors[tick % colors.length];
      document.documentElement.style.setProperty('--accent-cyan', chosenColor);
      document.documentElement.style.setProperty('--accent-blue', chosenColor);
      tick++;
      if (tick > 15) {
        clearInterval(interval);
        // Reset defaults
        document.documentElement.style.setProperty('--accent-cyan', '#06b6d4');
        document.documentElement.style.setProperty('--accent-blue', '#3b82f6');
      }
    }, 150);
  }

  // Drone Spawn animation
  function spawnDroneOverlay() {
    const drone = document.createElement('div');
    drone.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" style="filter: drop-shadow(0 0 8px #06b6d4);">
        <path d="M12 2v20M2 12h20"></path>
        <circle cx="12" cy="12" r="3" fill="#06b6d4"></circle>
        <path d="M4 4l16 16M4 20L20 4"></path>
      </svg>
    `;
    drone.style.position = 'fixed';
    drone.style.zIndex = '9998';
    drone.style.pointerEvents = 'none';
    drone.style.transition = 'transform 0.1s ease-out';
    document.body.appendChild(drone);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let droneX = mouseX;
    let droneY = mouseY;

    const followMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', followMouse);

    const animLoop = () => {
      // Lag tracking effect
      droneX += (mouseX - droneX - 20) * 0.08;
      droneY += (mouseY - droneY - 20) * 0.08;
      drone.style.transform = `translate3d(${droneX}px, ${droneY}px, 0)`;
      
      if (document.body.contains(drone)) {
        requestAnimationFrame(animLoop);
      }
    };
    animLoop();

    // Self-destruct drone after 10 seconds
    setTimeout(() => {
      window.removeEventListener('mousemove', followMouse);
      if (document.body.contains(drone)) {
        drone.remove();
      }
    }, 10000);
  }
}
