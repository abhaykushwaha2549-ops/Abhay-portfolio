export function initAIAssistant() {
  const toggle = document.getElementById('ai-assistant-toggle');
  const chat = document.getElementById('ai-assistant-chat');
  const close = document.getElementById('ai-assistant-close');
  const messagesBox = document.getElementById('chat-messages-box');
  const inputField = document.getElementById('chat-input-field');
  const sendTrigger = document.getElementById('chat-send-trigger');
  const suggestionBtns = document.querySelectorAll('.chat-suggest-btn');

  if (!toggle || !chat || !close || !messagesBox || !inputField || !sendTrigger) return;

  let activeAudio = null;
  let fallbackVoice = null;

  // Local fallback response database
  const fallbackDb = {
    about: "I am Abhay Kushwaha, a full-stack engineer, tech founder, and AI builder studying Computer Science at Chandigarh University. I love engineering mechatronics, designing custom PCBs, and building agentic workflows.",
    lightinmotion: "I founded LightInMotion, an online lighting brand offering smart ambient LED solutions. I designed ESP32 & ESP8266 controller architectures and built a multi-platform app ecosystem (Electron desktop, Android, and TV apps) for real-time video and music sync.",
    scrims: "Scrims Nation is an esports tournament matchmaking and growth platform I co-founded. It automates tournament flows, brackets, player matching rating metrics, and prize distributions using React, Node.js, and Firebase.",
    robotic: "The Kinetic Robotic Hand is an anthropomorphic multi-DOF robotic hand programmed with C++ on Arduino. It captures glove flex telemetry and controls multi-axis servos, utilizing noise-filtering algorithms to achieve smooth replication of human joint mechanics.",
    drone: "The AI Surveillance Drone features C++ firmware running on an ESP32 microchip. It integrates MPU6050 and BMP280 telemetry, adjusting motor power via PID flight stabilization loops."
  };

  // Pre-load stable browser voice fallback (prioritizes male voices to sound closer to Abhay)
  function loadFallbackVoice() {
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a male voice first (like Microsoft David or Google Male)
      let voice = voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male')));
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'));
      }
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('microsoft'));
      }
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith('en'));
      }
      fallbackVoice = voice;
    }
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadFallbackVoice;
    loadFallbackVoice();
  }

  // Toggle chat widget
  toggle.addEventListener('click', () => {
    const isActive = chat.classList.toggle('active');
    
    // Play welcome greeting audio clip when chatbot opens
    if (isActive) {
      playAudioClip('welcome_audio_greeting');
    }
  });

  close.addEventListener('click', () => {
    chat.classList.remove('active');
    stopSpeaking();
  });

  sendTrigger.addEventListener('click', handleSend);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      inputField.value = query;
      handleSend();
    });
  });

  function playAudioClip(storageKey) {
    const audioDataUrl = localStorage.getItem(storageKey);
    if (audioDataUrl) {
      stopSpeaking();
      try {
        activeAudio = new Audio(audioDataUrl);
        activeAudio.play();
        return true;
      } catch (err) {
        console.error(`Audio playback failed for ${storageKey}:`, err);
      }
    }
    return false;
  }

  function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    appendMsg(text, 'user');
    inputField.value = '';

    // Show temporary typing indicator
    appendMsg('System analyzing queries...', 'bot temp');

    const topicMatch = getTopicMatch(text);
    
    // Check if we have a pre-recorded audio file for this matched topic (Option A)
    if (topicMatch && playAudioClip(topicMatch.audioKey)) {
      setTimeout(() => {
        removeTempMsg();
        appendMsg(topicMatch.replyText, 'bot');
      }, 1000);
      return;
    }

    // Otherwise, fall back to Live APIs (Gemini) with Dynamic voice synthesis engines
    const geminiKey = localStorage.getItem('gemini_api_key');
    const systemInstructions = localStorage.getItem('gemini_system_instructions') || '';

    if (geminiKey) {
      // Local Key Present (Testing Mode)
      generateGeminiResponse(text, geminiKey, systemInstructions);
    } else {
      // Production Mode: query secure Vercel backend proxy
      generateServerlessResponse(text);
    }
  }

  function getTopicMatch(query) {
    const q = query.toLowerCase();
    
    if (q.includes('lightinmotion') || q.includes('light in motion') || q.includes('lighting')) {
      return { audioKey: 'voice_audio_lim', replyText: fallbackDb.lightinmotion };
    }
    if (q.includes('scrims') || q.includes('nation') || q.includes('esports')) {
      return { audioKey: 'voice_audio_scrims', replyText: fallbackDb.scrims };
    }
    if (q.includes('hand') || q.includes('robotic') || q.includes('gesture')) {
      return { audioKey: 'voice_audio_hand', replyText: fallbackDb.robotic };
    }
    if (q.includes('drone') || q.includes('flight') || q.includes('surveillance')) {
      return { audioKey: 'voice_audio_drone', replyText: fallbackDb.drone };
    }
    if (
      q.includes('who are you') || 
      q.includes('about abhay') || 
      q.includes('biography') || 
      q.includes('resume') || 
      q.includes('skills') || 
      q.includes('introduction') || 
      q.includes('intro') || 
      q.includes('abhay') || 
      q.includes('who is') || 
      q.includes('profile') ||
      q.includes('education') ||
      q.includes('history') ||
      q.includes('college') ||
      q.includes('degree') ||
      q.includes('university') ||
      q.includes('academic') ||
      q.includes('study') ||
      q.includes('studies') ||
      q.includes('graduation')
    ) {
      return { audioKey: 'voice_audio_about', replyText: fallbackDb.about };
    }
    return null;
  }

  // --- Dynamic text replies from Gemini (Local/Test mode) ---
  async function generateGeminiResponse(query, apiKey, instructions) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: query }] }],
          systemInstruction: { parts: [{ text: instructions }] }
        })
      });

      const data = await response.json();
      removeTempMsg();

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const reply = data.candidates[0].content.parts[0].text.trim();
        appendMsg(reply, 'bot');
        speakResponse(reply);
      } else {
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (err) {
      console.error(err);
      removeTempMsg();
      const localReply = getLocalResponse(query);
      appendMsg(localReply, 'bot');
      speakResponse(localReply);
    }
  }

  // --- Secure Vercel Serverless proxy request ---
  async function generateServerlessResponse(query) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: query })
      });

      const data = await response.json();
      removeTempMsg();

      if (data.reply) {
        appendMsg(data.reply, 'bot');
        speakResponse(data.reply);
      } else {
        throw new Error(data.error || 'Serverless proxy returned error');
      }
    } catch (err) {
      console.error('Serverless call failed, using offline fallback:', err);
      removeTempMsg();
      const localReply = getLocalResponse(query);
      appendMsg(localReply, 'bot');
      speakResponse(localReply);
    }
  }

  // --- Cloned Voice Synthesis (Switch Engine) ---
  async function speakResponse(text) {
    stopSpeaking(); 

    const activeEngine = localStorage.getItem('active_voice_engine') || 'browser';

    if (activeEngine === 'local-xtts') {
      // Local XTTS Server synthesis (100% Free Voice Cloning)
      const ttsUrl = localStorage.getItem('local_tts_url') || 'http://localhost:5000/tts';
      try {
        const response = await fetch(ttsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) throw new Error('Local XTTS Server returned error status');

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        activeAudio = new Audio(audioUrl);
        activeAudio.play();
      } catch (err) {
        console.error('Local XTTS server synthesis failed:', err);
        browserSpeechFallback(text);
      }
    } else if (activeEngine === 'elevenlabs') {
      // ElevenLabs API Cloud synthesis
      const elevenKey = localStorage.getItem('elevenlabs_api_key');
      const voiceId = localStorage.getItem('elevenlabs_voice_id');

      if (elevenKey && voiceId) {
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'xi-api-key': elevenKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
          });

          if (!response.ok) throw new Error('ElevenLabs Cloud synthesis returned error status');

          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          activeAudio = new Audio(audioUrl);
          activeAudio.play();
        } catch (err) {
          console.error('ElevenLabs synthesis failed:', err);
          browserSpeechFallback(text);
        }
      } else {
        browserSpeechFallback(text);
      }
    } else {
      // Browser native TTS fallback
      browserSpeechFallback(text);
    }
  }

  // Tooltip popup trigger when scrolled to the Robotic Hand section
  const tooltip = document.getElementById('ai-assistant-tooltip');
  const targetSection = document.getElementById('proj-robothand');
  
  if (tooltip && targetSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Only show tooltip if chat window is not already open
        if (entry.isIntersecting && !chat.classList.contains('active')) {
          tooltip.classList.add('active');
        } else {
          tooltip.classList.remove('active');
        }
      });
    }, { threshold: 0.15 });
    
    observer.observe(targetSection);
  }

  function browserSpeechFallback(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  function stopSpeaking() {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function getLocalResponse(query) {
    const q = query.toLowerCase();
    if (q.includes('lightinmotion') || q.includes('light in motion') || q.includes('lighting')) return fallbackDb.lightinmotion;
    if (q.includes('scrims') || q.includes('nation') || q.includes('esports')) return fallbackDb.scrims;
    if (q.includes('tech') || q.includes('skill') || q.includes('languages')) return fallbackDb.tech;
    if (q.includes('working') || q.includes('now') || q.includes('current')) return fallbackDb.projects;
    if (q.includes('hand') || q.includes('robotic') || q.includes('gesture')) return fallbackDb.robotic;
    if (q.includes('drone') || q.includes('flight') || q.includes('surveillance')) return fallbackDb.drone;
    if (
      q.includes('who are you') || 
      q.includes('about abhay') || 
      q.includes('biography') || 
      q.includes('resume') || 
      q.includes('skills') || 
      q.includes('introduction') || 
      q.includes('intro') || 
      q.includes('abhay') || 
      q.includes('who is') || 
      q.includes('profile') ||
      q.includes('education') ||
      q.includes('history') ||
      q.includes('college') ||
      q.includes('degree') ||
      q.includes('university') ||
      q.includes('academic') ||
      q.includes('study') ||
      q.includes('studies') ||
      q.includes('graduation')
    ) return fallbackDb.about;
    
    return "Query analyzed. I have details on Abhay's startups (Scrims Nation), hardware (LightInMotion, Robotic Hand, AI Drone), and skills core. What details do you need?";
  }

  function appendMsg(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.textContent = text;
    messagesBox.appendChild(msg);
    
    // Defer scrolling slightly so the height has fully rendered in the DOM
    setTimeout(() => {
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 50);
  }

  function removeTempMsg() {
    const temp = messagesBox.querySelector('.chat-msg.temp');
    if (temp) temp.remove();
  }
}
