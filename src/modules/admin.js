export function initAdminPanel() {
  const trigger = document.getElementById('admin-trigger');
  const overlay = document.getElementById('admin-panel-overlay');
  const closeBtn = document.getElementById('admin-close-btn');
  
  const authView = document.getElementById('admin-auth-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const passcodeField = document.getElementById('admin-passcode');
  const authSubmit = document.getElementById('admin-auth-submit');
  
  // Tab Elements
  const tabCms = document.getElementById('admin-tab-cms');
  const tabAi = document.getElementById('admin-tab-ai');
  const panelCms = document.getElementById('admin-panel-cms-content');
  const panelAi = document.getElementById('admin-panel-ai-content');

  // CMS inputs
  const projectSelect = document.getElementById('admin-project-select');
  const projTitleField = document.getElementById('admin-proj-title');
  const projRoleField = document.getElementById('admin-proj-role');
  const projDescField = document.getElementById('admin-proj-desc');
  const projWebField = document.getElementById('admin-proj-web');
  const dragArea = document.getElementById('admin-drag-drop-zone');
  const filePicker = document.getElementById('admin-file-picker');
  const previewBox = document.getElementById('admin-preview-grid-box');

  // AI inputs - Core API Key and Instructions
  const keyGeminiField = document.getElementById('admin-key-gemini');
  const aiPersonaField = document.getElementById('admin-ai-persona');
  
  // Voice engine switcher elements
  const voiceEngineSelect = document.getElementById('admin-voice-engine-select');
  const configEleven = document.getElementById('admin-config-elevenlabs');
  const configLocal = document.getElementById('admin-config-local-xtts');
  const localTtsUrlField = document.getElementById('admin-local-tts-url');
  const keyElevenField = document.getElementById('admin-key-eleven');
  const voiceElevenField = document.getElementById('admin-voice-eleven');

  // AI inputs - Topic Audio Zones & Elements
  const audioPickers = {
    intro: {
      zone: document.getElementById('admin-drag-audio-zone'),
      input: document.getElementById('admin-audio-picker'),
      label: document.getElementById('admin-audio-filename'),
      storageKey: 'welcome_audio_greeting',
      value: localStorage.getItem('welcome_audio_greeting') || ''
    },
    about: {
      zone: document.getElementById('admin-drag-about-zone'),
      input: document.getElementById('admin-about-picker'),
      label: document.getElementById('admin-about-filename'),
      storageKey: 'voice_audio_about',
      value: localStorage.getItem('voice_audio_about') || ''
    },
    lim: {
      zone: document.getElementById('admin-drag-lim-zone'),
      input: document.getElementById('admin-lim-picker'),
      label: document.getElementById('admin-lim-filename'),
      storageKey: 'voice_audio_lim',
      value: localStorage.getItem('voice_audio_lim') || ''
    },
    hand: {
      zone: document.getElementById('admin-drag-hand-zone'),
      input: document.getElementById('admin-hand-picker'),
      label: document.getElementById('admin-hand-filename'),
      storageKey: 'voice_audio_hand',
      value: localStorage.getItem('voice_audio_hand') || ''
    },
    scrims: {
      zone: document.getElementById('admin-drag-scrims-zone'),
      input: document.getElementById('admin-scrims-picker'),
      label: document.getElementById('admin-scrims-filename'),
      storageKey: 'voice_audio_scrims',
      value: localStorage.getItem('voice_audio_scrims') || ''
    },
    drone: {
      zone: document.getElementById('admin-drag-drone-zone'),
      input: document.getElementById('admin-drone-picker'),
      label: document.getElementById('admin-drone-filename'),
      storageKey: 'voice_audio_drone',
      value: localStorage.getItem('voice_audio_drone') || ''
    }
  };

  const saveBtn = document.getElementById('admin-save-btn');
  const logoutBtn = document.getElementById('admin-logout-btn');

  if (!trigger || !overlay || !closeBtn) return;

  let currentProjectUploads = [];

  const defaultPersona = `You are Abhay Kushwaha, a full-stack engineer, hardware developer, and AI builder studying Computer Science at Chandigarh University. Fuses C++ microcontroller controls (ESP32/ESP8266) with Python LLM orchestration agents (like Ultron AI). Founded LightInMotion (smart ambient sync LEDs) and co-founded Scrims Nation (esports automated matches).
You speak as Abhay Kushwaha. Be helpful, concise, engineering-focused, and friendly. Avoid sounding robotic or like a general AI model. Answer questions about your projects, skills, education, and career paths.`;

  // Toggle admin modal
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    overlay.classList.add('active');
    passcodeField.value = '';
    authView.style.display = 'block';
    dashboardView.style.display = 'none';
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });

  // Verify Auth code
  authSubmit.addEventListener('click', () => {
    if (passcodeField.value.trim() === 'admin') {
      authView.style.display = 'none';
      dashboardView.style.display = 'block';
      
      switchTab('cms');
      loadCurrentProjectData();
      loadAIData();
    } else {
      alert('Security violation: Incorrect Passcode.');
    }
  });

  passcodeField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') authSubmit.click();
  });

  // Tab Switching
  tabCms.addEventListener('click', () => switchTab('cms'));
  tabAi.addEventListener('click', () => switchTab('ai'));

  function switchTab(tab) {
    if (tab === 'cms') {
      tabCms.style.background = '#ffffff';
      tabCms.style.color = '#000000';
      tabAi.style.background = 'transparent';
      tabAi.style.color = '#ffffff';
      panelCms.style.display = 'block';
      panelAi.style.display = 'none';
    } else {
      tabAi.style.background = '#ffffff';
      tabAi.style.color = '#000000';
      tabCms.style.background = 'transparent';
      tabCms.style.color = '#ffffff';
      panelAi.style.display = 'block';
      panelCms.style.display = 'none';
    }
  }

  // Handle Project Change
  projectSelect.addEventListener('change', loadCurrentProjectData);

  function loadCurrentProjectData() {
    const projId = projectSelect.value;
    const projectElement = document.getElementById(projId);
    if (!projectElement) return;

    const titleEl = projectElement.querySelector('.project-title');
    const roleEl = projectElement.querySelector('.project-role');
    const descEl = projectElement.querySelector('.project-desc');
    const webBtn = projectElement.querySelector('.project-links button:first-child');

    projTitleField.value = titleEl ? titleEl.textContent : '';
    projRoleField.value = roleEl ? roleEl.textContent : '';
    projDescField.value = descEl ? descEl.textContent : '';
    projWebField.value = webBtn ? webBtn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || '' : '';
    
    previewBox.innerHTML = '';
    currentProjectUploads = [];
  }

  // Handle Voice Engine dropdown switch
  voiceEngineSelect.addEventListener('change', toggleVoiceConfigInputs);

  function toggleVoiceConfigInputs() {
    const engine = voiceEngineSelect.value;
    if (engine === 'elevenlabs') {
      configEleven.style.display = 'block';
      configLocal.style.display = 'none';
    } else if (engine === 'local-xtts') {
      configEleven.style.display = 'none';
      configLocal.style.display = 'block';
    } else {
      configEleven.style.display = 'none';
      configLocal.style.display = 'none';
    }
  }

  function loadAIData() {
    keyGeminiField.value = localStorage.getItem('gemini_api_key') || '';
    aiPersonaField.value = localStorage.getItem('gemini_system_instructions') || defaultPersona;
    
    // Load Voice Engine select
    const activeEngine = localStorage.getItem('active_voice_engine') || 'browser';
    voiceEngineSelect.value = activeEngine;
    toggleVoiceConfigInputs();

    // Load key credentials
    keyElevenField.value = localStorage.getItem('elevenlabs_api_key') || '';
    voiceElevenField.value = localStorage.getItem('elevenlabs_voice_id') || '';
    localTtsUrlField.value = localStorage.getItem('local_tts_url') || 'http://localhost:5000/tts';

    // Bind file indicators
    Object.keys(audioPickers).forEach(key => {
      const config = audioPickers[key];
      config.value = localStorage.getItem(config.storageKey) || '';
      if (config.value) {
        config.label.textContent = `${key.toUpperCase()} voice clip active`;
        config.label.style.color = 'var(--accent-cyan)';
      } else {
        config.label.textContent = `Select ${key.toUpperCase()} Audio`;
        config.label.style.color = '';
      }
    });
  }

  // --- CMS Slides Upload handlers ---
  dragArea.addEventListener('click', () => filePicker.click());
  dragArea.addEventListener('dragover', (e) => { e.preventDefault(); dragArea.style.borderColor = '#ffffff'; });
  dragArea.addEventListener('dragleave', () => dragArea.style.borderColor = 'var(--border-light)');
  dragArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragArea.style.borderColor = 'var(--border-light)';
    handleFiles(e.dataTransfer.files);
  });
  filePicker.addEventListener('change', () => handleFiles(filePicker.files));

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          type: file.type.startsWith('video') ? 'video' : 'image',
          dataUrl: e.target.result,
          name: file.name
        };
        currentProjectUploads.push(fileData);
        addPreviewCard(fileData);
      };
      reader.readAsDataURL(file);
    });
  }

  function addPreviewCard(fileData) {
    const card = document.createElement('div');
    card.className = 'admin-media-preview-card';
    if (fileData.type === 'video') {
      card.innerHTML = `<video src="${fileData.dataUrl}" muted autoplay loop></video>`;
    } else {
      card.innerHTML = `<img src="${fileData.dataUrl}" />`;
    }
    const removeBtn = document.createElement('button');
    removeBtn.className = 'admin-media-preview-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => {
      card.remove();
      currentProjectUploads = currentProjectUploads.filter(item => item.dataUrl !== fileData.dataUrl);
    };
    card.appendChild(removeBtn);
    previewBox.appendChild(card);
  }

  // --- Register Topic Audio Handlers dynamically ---
  Object.keys(audioPickers).forEach(key => {
    const config = audioPickers[key];
    if (!config.zone || !config.input) return;

    config.zone.addEventListener('click', () => config.input.click());
    config.zone.addEventListener('dragover', (e) => { e.preventDefault(); config.zone.style.borderColor = '#ffffff'; });
    config.zone.addEventListener('dragleave', () => config.zone.style.borderColor = 'var(--border-light)');
    config.zone.addEventListener('drop', (e) => {
      e.preventDefault();
      config.zone.style.borderColor = 'var(--border-light)';
      handleTopicAudio(e.dataTransfer.files[0], key);
    });
    config.input.addEventListener('change', () => handleTopicAudio(config.input.files[0], key));
  });

  function handleTopicAudio(file, key) {
    if (!file || !file.type.startsWith('audio')) {
      alert('File type error: Please drop a valid audio file (.MP3/.WAV)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      audioPickers[key].value = e.target.result;
      audioPickers[key].label.textContent = `Clip: ${file.name}`;
      audioPickers[key].label.style.color = 'var(--accent-cyan)';
    };
    reader.readAsDataURL(file);
  }

  // Save changes to local storage & DOM
  saveBtn.addEventListener('click', () => {
    // 1. Save CMS project changes
    const projId = projectSelect.value;
    const projectElement = document.getElementById(projId);
    if (projectElement) {
      const titleEl = projectElement.querySelector('.project-title');
      const roleEl = projectElement.querySelector('.project-role');
      const descEl = projectElement.querySelector('.project-desc');
      const webBtn = projectElement.querySelector('.project-links button:first-child');

      if (titleEl) titleEl.textContent = projTitleField.value;
      if (roleEl) roleEl.textContent = projRoleField.value;
      if (descEl) descEl.textContent = projDescField.value;
      if (webBtn && projWebField.value) {
        webBtn.setAttribute('onclick', `alert('${projWebField.value}')`);
      }

      if (currentProjectUploads.length > 0) {
        const slidesWrapper = projectElement.querySelector('.slides-wrapper');
        if (slidesWrapper) {
          slidesWrapper.innerHTML = currentProjectUploads.map(upload => `
            <div class="slide-item">
              <div class="slide-placeholder-media">
                ${upload.type === 'video' 
                  ? `<video src="${upload.dataUrl}" controls autoplay muted loop></video>` 
                  : `<img src="${upload.dataUrl}" alt="${upload.name}" />`
                }
              </div>
              <div class="slide-caption">${upload.name.split('.')[0]}</div>
            </div>
          `).join('');

          const container = projectElement.querySelector('.project-slideshow-container');
          if (container && window.rebuildSlideshow) {
            window.rebuildSlideshow(container);
          }
        }
      }
    }

    // 2. Save AI Keys, Prompts, and Voice Engine config
    localStorage.setItem('gemini_api_key', keyGeminiField.value.trim());
    localStorage.setItem('gemini_system_instructions', aiPersonaField.value.trim());
    
    localStorage.setItem('active_voice_engine', voiceEngineSelect.value);
    localStorage.setItem('elevenlabs_api_key', keyElevenField.value.trim());
    localStorage.setItem('elevenlabs_voice_id', voiceElevenField.value.trim());
    localStorage.setItem('local_tts_url', localTtsUrlField.value.trim());
    
    // Save Topic Audios
    Object.keys(audioPickers).forEach(key => {
      const config = audioPickers[key];
      if (config.value) {
        localStorage.setItem(config.storageKey, config.value);
      }
    });

    alert('Security settings written: Lab AI Core and CMS variables updated successfully.');
    overlay.classList.remove('active');
  });

  logoutBtn.addEventListener('click', () => {
    authView.style.display = 'block';
    dashboardView.style.display = 'none';
    passcodeField.value = '';
  });
}
