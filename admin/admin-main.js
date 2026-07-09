// admin/admin-main.js
// Standalone CMS management module. Stores updates into localStorage.

document.addEventListener('DOMContentLoaded', () => {
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

  // AI inputs
  const keyGeminiField = document.getElementById('admin-key-gemini');
  const aiPersonaField = document.getElementById('admin-ai-persona');
  const voiceEngineSelect = document.getElementById('admin-voice-engine-select');
  const configEleven = document.getElementById('admin-config-elevenlabs');
  const configLocal = document.getElementById('admin-config-local-xtts');
  const localTtsUrlField = document.getElementById('admin-local-tts-url');
  const keyElevenField = document.getElementById('admin-key-eleven');
  const voiceElevenField = document.getElementById('admin-voice-eleven');

  // Audio elements
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

  let currentProjectUploads = [];

  const defaultPersona = `You are Abhay Kushwaha, a full-stack engineer, hardware developer, and AI builder studying Computer Science at Chandigarh University. Fuses C++ microcontroller controls (ESP32/ESP8266) with Python LLM orchestration agents. Founded LightInMotion (smart ambient sync LEDs) and co-founded Scrims Nation. Speak exactly as Abhay. Be concise, tech-focused, and friendly.`;

  // Verify passcode
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

  // Tab switching
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

  // Handle dropdown engine switch
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

  // Load project values from localStorage
  projectSelect.addEventListener('change', loadCurrentProjectData);

  function loadCurrentProjectData() {
    const projId = projectSelect.value;
    
    // Load local storage values if they exist, or set defaults empty
    projTitleField.value = localStorage.getItem(`cms_${projId}_title`) || getProjDefaultTitle(projId);
    projRoleField.value = localStorage.getItem(`cms_${projId}_role`) || getProjDefaultRole(projId);
    projDescField.value = localStorage.getItem(`cms_${projId}_desc`) || getProjDefaultDesc(projId);
    projWebField.value = localStorage.getItem(`cms_${projId}_web`) || '';

    previewBox.innerHTML = '';
    
    // Load slides if uploaded in localStorage
    const savedSlides = localStorage.getItem(`cms_${projId}_slides`);
    if (savedSlides) {
      currentProjectUploads = JSON.parse(savedSlides);
      currentProjectUploads.forEach(slide => addPreviewCard(slide));
    } else {
      currentProjectUploads = [];
    }
  }

  function getProjDefaultTitle(id) {
    if (id === 'proj-lightinmotion') return 'LightInMotion';
    if (id === 'proj-scrimsnation') return 'Scrims Nation';
    if (id === 'proj-drone') return 'AI Surveillance Drone';
    if (id === 'proj-robothand') return 'Kinetic Robotic Hand';
    return 'Smart Home Automation';
  }

  function getProjDefaultRole(id) {
    if (id === 'proj-lightinmotion') return 'Founder & Hardware Dev';
    if (id === 'proj-scrimsnation') return 'Co-Founder & Full-Stack Dev';
    if (id === 'proj-drone') return 'Autonomous Flight Dev';
    if (id === 'proj-robothand') return 'IoT Mechatronics Builder';
    return 'IoT Systems Integrator';
  }

  function getProjDefaultDesc(id) {
    if (id === 'proj-lightinmotion') return 'Custom ESP32 microcontrollers with real-time video screen sync.';
    if (id === 'proj-scrimsnation') return 'Automated esports tournament matching engine using React and Firebase.';
    if (id === 'proj-drone') return 'Flight PID stability algorithms running on ESP32 mechatronics.';
    if (id === 'proj-robothand') return 'Multi-DOF servo joint gloves with noise-filtering telemetry.';
    return 'ESP32/ESP8266 controller hubs with local WLED integration.';
  }

  function loadAIData() {
    keyGeminiField.value = localStorage.getItem('gemini_api_key') || '';
    aiPersonaField.value = localStorage.getItem('gemini_system_instructions') || defaultPersona;
    
    const activeEngine = localStorage.getItem('active_voice_engine') || 'browser';
    voiceEngineSelect.value = activeEngine;
    toggleVoiceConfigInputs();

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

  // --- Slide Files Upload --
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

  // --- Audio Uploads --
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

  // Save changes
  saveBtn.addEventListener('click', () => {
    const projId = projectSelect.value;
    
    // Save CMS fields to localStorage
    localStorage.setItem(`cms_${projId}_title`, projTitleField.value.trim());
    localStorage.setItem(`cms_${projId}_role`, projRoleField.value.trim());
    localStorage.setItem(`cms_${projId}_desc`, projDescField.value.trim());
    localStorage.setItem(`cms_${projId}_web`, projWebField.value.trim());
    localStorage.setItem(`cms_${projId}_slides`, JSON.stringify(currentProjectUploads));

    // Save AI configs
    localStorage.setItem('gemini_api_key', keyGeminiField.value.trim());
    localStorage.setItem('gemini_system_instructions', aiPersonaField.value.trim());
    localStorage.setItem('active_voice_engine', voiceEngineSelect.value);
    localStorage.setItem('elevenlabs_api_key', keyElevenField.value.trim());
    localStorage.setItem('elevenlabs_voice_id', voiceElevenField.value.trim());
    localStorage.setItem('local_tts_url', localTtsUrlField.value.trim());
    
    // Save audios
    Object.keys(audioPickers).forEach(key => {
      const config = audioPickers[key];
      if (config.value) {
        localStorage.setItem(config.storageKey, config.value);
      }
    });

    alert('System settings committed successfully. Changes written to shared storage cache.');
  });

  logoutBtn.addEventListener('click', () => {
    authView.style.display = 'block';
    dashboardView.style.display = 'none';
    passcodeField.value = '';
  });
});
