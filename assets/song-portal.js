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
      e.preventDefault();
      const url = downloadBtn.href;
      const title = card.dataset.songTitle || 'bespoke-song';
      const filename = `${this.slugify(title)}.mp3`;

      this.downloadFile(url, filename);
    });
  }

  animateProgress(card) {
    const progressBar = card.querySelector('[data-progress-bar]');
    if (!progressBar) return;

    const targetWidth = progressBar.dataset.width;
    // Small delay to ensure CSS transition catches it
    setTimeout(() => {
      progressBar.style.width = `${targetWidth}%`;
    }, 100);
  }

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  async downloadFile(url, filename) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link
      window.open(url, '_blank');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const portalContainer = document.querySelector('.song-portal-section');
  if (portalContainer) {
    new SongPortal(portalContainer);
  }
});
