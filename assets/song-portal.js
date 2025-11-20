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
      this.initLyricsApproval(card);
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

  initLyricsApproval(card) {
    const showChangesBtn = card.querySelector('[data-show-changes]');
    const cancelBtn = card.querySelector('[data-cancel-changes]');
    const changeSection = card.querySelector('[data-change-request-section]');
    const approvalForm = card.querySelector('[data-lyrics-approval-form]');
    const changeForm = card.querySelector('[data-change-request-form]');
    const feedbackDiv = card.querySelector('[data-approval-feedback]');

    if (!showChangesBtn || !approvalForm) return; // No lyrics approval section on this card

    // Toggle change request section
    showChangesBtn.addEventListener('click', () => {
      changeSection.style.display = 'block';
      showChangesBtn.style.display = 'none';
      setTimeout(() => {
        changeSection.querySelector('textarea').focus();
      }, 100);
    });

    cancelBtn.addEventListener('click', () => {
      changeSection.style.display = 'none';
      showChangesBtn.style.display = 'inline-flex';
      changeForm.reset();
    });

    // Handle approval submission
    approvalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(approvalForm);
      const data = Object.fromEntries(formData.entries());

      this.showFeedback(feedbackDiv, 'Submitting approval...', 'loading');

      try {
        await this.submitToWebhook(data);
        this.showFeedback(feedbackDiv, '✓ Lyrics approved! The status will update shortly. Refreshing page...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        this.showFeedback(feedbackDiv, '✗ Error submitting approval. Please try again or contact support.', 'error');
      }
    });

    // Handle change request submission
    changeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(changeForm);
      const data = Object.fromEntries(formData.entries());

      this.showFeedback(feedbackDiv, 'Sending change request...', 'loading');

      try {
        await this.submitToWebhook(data);
        this.showFeedback(feedbackDiv, '✓ Change request sent! I\'ll review it and get back to you soon.', 'success');
        changeForm.reset();
        changeSection.style.display = 'none';
        showChangesBtn.style.display = 'inline-flex';
      } catch (error) {
        this.showFeedback(feedbackDiv, '✗ Error sending request. Please try again or contact support.', 'error');
      }
    });
  }

  async submitToWebhook(data) {
    // WEBHOOK_URL should be configured in theme settings or hardcoded here
    // For now, using a placeholder that needs to be configured
    const webhookUrl = window.LYRICS_WEBHOOK_URL || 'https://hook.us1.make.com/YOUR_WEBHOOK_ID';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        shop: Shopify.shop || window.location.hostname
      })
    });

    if (!response.ok) {
      throw new Error('Webhook submission failed');
    }

    return response.json();
  }

  showFeedback(feedbackDiv, message, type) {
    feedbackDiv.textContent = message;
    feedbackDiv.className = `approval-feedback approval-feedback--${type}`;
    feedbackDiv.style.display = 'block';

    if (type === 'error') {
      setTimeout(() => {
        feedbackDiv.style.display = 'none';
      }, 5000);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const portalContainer = document.querySelector('.song-portal-section');
  if (portalContainer) {
    new SongPortal(portalContainer);
  }
});
