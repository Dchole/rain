import { Raindrop } from "./raindrop.js";
import { Lightning } from "./lightning.js";
import { AudioManager } from "./audioManager.js";

/**
 * Main rain animation class that manages the entire scene
 */
export class RainScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raindrops: Raindrop[] = [];
  private lightning: Lightning;
  private audioManager: AudioManager;
  private animationId: number = 0;
  private lastTime: number = 0;

  // Animation settings
  private rainEnabled: boolean = true;
  private lightningEnabled: boolean = true;
  private intensityLevel: number = 1; // Rain level (1-10)
  private baseRainCount: number = 100; // Base raindrops per level
  private rainIntensity: number = 100; // Number of raindrops (will be set in constructor)

  // Background elements
  private stars: {
    x: number;
    y: number;
    brightness: number;
    twinkle: number;
  }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = context;
    this.audioManager = new AudioManager();
    this.lightning = new Lightning(() => this.audioManager.playThunder());

    // Set initial rain intensity based on level
    this.rainIntensity = this.baseRainCount * this.intensityLevel;

    this.setupCanvas();
    this.createStars();
    this.createRain();
    this.setupEventListeners();

    // Start rain audio if enabled
    if (this.rainEnabled) {
      // Note: Audio will only start after user interaction due to browser policies
      this.audioManager.startRain();
    }
  }

  /**
   * Setup canvas dimensions and properties
   */
  private setupCanvas(): void {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  /**
   * Resize canvas to window size
   */
  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Recreate elements when canvas is resized
    this.createStars();
    this.createRain();
  }

  /**
   * Create stars for the night sky
   */
  private createStars(): void {
    this.stars = [];
    const numStars = 150;

    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height * 0.6, // Only in upper part of sky
        brightness: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Create initial raindrops
   */
  private createRain(): void {
    this.raindrops = [];
    for (let i = 0; i < this.rainIntensity; i++) {
      this.raindrops.push(new Raindrop(this.canvas.width, this.canvas.height));
    }
  }

  /**
   * Setup control event listeners
   */
  private setupEventListeners(): void {
    const toggleRainBtn = document.getElementById("toggleRain");
    const toggleLightningBtn = document.getElementById("toggleLightning");
    const increaseIntensityBtn = document.getElementById("increaseIntensity");
    const decreaseIntensityBtn = document.getElementById("decreaseIntensity");
    const toggleAudioBtn = document.getElementById("toggleAudio");
    const volumeSlider = document.getElementById(
      "volumeSlider"
    ) as HTMLInputElement;

    toggleRainBtn?.addEventListener("click", async () => {
      // Enable audio context on first user interaction
      await this.audioManager.enableAudio();
      this.hideAudioInfo();

      this.rainEnabled = !this.rainEnabled;

      if (this.rainEnabled) {
        this.audioManager.startRain();
      } else {
        this.audioManager.stopRain();
      }

      this.updateRainStatus();
    });

    toggleLightningBtn?.addEventListener("click", async () => {
      await this.enableAudioAndStartRain();
      this.lightningEnabled = !this.lightningEnabled;
      this.updateLightningStatus();
    });

    increaseIntensityBtn?.addEventListener("click", async () => {
      await this.enableAudioAndStartRain();
      this.changeIntensityLevel(1);
    });

    decreaseIntensityBtn?.addEventListener("click", async () => {
      await this.enableAudioAndStartRain();
      this.changeIntensityLevel(-1);
    });

    toggleAudioBtn?.addEventListener("click", async () => {
      await this.enableAudioAndStartRain();
      this.audioManager.toggleAudio();
      this.updateAudioStatus();
    });

    volumeSlider?.addEventListener("input", async event => {
      await this.enableAudioAndStartRain();
      const volume = parseFloat((event.target as HTMLInputElement).value);
      this.audioManager.setMasterVolume(volume);
      this.updateVolumeDisplay();
    });

    // Initialize UI state
    this.updateUI();
  }

  /**
   * Update UI status indicators and button states
   */
  private updateUI(): void {
    this.updateRainStatus();
    this.updateLightningStatus();
    this.updateIntensityDisplay();
    this.updateAudioStatus();
    this.updateVolumeDisplay();
  }

  /**
   * Update rain status display and button
   */
  private updateRainStatus(): void {
    const statusElement = document.getElementById("rainStatus");
    const buttonElement = document.getElementById("toggleRain");

    if (statusElement && buttonElement) {
      if (this.rainEnabled) {
        statusElement.textContent = "ON";
        statusElement.className = "status-value active";
        buttonElement.className = "control-btn active";
      } else {
        statusElement.textContent = "OFF";
        statusElement.className = "status-value inactive";
        buttonElement.className = "control-btn inactive";
      }
    }
  }

  /**
   * Update lightning status display and button
   */
  private updateLightningStatus(): void {
    const statusElement = document.getElementById("lightningStatus");
    const buttonElement = document.getElementById("toggleLightning");

    if (statusElement && buttonElement) {
      if (this.lightningEnabled) {
        statusElement.textContent = "ON";
        statusElement.className = "status-value active";
        buttonElement.className = "control-btn active";
      } else {
        statusElement.textContent = "OFF";
        statusElement.className = "status-value inactive";
        buttonElement.className = "control-btn inactive";
      }
    }
  }

  /**
   * Update intensity level display
   */
  private updateIntensityDisplay(): void {
    const statusElement = document.getElementById("intensityLevel");

    if (statusElement) {
      statusElement.textContent = `Level ${this.intensityLevel}`;
      statusElement.className = "status-value intensity";
    }
  }

  /**
   * Update audio status display and button
   */
  private updateAudioStatus(): void {
    const statusElement = document.getElementById("audioStatus");
    const buttonElement = document.getElementById("toggleAudio");
    const audioState = this.audioManager.getState();

    if (statusElement && buttonElement) {
      if (audioState.enabled) {
        statusElement.textContent = "ON";
        statusElement.className = "status-value active";
        buttonElement.className = "control-btn active";
        buttonElement.textContent = "🔊 Toggle Audio";
      } else {
        statusElement.textContent = "OFF";
        statusElement.className = "status-value inactive";
        buttonElement.className = "control-btn inactive";
        buttonElement.textContent = "🔇 Toggle Audio";
      }
    }
  }

  /**
   * Update volume display
   */
  private updateVolumeDisplay(): void {
    const volumeSlider = document.getElementById(
      "volumeSlider"
    ) as HTMLInputElement;
    const volumeDisplay = document.getElementById("volumeDisplay");

    if (volumeSlider && volumeDisplay) {
      const volume = parseInt(volumeSlider.value);
      volumeDisplay.textContent = `${volume}%`;
    }
  }

  /**
   * Hide audio activation info message
   */
  private hideAudioInfo(): void {
    const audioInfo = document.getElementById("audioInfo");
    if (audioInfo) {
      audioInfo.style.display = "none";
    }
  }

  /**
   * Enable audio and start rain if it should be playing
   */
  private async enableAudioAndStartRain(): Promise<void> {
    await this.audioManager.enableAudio();
    this.hideAudioInfo();

    // Start rain audio if rain is enabled but not playing
    if (this.rainEnabled && !this.audioManager.getState().rainPlaying) {
      this.audioManager.startRain();
    }
  }

  /**
   * Change rain intensity level (1-10)
   */
  private changeIntensityLevel(delta: number): void {
    const newLevel = Math.max(1, Math.min(10, this.intensityLevel + delta));

    if (newLevel !== this.intensityLevel) {
      this.intensityLevel = newLevel;
      const newIntensity = this.baseRainCount * this.intensityLevel;

      if (newIntensity > this.rainIntensity) {
        // Add more raindrops
        const toAdd = newIntensity - this.rainIntensity;
        for (let i = 0; i < toAdd; i++) {
          this.raindrops.push(
            new Raindrop(this.canvas.width, this.canvas.height)
          );
        }
      } else if (newIntensity < this.rainIntensity) {
        // Remove raindrops
        this.raindrops = this.raindrops.slice(0, newIntensity);
      }

      this.rainIntensity = newIntensity;
      this.audioManager.updateRainIntensity(this.intensityLevel);
      this.updateIntensityDisplay();
    }
  }

  /**
   * Draw the night sky background with stars
   */
  private drawBackground(time: number): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw night sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw twinkling stars
    this.stars.forEach(star => {
      const twinkle = Math.sin(time * 0.002 + star.twinkle) * 0.5 + 0.5;
      const brightness = star.brightness * twinkle;

      this.ctx.save();
      this.ctx.globalAlpha = brightness;
      this.ctx.fillStyle = "#ffffff";
      this.ctx.shadowColor = "#ffffff";
      this.ctx.shadowBlur = 2;

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  /**
   * Draw lightning flash effect on screen
   */
  private drawLightningFlash(): void {
    const flashIntensity = this.lightning.getFlashIntensity();
    if (flashIntensity > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.3})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
  }

  /**
   * Update animation
   */
  private update(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update lightning
    if (this.lightningEnabled) {
      this.lightning.update(this.canvas.width, this.canvas.height, deltaTime);
    }

    // Update raindrops
    if (this.rainEnabled) {
      this.raindrops.forEach(raindrop => {
        raindrop.update(this.canvas.height);

        if (raindrop.isOutOfBounds(this.canvas.height)) {
          raindrop.reset(this.canvas.width);
        }
      });
    }
  }

  /**
   * Render the scene
   */
  private render(currentTime: number): void {
    // Draw background
    this.drawBackground(currentTime);

    // Draw lightning flash effect
    if (this.lightningEnabled) {
      this.drawLightningFlash();
    }

    // Draw rain
    if (this.rainEnabled) {
      this.raindrops.forEach(raindrop => {
        raindrop.draw(this.ctx);
      });
    }

    // Draw lightning bolts
    if (this.lightningEnabled) {
      this.lightning.draw(this.ctx);
    }
  }

  /**
   * Main animation loop
   */
  private animate = (currentTime: number): void => {
    this.update(currentTime);
    this.render(currentTime);
    this.animationId = requestAnimationFrame(this.animate);
  };

  /**
   * Start the animation
   */
  public start(): void {
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  }

  /**
   * Stop the animation
   */
  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }
}
