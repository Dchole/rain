import { Raindrop } from "./raindrop.js";
import { Lightning } from "./lightning.js";

/**
 * Main rain animation class that manages the entire scene
 */
export class RainScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raindrops: Raindrop[] = [];
  private lightning: Lightning;
  private animationId: number = 0;
  private lastTime: number = 0;

  // Animation settings
  private rainEnabled: boolean = true;
  private lightningEnabled: boolean = true;
  private rainIntensity: number = 200; // Number of raindrops

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
    this.lightning = new Lightning();

    this.setupCanvas();
    this.createStars();
    this.createRain();
    this.setupEventListeners();
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

    toggleRainBtn?.addEventListener("click", () => {
      this.rainEnabled = !this.rainEnabled;
    });

    toggleLightningBtn?.addEventListener("click", () => {
      this.lightningEnabled = !this.lightningEnabled;
    });

    increaseIntensityBtn?.addEventListener("click", () => {
      this.changeRainIntensity(50);
    });

    decreaseIntensityBtn?.addEventListener("click", () => {
      this.changeRainIntensity(-50);
    });
  }

  /**
   * Change rain intensity
   */
  private changeRainIntensity(delta: number): void {
    const newIntensity = Math.max(
      50,
      Math.min(500, this.rainIntensity + delta)
    );

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
