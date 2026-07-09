export function initAICore() {
  const canvas = document.getElementById('core-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  window.addEventListener('resize', () => {
    if (!canvas.offsetWidth) return;
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  const skills = [
    'AI', 'Python', 'ESP32', 'Arduino',
    'React', 'Electron', 'Flutter', 'Firebase',
    'NodeJS', 'ML', 'Vision', 'WLED',
    'SignalRGB', 'PCB Design', 'Fusion360', 'Blender',
    'Shopify'
  ];

  // 3D Particles
  const particles = [];
  const particleCount = 80;
  const sphereRadius = 100;

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.acos(Math.random() * 2 - 1);
    const phi = Math.random() * Math.PI * 2;
    
    particles.push({
      x: sphereRadius * Math.sin(theta) * Math.cos(phi),
      y: sphereRadius * Math.sin(theta) * Math.sin(phi),
      z: sphereRadius * Math.cos(theta),
      baseRadius: 1.5
    });
  }

  // Skill labels orbiting
  const skillNodes = skills.map((name, idx) => {
    const phi = Math.acos(-1 + (2 * idx) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    const r = 160; // Orbit radius
    
    return {
      name,
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
      hovered: false
    };
  });

  let angleX = 0.005;
  let angleY = 0.005;
  
  // Track mouse movements to rotate core
  let mouse = { x: 0, y: 0 };
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left - width / 2;
    mouse.y = e.clientY - rect.top - height / 2;
    
    angleY = mouse.x * 0.00005;
    angleX = -mouse.y * 0.00005;
  });

  canvas.addEventListener('mouseleave', () => {
    angleX = 0.005;
    angleY = 0.005;
  });

  function rotateX(node, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const y1 = node.y * cos - node.z * sin;
    const z1 = node.z * cos + node.y * sin;
    node.y = y1;
    node.z = z1;
  }

  function rotateY(node, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x1 = node.x * cos - node.z * sin;
    const z1 = node.z * cos + node.x * sin;
    node.x = x1;
    node.z = z1;
  }

  const perspective = 300;

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Center coordinates
    const cx = width / 2;
    const cy = height / 2;

    // Sort nodes by Z value (depth testing)
    const allDrawables = [
      ...particles.map(p => ({ ...p, type: 'particle' })),
      ...skillNodes.map(s => ({ ...s, type: 'skill' }))
    ];

    allDrawables.forEach(node => {
      rotateX(node, angleX);
      rotateY(node, angleY);
    });

    // Update coordinates back to original arrays
    allDrawables.forEach((node, i) => {
      if (node.type === 'particle') {
        particles[i].x = node.x;
        particles[i].y = node.y;
        particles[i].z = node.z;
      } else {
        const idx = i - particles.length;
        skillNodes[idx].x = node.x;
        skillNodes[idx].y = node.y;
        skillNodes[idx].z = node.z;
      }
    });

    // Sort back-to-front
    allDrawables.sort((a, b) => b.z - a.z);

    // Core central glowing energy ball (White/silver glow)
    ctx.beginPath();
    const radGrd = ctx.createRadialGradient(cx, cy, 5, cx, cy, sphereRadius * 0.9);
    radGrd.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    radGrd.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
    radGrd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radGrd;
    ctx.arc(cx, cy, sphereRadius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Render nodes
    allDrawables.forEach(node => {
      const scale = perspective / (perspective + node.z);
      const projX = node.x * scale + cx;
      const projY = node.y * scale + cy;

      if (node.type === 'particle') {
        const opacity = Math.max(0.1, (node.z + sphereRadius) / (sphereRadius * 2));
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(projX, projY, node.baseRadius * scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Render skill text tag
        const opacity = Math.max(0.15, (node.z + 180) / 360);
        ctx.font = `600 ${Math.max(10, 12 * scale)}px var(--font-sans)`;
        
        // Highlight active connections
        const isHovered = Math.hypot(mouse.x + cx - projX, mouse.y + cy - projY) < 18;
        
        if (isHovered) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 6;
          
          // Draw connector line to core center
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(projX, projY);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.shadowBlur = 0;
        }

        ctx.textAlign = 'center';
        ctx.fillText(node.name, projX, projY);
        ctx.shadowBlur = 0;
      }
    });

    requestAnimationFrame(draw);
  }

  draw();
}
