class SongPortal {
  constructor(container) {
    this.container = container;
    this.cards = container.querySelectorAll('[data-song-card]');
    this.init();
  }

  init() {
    // Initialize Song Portal
    this.cards.forEach(card => {
      this.initAudio(card);
      this.initDownloads(card);
      this.animateProgress(card);
      this.animateSteps(card);
      this.initLyricsApproval(card);
      this.initSongApproval(card); // ← CRITICAL FIX: Call independently
    });
  }

  initAudio(card) {
    const customPlayers = card.querySelectorAll('.custom-audio-player');

    customPlayers.forEach(playerContainer => {
      const audio = playerContainer.querySelector('.hidden-audio');
      const playBtn = playerContainer.querySelector('.play-pause-btn');
      const playIcon = playBtn.querySelector('.icon-play');
      const pauseIcon = playBtn.querySelector('.icon-pause');
      const progressBar = playerContainer.querySelector('.progress-bar');
      const progressFill = playerContainer.querySelector('.progress-fill');
      const currentTimeEl = playerContainer.querySelector('.current-time');
      const durationEl = playerContainer.querySelector('.duration');

      if (!audio || !playBtn) return;

      // Play/Pause Toggle
      playBtn.addEventListener('click', () => {
        if (audio.paused) {
          // Pause all other audios first
          document.querySelectorAll('audio').forEach(a => {
            if (a !== audio) {
              a.pause();
              // Reset other players UI
              const otherContainer = a.closest('.custom-audio-player');
              if (otherContainer) {
                otherContainer.querySelector('.icon-play').style.display = 'block';
                otherContainer.querySelector('.icon-pause').style.display = 'none';
              }
            }
          });

          audio.play();
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'block';
          playerContainer.classList.add('is-playing');
        } else {
          audio.pause();
          playIcon.style.display = 'block';
          pauseIcon.style.display = 'none';
          playerContainer.classList.remove('is-playing');
        }
      });

      // Update Progress
      audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        currentTimeEl.textContent = this.formatTime(audio.currentTime);
      });

      // Load Duration
      audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = this.formatTime(audio.duration);
      });

      // Seek
      progressBar.parentElement.addEventListener('click', (e) => {
        const rect = progressBar.parentElement.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
      });

      // Reset on End
      audio.addEventListener('ended', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        progressFill.style.width = '0%';
        playerContainer.classList.remove('is-playing');
      });
    });
  }

  formatTime(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  initDownloads(card) {
    const downloadBtn = card.querySelector('[data-download-btn]');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', (e) => {
      // Allow default behavior (download) but track if needed
    });
  }

  animateProgress(card) {
    const progressBar = card.querySelector('[data-progress-bar]');
    if (!progressBar) return;

    const targetWidth = progressBar.dataset.width;
    setTimeout(() => {
      progressBar.style.width = `${targetWidth}%`;
    }, 300);
  }

  animateSteps(card) {
    const steps = card.querySelectorAll('.status-step');
    steps.forEach((step, index) => {
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

    // Lyrics Accordion Logic
    const accordionHeader = document.querySelector('.lyrics-display__header');
    const accordionContent = document.getElementById('lyrics-content');

    if (accordionHeader && accordionContent) {
      accordionHeader.addEventListener('click', () => {
        const isExpanded = accordionHeader.getAttribute('aria-expanded') === 'true';

        accordionHeader.setAttribute('aria-expanded', !isExpanded);
        accordionContent.setAttribute('aria-hidden', isExpanded);

        if (!isExpanded) {
          accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
          accordionContent.style.opacity = "1";
        } else {
          accordionContent.style.maxHeight = "0";
          accordionContent.style.opacity = "0";
        }
      });
    }

    if (!showChangesBtn || !approvalForm) return;

    // Toggle change request section
    showChangesBtn.addEventListener('click', () => {
      changeSection.style.display = 'block';
      showChangesBtn.style.display = 'none';
      setTimeout(() => {
        const textarea = changeSection.querySelector('textarea');
        if (textarea) textarea.focus();
      }, 100);
    });

    cancelBtn.addEventListener('click', () => {
      changeSection.style.display = 'none';
      showChangesBtn.style.display = 'inline-flex';
      if (changeForm) changeForm.reset();
    });

    // Handle approval submission
    if (approvalForm) {
      approvalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(approvalForm);
        const data = Object.fromEntries(formData.entries());

        this.showFeedback(feedbackDiv, 'Submitting approval...', 'loading');

        try {
          await this.submitToWebhook(data); // Lyrics webhook: uzi3goy (default)
          this.showFeedback(feedbackDiv, '✓ Lyrics approved! You will hear from us shortly.', 'success');
        } catch (error) {
          this.showFeedback(feedbackDiv, '✗ Error submitting. Please try again.', 'error');
        }
      });
    }

    // Handle change request submission
    if (changeForm) {
      changeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(changeForm);
        const data = Object.fromEntries(formData.entries());

        this.showFeedback(feedbackDiv, 'Sending change request...', 'loading');

        try {
          await this.submitToWebhook(data); // Lyrics webhook: uzi3goy (default)
          this.showFeedback(feedbackDiv, '✓ Change request sent!', 'success');
          changeForm.reset();
          changeSection.style.display = 'none';
          showChangesBtn.style.display = 'inline-flex';
        } catch (error) {
          this.showFeedback(feedbackDiv, '✗ Error sending request. Please try again.', 'error');
        }
      });
    }
  }

  initSongApproval(card) {
    const showChangesBtn = card.querySelector('[data-show-song-changes]');
    const cancelBtn = card.querySelector('[data-cancel-song-changes]');
    const changeSection = card.querySelector('[data-song-change-section]');
    const approvalForm = card.querySelector('[data-song-approval-form]');
    const changeForm = card.querySelector('[data-song-change-form]');
    const feedbackDiv = card.querySelector('[data-song-approval-feedback]');

    if (!approvalForm && !showChangesBtn) return;

    // Toggle change request section
    if (showChangesBtn && changeSection) {
      showChangesBtn.addEventListener('click', () => {
        // Request revisions handler
        changeSection.style.display = 'block';
        showChangesBtn.style.display = 'none';

        const textarea = changeSection.querySelector('textarea');
        if (textarea) {
          setTimeout(() => {
            textarea.focus();
          }, 100);
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        changeSection.style.display = 'none';
        showChangesBtn.style.display = 'inline-flex';
        if (changeForm) changeForm.reset();
      });
    }

    // Handle Song Approval
    if (approvalForm) {
      approvalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(approvalForm);
        const data = Object.fromEntries(formData.entries());

        this.showFeedback(feedbackDiv, 'Submitting song approval...', 'loading');

        try {
          await this.submitToWebhook(data, 'https://hooks.zapier.com/hooks/catch/25433977/uzs34wx/'); // Song webhook

          // Hide form
          approvalForm.style.display = 'none';
          if (changeSection) changeSection.style.display = 'none';
          if (showChangesBtn) showChangesBtn.style.display = 'none';

          // Show success
          this.showFeedback(feedbackDiv, '✓ Your approval has been sent! You will hear from us shortly.', 'success');
        } catch (error) {
          this.showFeedback(feedbackDiv, '✗ Error submitting approval. Please try again.', 'error');
        }
      });
    }

    // Handle Song Change Request
    if (changeForm) {
      changeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(changeForm);
        const data = Object.fromEntries(formData.entries());

        this.showFeedback(feedbackDiv, 'Sending revision request...', 'loading');

        try {
          await this.submitToWebhook(data, 'https://hooks.zapier.com/hooks/catch/25433977/uzs34wx/'); // Song webhook

          // Hide form
          changeSection.style.display = 'none';
          if (showChangesBtn) showChangesBtn.style.display = 'none';
          if (approvalForm) approvalForm.style.display = 'none';

          // Show success
          this.showFeedback(feedbackDiv, '✓ Your request has been sent! You will hear from us shortly.', 'success');
        } catch (error) {
          this.showFeedback(feedbackDiv, '✗ Error sending request. Please try again.', 'error');
        }
      });
    }
  }

  async submitToWebhook(data, webhookUrl = 'https://hooks.zapier.com/hooks/catch/25433977/uzs34wx/') {
    const params = new URLSearchParams({
      ...data,
      timestamp: new Date().toISOString(),
      shop: Shopify.shop || window.location.hostname
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: params
    });

    if (!response.ok) {
      throw new Error('Webhook submission failed');
    }

    return response.json();
  }

  showFeedback(feedbackDiv, message, type) {
    // Show feedback message
    if (!feedbackDiv) {
      console.error('Feedback div not found!');
      return;
    }

    feedbackDiv.textContent = message;
    feedbackDiv.className = `approval-feedback approval-feedback--${type}`;
    feedbackDiv.style.display = 'block';

    // FORCE GOLD STYLES
    if (type === 'success') {
      feedbackDiv.style.background = 'rgba(212, 175, 55, 0.1)';
      feedbackDiv.style.border = '1px solid rgba(212, 175, 55, 0.3)';
      feedbackDiv.style.color = '#d4af37';
      feedbackDiv.style.padding = '1.5rem';
      feedbackDiv.style.marginTop = '2rem';
      feedbackDiv.style.textAlign = 'center';
      feedbackDiv.style.fontSize = '1.1rem';
      feedbackDiv.style.display = 'block';
    }

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
