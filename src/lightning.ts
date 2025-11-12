/**
 * Lightning effect for the night rain scene
 */
export class Lightning {
  private isActive: boolean = false;
  private duration: number = 0;
  private maxDuration: number = 200; // milliseconds
  private intensity: number = 0;
  private branches: LightningBranch[] = [];
  private lastStrike: number = 0;
  private nextStrikeDelay: number = 0;
  private onStrikeCallback?: () => void;

  constructor(onStrikeCallback?: () => void) {
    this.onStrikeCallback = onStrikeCallback;
    this.scheduleNextStrike();
  }

  /**
   * Lightning branch for more complex lightning effects
   */
  private createBranches(canvasWidth: number, canvasHeight: number): void {
    this.branches = [];
    const numBranches = Math.random() * 3 + 2; // 2-5 branches

    for (let i = 0; i < numBranches; i++) {
      const startX = Math.random() * canvasWidth;
      const startY = 0;
      const endX = startX + (Math.random() - 0.5) * canvasWidth * 0.3;
      const endY = Math.random() * canvasHeight * 0.6 + canvasHeight * 0.2;

      this.branches.push({
        startX,
        startY,
        endX,
        endY,
        segments: this.generateLightningPath(startX, startY, endX, endY)
      });
    }
  }

  /**
   * Generate zigzag path for lightning
   */
  private generateLightningPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): { x: number; y: number }[] {
    const segments: { x: number; y: number }[] = [];
    const numSegments = 8 + Math.random() * 8;

    segments.push({ x: startX, y: startY });

    for (let i = 1; i < numSegments; i++) {
      const progress = i / numSegments;
      const x =
        startX + (endX - startX) * progress + (Math.random() - 0.5) * 50;
      const y = startY + (endY - startY) * progress;
      segments.push({ x, y });
    }

    segments.push({ x: endX, y: endY });
    return segments;
  }

  /**
   * Schedule next lightning strike
   */
  private scheduleNextStrike(): void {
    this.nextStrikeDelay = Math.random() * 8000 + 2000; // 2-10 seconds
  }

  /**
   * Trigger lightning strike
   */
  public strike(canvasWidth: number, canvasHeight: number): void {
    this.isActive = true;
    this.duration = 0;
    this.intensity = Math.random() * 0.8 + 0.2;
    this.createBranches(canvasWidth, canvasHeight);
    this.lastStrike = Date.now();
    this.scheduleNextStrike();

    // Call the strike callback (for thunder sound)
    if (this.onStrikeCallback) {
      // Add slight delay for realism (light travels faster than sound)
      setTimeout(this.onStrikeCallback, 100 + Math.random() * 300);
    }
  }

  /**
   * Update lightning effect
   */
  public update(
    canvasWidth: number,
    canvasHeight: number,
    deltaTime: number
  ): void {
    if (this.isActive) {
      this.duration += deltaTime;
      if (this.duration >= this.maxDuration) {
        this.isActive = false;
      }
    } else {
      // Check if it's time for next strike
      if (Date.now() - this.lastStrike > this.nextStrikeDelay) {
        if (Math.random() < 0.3) {
          // 30% chance per check
          this.strike(canvasWidth, canvasHeight);
        }
      }
    }
  }

  /**
   * Get current lightning intensity for screen flash effect
   */
  public getFlashIntensity(): number {
    if (!this.isActive) return 0;

    const progress = this.duration / this.maxDuration;
    // Quick flash and fade
    if (progress < 0.1) {
      return this.intensity * (progress / 0.1);
    } else {
      return this.intensity * (1 - (progress - 0.1) / 0.9);
    }
  }

  /**
   * Draw lightning on canvas
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const flashIntensity = this.getFlashIntensity();

    ctx.save();
    ctx.shadowColor = "white";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = `rgba(255, 255, 255, ${flashIntensity})`;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw lightning branches
    this.branches.forEach(branch => {
      ctx.beginPath();
      branch.segments.forEach((segment, index) => {
        if (index === 0) {
          ctx.moveTo(segment.x, segment.y);
        } else {
          ctx.lineTo(segment.x, segment.y);
        }
      });
      ctx.stroke();
    });

    ctx.restore();
  }

  public get active(): boolean {
    return this.isActive;
  }
}

interface LightningBranch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  segments: { x: number; y: number }[];
}
