class SongPortal {
  constructor(container) {
    this.container = container;
    this.cards = container.querySelectorAll('[data-song-card]');
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      this.initAudio(card);
      this.initDownloads(card);
      this.animateProgress(card);
      this.animateSteps(card);
    });
  }

  initAudio(card) {
    const players = card.querySelectorAll('audio');
    players.forEach(player => {
      player.addEventListener('play', () => {
        // Pause other players when one starts
        players.forEach(p => {
          if (p !== player) p.pause();
        });
      });
    });
  }

  initDownloads(card) {
    const downloadBtn = card.querySelector('[data-download-btn]');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', (e) => {
      // Allow default behavior (download) but track if needed
      // e.preventDefault(); // Removed to allow native download attribute to work if present
    });
  }

  animateProgress(card) {
    const progressBar = card.querySelector('[data-progress-bar]');
    if (!progressBar) return;

    const targetWidth = progressBar.dataset.width;
    // Delay to ensure CSS transition catches it after load
    setTimeout(() => {
      progressBar.style.width = `${targetWidth}%`;
    }, 300);
  }

  animateSteps(card) {
    const steps = card.querySelectorAll('.status-step');
    steps.forEach((step, index) => {
      // Staggered entrance
      setTimeout(() => {
        step.classList.add('is-visible');
      }, 100 + (index * 150));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const portalContainer = document.querySelector('.song-portal-section');
  if (portalContainer) {
    new SongPortal(portalContainer);
  }
});
