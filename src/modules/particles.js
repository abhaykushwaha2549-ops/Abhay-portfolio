export function initBackgroundParticles() {
  const canvas = document.getElementById('grid-circuit-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  // Circuit trace nodes
  const nodes = [];
  const maxNodes = 25;
  for (let i = 0; i < maxNodes; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      connections: [],
      pulse: Math.random() * Math.PI
    });
  }

  // Find nearest nodes to form right-angle grid paths
  nodes.forEach((n, idx) => {
    const sorted = nodes
      .map((other, oIdx) => ({ idx: oIdx, dist: Math.hypot(n.x - other.x, n.y - other.y) }))
      .filter(item => item.idx !== idx)
      .sort((a, b) => a.dist - b.dist);
      
    // Connect to 2 nearest
    for (let c = 0; c < 2; c++) {
      if (sorted[c]) {
        n.connections.push(sorted[c].idx);
      }
    }
  });

  // Grid points
  const gridSpacing = 65;
  
  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;
    
    // 1. Draw subtle background grid dots with mouse parallax warp
    const cols = Math.ceil(width / gridSpacing);
    const rows = Math.ceil(height / gridSpacing);
    
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        let gx = c * gridSpacing;
        let gy = r * gridSpacing;
        
        // Calculate vector from mouse
        const dx = mouse.x - gx;
        const dy = mouse.y - gy;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 220) {
          const factor = (1 - dist / 220) * 10;
          gx -= (dx / dist) * factor;
          gy -= (dy / dist) * factor;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
        }
        
        ctx.beginPath();
        ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Draw circuit traces in silver-white coordinates
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 0.8;
    
    nodes.forEach(n => {
      // Update coordinates
      n.x += n.vx;
      n.y += n.vy;
      
      // Boundary check
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      
      n.pulse += 0.012;
      
      n.connections.forEach(cIdx => {
        const other = nodes[cIdx];
        
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        
        // Right-angle trace logic
        const midX = n.x + (other.x - n.x) / 2;
        ctx.lineTo(midX, n.y);
        ctx.lineTo(midX, other.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
        
        // Dynamic packet pulse traveling along circuits
        const pulseProgress = (Math.sin(n.pulse) + 1) / 2;
        const px = n.x + (other.x - n.x) * pulseProgress;
        const py = n.y + (other.y - n.y) * pulseProgress;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // 3. Draw very subtle silver glows (Auroras)
    const gradient = ctx.createRadialGradient(
      width * 0.5 + (mouse.x - width/2) * 0.02,
      height * 0.5 + (mouse.y - height/2) * 0.02,
      10,
      width * 0.5,
      height * 0.5,
      width * 0.4
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.015)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.003)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, width * 0.55, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(draw);
  }
  
  draw();
}
