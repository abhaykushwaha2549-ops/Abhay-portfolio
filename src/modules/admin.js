// src/modules/admin.js
// Reads project changes and slides saved in localStorage by the /admin page and injects them.

export function initAdminPanel() {
  loadPersistentCMS();
}

function loadPersistentCMS() {
  const projectIds = [
    'proj-lightinmotion',
    'proj-scrimsnation',
    'proj-drone',
    'proj-robothand',
    'proj-home'
  ];

  projectIds.forEach(projId => {
    const projectElement = document.getElementById(projId);
    if (!projectElement) return;

    // 1. Load Text Elements
    const titleVal = localStorage.getItem(`cms_${projId}_title`);
    const roleVal = localStorage.getItem(`cms_${projId}_role`);
    const descVal = localStorage.getItem(`cms_${projId}_desc`);
    const webVal = localStorage.getItem(`cms_${projId}_web`);

    if (titleVal) {
      const titleEl = projectElement.querySelector('.project-title');
      if (titleEl) titleEl.textContent = titleVal;
    }

    if (roleVal) {
      const roleEl = projectElement.querySelector('.project-role');
      if (roleEl) roleEl.textContent = roleVal;
    }

    if (descVal) {
      const descEl = projectElement.querySelector('.project-desc');
      if (descEl) descEl.textContent = descVal;
    }

    if (webVal) {
      const webBtn = projectElement.querySelector('.project-links button:first-child');
      if (webBtn) {
        webBtn.setAttribute('onclick', `window.open('${webVal}', '_blank')`);
      }
    }

    // 2. Load Slides Media if uploaded
    const slidesJSON = localStorage.getItem(`cms_${projId}_slides`);
    if (slidesJSON) {
      try {
        const slidesData = JSON.parse(slidesJSON);
        if (slidesData.length > 0) {
          const slidesWrapper = projectElement.querySelector('.slides-wrapper');
          if (slidesWrapper) {
            slidesWrapper.innerHTML = slidesData.map(upload => `
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

            // Rebuild pagination slide indicators
            const container = projectElement.querySelector('.project-slideshow-container');
            if (container && window.rebuildSlideshow) {
              window.rebuildSlideshow(container);
            }
          }
        }
      } catch (err) {
        console.error(`Failed parsing slides data for ${projId}:`, err);
      }
    }
  });
}
