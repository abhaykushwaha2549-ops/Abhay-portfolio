// Import styles for Vite bundling
import './styles/theme.css';
import './styles/main.css';
import './styles/components.css';

// Import interaction modules
import { initBackgroundParticles } from './modules/particles.js';
import { initLandingSequence } from './modules/landing.js';
import { initNavigation } from './modules/navigation.js';
import { initHeroHologram } from './modules/hero.js';
import { initTimeline } from './modules/timeline.js';
import { initProjects } from './modules/projects.js';
import { initAICore } from './modules/core.js';
import { initMotherboard } from './modules/motherboard.js';
import { initAchievements } from './modules/achievements.js';
import { initAIAssistant } from './modules/assistant.js';
import { initEasterEggs } from './modules/easter-eggs.js';
import { initAdminPanel } from './modules/admin.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize background canvas particles (displays behind the landing overlay immediately)
  initBackgroundParticles();

  // Reference for Lenis
  const lenisRef = { current: null };

  // 2. Trigger the cinematic text-reveal entrance sequence
  initLandingSequence(() => {
    // 3. Callback executes once intro reveal finishes: activate all features
    
    // Smooth scrolling & HUD navigation
    initNavigation(lenisRef);
    
    // Holographic tilt card
    initHeroHologram();
    
    // Timeline details drawer overlay
    initTimeline();
    
    // Project demos
    initProjects();
    
    // 3D Canvas rotating skills AI Core
    initAICore();
    
    // Tech Stack silicon motherboard chips
    initMotherboard();
    
    // Holographic credentials badges
    initAchievements();
    
    // Terminal AI assistant chat bot
    initAIAssistant();
    
    // Hidden keys easter eggs (Konami code, AI, Drone, LightInMotion)
    initEasterEggs();

    // Lab Admin Panel CMS
    initAdminPanel();
  });
});

