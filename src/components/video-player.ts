// We want to extend the HTMLElement to include a VideoPlayer
// This uses ShadowDOM to hold the DOM elements
// but can be attached to any element

class VideoPlayer extends HTMLElement {
  // DOM elements
  private videoElement: HTMLVideoElement;
  private playBtn: HTMLDivElement;
  private pauseBtn: HTMLDivElement;
  private muteBtn: HTMLDivElement;
  private volumeBtn: HTMLDivElement;
  private volumeSlider: HTMLInputElement;
  private errorDisplay: HTMLDivElement;
  private progressContainer: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private controlsContainer: HTMLDivElement;

  // Event handlers
  private togglePlay: () => void;
  private handleVideoStateChange: () => void;
  private emitTimeUpdate: () => void;
  private emitEnded: () => void;
  private handleError: (e: Event) => void;
  private updateProgressBar: () => void;
  private handleProgressBarClick: (e: MouseEvent) => void;
  private toggleMute: () => void;
  private updateVolumeIcon: () => void;
  private handleVolumeChange: (e: Event) => void;
  
  // For drag functionality
  private isDragging: boolean = false;
  private handleDragStart: (e: MouseEvent) => void;
  private handleDrag: (e: MouseEvent) => void;
  private handleDragEnd: () => void;

  // For keyboard navigation
  private handleKeyboardControl: (e: Event) => void;
  private handleProgressKeydown: (e: Event) => void;
  private updateProgressBarAria: () => void;

  static get observedAttributes(): string[] {
    return ['src', 'poster', 'autoplay', 'controls', 'muted', 'loop', 'type'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Create initial DOM structure
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 100%;
          position: relative;
        }
        .video-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 4px;
          background-color: #000;
        }
        video {
          width: 100%;
          display: block;
        }
        .video-container:hover .controls,
        .video-container:hover .progress-container {
          opacity: 1;
        }
        .controls {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 10px 10px;
          box-sizing: border-box;
          z-index: 2;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .control-btn {
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 5px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        .control-btn:hover, .control-btn:focus {
          background-color: rgba(255, 255, 255, 0.9);
          transform: scale(1.05);
          outline: none;
          box-shadow: 0 0 0 2px #4a90e2;
        }
        .play-btn {
          display: flex;
        }
        .pause-btn {
          display: none;
        }
        .volume-btn, .mute-btn {
          font-size: 16px;
        }
        .volume-btn {
          display: flex;
        }
        .mute-btn {
          display: none;
        }
        .reset-btn {
          font-size: 16px;
        }
        .volume-container {
          display: flex;
          align-items: center;
          margin: 0 5px;
          position: relative;
        }
        .volume-slider {
          width: 0;
          height: 5px;
          margin: 0 5px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2.5px;
          overflow: hidden;
          -webkit-appearance: none;
          transition: width 0.3s, opacity 0.3s;
          cursor: pointer;
          opacity: 0;
        }
        .volume-container:hover .volume-slider,
        .volume-slider:focus {
          width: 80px;
          opacity: 1;
        }
        .volume-slider:focus {
          outline: none;
          box-shadow: 0 0 0 2px #4a90e2;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
          position: relative;
        }
        .volume-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
          position: relative;
          border: none;
        }
        .progress-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background-color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: height 0.2s, cursor 0.1s, opacity 0.3s;
          z-index: 2;
          opacity: 0;
        }
        .progress-container:hover, 
        .progress-container.dragging,
        .progress-container:focus {
          height: 8px;
          outline: none;
        }
        .progress-container:focus {
          box-shadow: 0 0 0 2px #4a90e2;
        }
        .progress-bar {
          height: 100%;
          background-color: #4a90e2;
          width: 0;
          position: relative;
        }
        .progress-container.dragging {
          cursor: grabbing;
        }
        .error-display {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
          z-index: 3;
        }
        .error-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        /* Show controls when any element inside the player has focus */
        :host(:focus-within) .controls,
        :host(:focus-within) .progress-container {
          opacity: 1;
        }
      </style>
      <div class="video-container">
        <video part="video">
          Your browser does not support the video tag.
        </video>
        <div class="controls">
          <div class="control-btn play-btn" aria-label="Play" tabindex="0" role="button">▶</div>
          <div class="control-btn pause-btn" aria-label="Pause" tabindex="0" role="button">⏸</div>
          <div class="control-btn reset-btn" aria-label="Reset" tabindex="0" role="button">↻</div>
          <div class="volume-container">
            <div class="control-btn volume-btn" aria-label="Mute" tabindex="0" role="button">🔊</div>
            <div class="control-btn mute-btn" aria-label="Unmute" tabindex="0" role="button">🔇</div>
            <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="1" aria-label="Volume" tabindex="0">
          </div>
        </div>
        <div class="progress-container" tabindex="0" role="slider" aria-label="Video progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="progress-bar">
          </div>
        </div>
        <div class="error-display">
          <div class="error-icon">⚠️</div>
          <div class="error-message">Video could not be loaded</div>
        </div>
      </div>
    `;
    
    // Store references to elements
    this.videoElement = this.shadowRoot!.querySelector('video')!;
    this.controlsContainer = this.shadowRoot!.querySelector('.controls')!;
    this.playBtn = this.shadowRoot!.querySelector('.play-btn')!;
    this.pauseBtn = this.shadowRoot!.querySelector('.pause-btn')!;
    this.volumeBtn = this.shadowRoot!.querySelector('.volume-btn')!;
    this.muteBtn = this.shadowRoot!.querySelector('.mute-btn')!;
    this.volumeSlider = this.shadowRoot!.querySelector('.volume-slider')!;
    this.errorDisplay = this.shadowRoot!.querySelector('.error-display')!;
    this.progressContainer = this.shadowRoot!.querySelector('.progress-container')!;
    this.progressBar = this.shadowRoot!.querySelector('.progress-bar')!;
    
    // Bind methods
    this.togglePlay = this.togglePlayHandler.bind(this);
    this.handleVideoStateChange = this.handleVideoStateChangeHandler.bind(this);
    this.emitTimeUpdate = this.emitTimeUpdateHandler.bind(this);
    this.emitEnded = this.emitEndedHandler.bind(this);
    this.handleError = this.handleErrorEvent.bind(this);
    this.updateProgressBar = this.updateProgressBarHandler.bind(this);
    this.handleProgressBarClick = this.handleProgressBarClickHandler.bind(this);
    this.toggleMute = this.toggleMuteHandler.bind(this);
    this.updateVolumeIcon = this.updateVolumeIconHandler.bind(this);
    this.handleVolumeChange = this.handleVolumeChangeHandler.bind(this);
    this.handleKeyboardControl = this.handleKeyboardControlHandler.bind(this);
    this.handleProgressKeydown = this.handleProgressKeydownHandler.bind(this);
    this.updateProgressBarAria = this.updateProgressBarAriaHandler.bind(this);
    
    // Drag event handlers
    this.handleDragStart = this.handleDragStartHandler.bind(this);
    this.handleDrag = this.handleDragHandler.bind(this);
    this.handleDragEnd = this.handleDragEndHandler.bind(this);
  }
  
  connectedCallback(): void {
    // Set up event listeners
    this.playBtn.addEventListener('click', this.togglePlay);
    this.pauseBtn.addEventListener('click', this.togglePlay);
    this.shadowRoot!.querySelector('.reset-btn')!.addEventListener('click', () => this.seekTo(0));
    this.progressContainer.addEventListener('click', this.handleProgressBarClick);
    this.volumeBtn.addEventListener('click', this.toggleMute);
    this.muteBtn.addEventListener('click', this.toggleMute);
    this.volumeSlider.addEventListener('input', this.handleVolumeChange);
    
    // Add keyboard event listeners for accessibility
    this.playBtn.addEventListener('keydown', this.handleKeyboardControl);
    this.pauseBtn.addEventListener('keydown', this.handleKeyboardControl);
    this.shadowRoot!.querySelector('.reset-btn')!.addEventListener('keydown', this.handleKeyboardControl);
    this.volumeBtn.addEventListener('keydown', this.handleKeyboardControl);
    this.muteBtn.addEventListener('keydown', this.handleKeyboardControl);
    this.progressContainer.addEventListener('keydown', this.handleProgressKeydown);
    
    // Add drag functionality
    this.progressContainer.addEventListener('mousedown', this.handleDragStart);
    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleDragEnd);
    
    this.videoElement.addEventListener('play', this.handleVideoStateChange);
    this.videoElement.addEventListener('pause', this.handleVideoStateChange);
    this.videoElement.addEventListener('timeupdate', this.updateProgressBar);
    this.videoElement.addEventListener('timeupdate', this.emitTimeUpdate);
    this.videoElement.addEventListener('ended', this.emitEnded);
    this.videoElement.addEventListener('error', this.handleError);
    this.videoElement.addEventListener('volumechange', this.updateVolumeIcon);
    this.videoElement.addEventListener('timeupdate', this.updateProgressBarAria);
    
    // Apply initial attributes
    this.updateFromAttributes();
    
    // Initialize volume display
    this.updateVolumeIcon();
  }
  
  disconnectedCallback(): void {
    // Clean up event listeners
    this.playBtn.removeEventListener('click', this.togglePlay);
    this.pauseBtn.removeEventListener('click', this.togglePlay);
    this.shadowRoot!.querySelector('.reset-btn')!.removeEventListener('click', () => this.seekTo(0));
    this.progressContainer.removeEventListener('click', this.handleProgressBarClick);
    this.volumeBtn.removeEventListener('click', this.toggleMute);
    this.muteBtn.removeEventListener('click', this.toggleMute);
    this.volumeSlider.removeEventListener('input', this.handleVolumeChange);
    
    // Remove keyboard event listeners
    this.playBtn.removeEventListener('keydown', this.handleKeyboardControl);
    this.pauseBtn.removeEventListener('keydown', this.handleKeyboardControl);
    this.shadowRoot!.querySelector('.reset-btn')!.removeEventListener('keydown', this.handleKeyboardControl);
    this.volumeBtn.removeEventListener('keydown', this.handleKeyboardControl);
    this.muteBtn.removeEventListener('keydown', this.handleKeyboardControl);
    this.progressContainer.removeEventListener('keydown', this.handleProgressKeydown);
    
    // Remove drag functionality
    this.progressContainer.removeEventListener('mousedown', this.handleDragStart);
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleDragEnd);
    
    this.videoElement.removeEventListener('play', this.handleVideoStateChange);
    this.videoElement.removeEventListener('pause', this.handleVideoStateChange);
    this.videoElement.removeEventListener('timeupdate', this.updateProgressBar);
    this.videoElement.removeEventListener('timeupdate', this.emitTimeUpdate);
    this.videoElement.removeEventListener('ended', this.emitEnded);
    this.videoElement.removeEventListener('error', this.handleError);
    this.videoElement.removeEventListener('volumechange', this.updateVolumeIcon);
    this.videoElement.removeEventListener('timeupdate', this.updateProgressBarAria);
  }
  
  attributeChangedCallback(_name: string, oldValue: string, newValue: string): void {
    // React to attribute changes
    if (oldValue !== newValue) {
      this.updateFromAttributes();
    }
  }
  
  private updateFromAttributes(): void {
    // Reset error display
    this.errorDisplay.style.display = 'none';
    
    // Handle video source
    if (this.hasAttribute('src')) {
      const srcValue = this.getAttribute('src')!;
      const typeValue = this.getAttribute('type') || this.determineTypeFromSrc(srcValue);
      
      // Clear any existing sources
      while (this.videoElement.firstChild) {
        this.videoElement.removeChild(this.videoElement.firstChild);
      }
      
      if (typeValue) {
        // Use source element for better format control
        const source = document.createElement('source');
        source.src = srcValue;
        source.type = typeValue;
        this.videoElement.appendChild(source);
      } else {
        // Fallback to src attribute if no type
        this.videoElement.src = srcValue;
      }
    }
    
    if (this.hasAttribute('poster')) {
      this.videoElement.poster = this.getAttribute('poster')!;
    }
    
    this.videoElement.autoplay = this.hasAttribute('autoplay');
    this.videoElement.controls = this.hasAttribute('controls');
    this.videoElement.muted = this.hasAttribute('muted');
    this.volumeSlider.value = this.videoElement.muted ? '0' : '1';
    this.videoElement.loop = this.hasAttribute('loop');
    
    // If controls attribute is present, hide our custom controls
    if (this.hasAttribute('controls')) {
      this.controlsContainer.style.display = 'none';
      this.progressContainer.style.display = 'none';
    } else {
      this.controlsContainer.style.display = 'flex';
      this.progressContainer.style.display = 'block';
    }
    
    // Attempt to load the video
    this.videoElement.load();
  }
  
  private determineTypeFromSrc(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'ogg':
        return 'video/ogg';
      case 'mov':
        return 'video/quicktime';
      default:
        return '';
    }
  }
  
  private handleErrorEvent(_e: Event): void {
    console.error('Video error:', this.videoElement.error);
    
    // Display error message
    this.errorDisplay.style.display = 'flex';
    const errorMessageElement = this.errorDisplay.querySelector('.error-message')!;
    
    // Get error code and provide specific message
    const error = this.videoElement.error;
    let message = 'Video could not be loaded';
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message = 'Video playback was aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message = 'Network error while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message = 'Video could not be decoded';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Video format not supported by your browser';
          break;
      }
    }
    
    errorMessageElement.textContent = message;
    
    // Emit custom error event
    const errorEvent = new CustomEvent('videoerror', {
      bubbles: true,
      composed: true,
      detail: { error }
    });
    this.dispatchEvent(errorEvent);
  }
  
  private togglePlayHandler(): void {
    if (this.videoElement.paused) {
      this.videoElement.play().catch(err => {
        console.error('Error playing video:', err);
      });
    } else {
      this.videoElement.pause();
    }
  }
  
  private handleVideoStateChangeHandler(): void {
    if (this.videoElement.paused) {
      this.playBtn.style.display = 'flex';
      this.pauseBtn.style.display = 'none';
    } else {
      this.playBtn.style.display = 'none';
      this.pauseBtn.style.display = 'flex';
    }
  }
  
  private toggleMuteHandler(): void {
    this.videoElement.muted = !this.videoElement.muted;
    this.updateVolumeIcon();
    
    if (this.videoElement.muted) {
      this.volumeSlider.value = '0';
    } else if (this.videoElement.volume === 0) {
      // If unmuted but volume is 0, set to a default value
      this.videoElement.volume = 0.5;
      this.volumeSlider.value = '0.5';
    } else {
      this.volumeSlider.value = this.videoElement.volume.toString();
    }
  }
  
  private updateVolumeIconHandler(): void {
    if (this.videoElement.muted || this.videoElement.volume === 0) {
      this.volumeBtn.style.display = 'none';
      this.muteBtn.style.display = 'flex';
    } else {
      this.volumeBtn.style.display = 'flex';
      this.muteBtn.style.display = 'none';
    }
  }
  
  private handleVolumeChangeHandler(e: Event): void {
    const slider = e.target as HTMLInputElement;
    const value = parseFloat(slider.value);
    
    this.videoElement.volume = value;
    this.videoElement.muted = value === 0;
    
    this.updateVolumeIcon();
  }
  
  private updateProgressBarHandler(): void {
    if (this.videoElement.duration) {
      const progress = (this.videoElement.currentTime / this.videoElement.duration) * 100;
      this.progressBar.style.width = `${progress}%`;
    } else {
      this.progressBar.style.width = '0%';
    }
  }
  
  private handleProgressBarClickHandler(e: MouseEvent): void {
    // Prevent default behavior
    e.preventDefault();
    
    const rect = this.progressContainer.getBoundingClientRect();
    const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = this.videoElement.duration * clickPosition;
    
    if (!isNaN(newTime) && isFinite(newTime)) {
      this.videoElement.currentTime = newTime;
      this.updateProgressBar();
    }
  }
  
  private handleDragStartHandler(e: MouseEvent): void {
    // Prevent default behavior
    e.preventDefault();
    this.isDragging = true;
    
    // Apply a class to show we're dragging
    this.progressContainer.classList.add('dragging');
    
    // Set cursor on document body
    document.body.style.cursor = 'grabbing';
    
    // Update position right away
    this.handleDragHandler(e);
  }
  
  private handleDragHandler(e: MouseEvent): void {
    if (!this.isDragging) return;
    
    // Prevent default behavior
    e.preventDefault();
    
    const rect = this.progressContainer.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = this.videoElement.duration * position;
    
    if (!isNaN(newTime) && isFinite(newTime)) {
      this.videoElement.currentTime = newTime;
      this.updateProgressBar();
    }
  }
  
  private handleDragEndHandler(): void {
    if (!this.isDragging) return;
    
    // Reset dragging state
    this.isDragging = false;
    this.progressContainer.classList.remove('dragging');
    
    // Reset cursor
    document.body.style.cursor = '';
  }
  
  private emitTimeUpdateHandler(): void {
    // Dispatch custom event for React to listen to
    const event = new CustomEvent<{ currentTime: number; duration: number }>('videotimeupdate', {
      bubbles: true,
      composed: true,
      detail: {
        currentTime: this.videoElement.currentTime,
        duration: this.videoElement.duration
      }
    });
    this.dispatchEvent(event);
  }
  
  private emitEndedHandler(): void {
    // Dispatch custom event when video ends
    const event = new CustomEvent('videoended', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
  
  private handleKeyboardControlHandler(e: Event): void {
    // Cast to KeyboardEvent
    const keyEvent = e as KeyboardEvent;
    
    // Handle Enter or Space key press
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      keyEvent.preventDefault(); // Prevent page scroll on space
      
      const target = keyEvent.currentTarget as HTMLElement;
      if (target.classList.contains('play-btn') || target.classList.contains('pause-btn')) {
        this.togglePlay();
      } else if (target.classList.contains('reset-btn')) {
        this.seekTo(0);
      } else if (target.classList.contains('volume-btn') || target.classList.contains('mute-btn')) {
        this.toggleMute();
      }
    }
  }
  
  private handleProgressKeydownHandler(e: Event): void {
    // Cast to KeyboardEvent
    const keyEvent = e as KeyboardEvent;
    
    // Handle keyboard navigation for progress bar
    if (this.videoElement.duration) {
      const currentTime = this.videoElement.currentTime;
      const duration = this.videoElement.duration;
      const stepSize = duration / 100; // 1% of total duration
      const largeStepSize = duration / 10; // 10% of total duration
      
      switch (keyEvent.key) {
        case 'ArrowRight':
          keyEvent.preventDefault();
          this.seekTo(Math.min(duration, currentTime + stepSize));
          break;
        case 'ArrowLeft':
          keyEvent.preventDefault();
          this.seekTo(Math.max(0, currentTime - stepSize));
          break;
        case 'ArrowUp':
          keyEvent.preventDefault();
          this.seekTo(Math.min(duration, currentTime + largeStepSize));
          break;
        case 'ArrowDown':
          keyEvent.preventDefault();
          this.seekTo(Math.max(0, currentTime - largeStepSize));
          break;
        case 'Home':
          keyEvent.preventDefault();
          this.seekTo(0);
          break;
        case 'End':
          keyEvent.preventDefault();
          this.seekTo(duration);
          break;
        case 'Enter':
        case ' ':
          keyEvent.preventDefault();
          this.togglePlay();
          break;
      }
    }
  }
  
  private updateProgressBarAriaHandler(): void {
    if (this.videoElement.duration) {
      const percent = Math.round((this.videoElement.currentTime / this.videoElement.duration) * 100);
      this.progressContainer.setAttribute('aria-valuenow', percent.toString());
      
      // Update accessible description with current time and duration
      const minutes = Math.floor(this.videoElement.currentTime / 60);
      const seconds = Math.floor(this.videoElement.currentTime % 60);
      const totalMinutes = Math.floor(this.videoElement.duration / 60);
      const totalSeconds = Math.floor(this.videoElement.duration % 60);
      
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')} of ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
      this.progressContainer.setAttribute('aria-valuetext', timeString);
    }
  }
  
  // Public methods for React to call
  play(): void {
    this.videoElement.play().catch(err => {
      console.error('Error playing video:', err);
    });
  }
  
  pause(): void {
    this.videoElement.pause();
  }
  
  seekTo(time: number): void {
    if (isNaN(time)) return;
    this.videoElement.currentTime = time;
    this.updateProgressBar();
  }
  
  setVolume(volume: number): void {
    if (isNaN(volume)) return;
    
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    this.videoElement.volume = normalizedVolume;
    this.volumeSlider.value = normalizedVolume.toString();
    this.videoElement.muted = normalizedVolume === 0;
    this.updateVolumeIcon();
  }
  
  toggleMuteVideo(): void {
    this.toggleMute();
  }
}

// Register the custom element
customElements.define('video-player', VideoPlayer);

export default VideoPlayer;
