/**
 * Street lamps system for atmospheric lighting
 */
export class StreetLamps {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lamps: StreetLamp[] = [];
  private lampCount: number = 2; // Just 2 lamps (no middle)
  private lampHeight: number = 700; // Much taller lamps

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.createStreetLamps();
  }

  /**
   * Recalculate street lamp positions when canvas is resized
   */
  public onCanvasResize(): void {
    this.lamps = [];
    this.createStreetLamps();
  }

  /**
   * Create street lamps across the scene
   */
  private createStreetLamps(): void {
    this.lamps = [];

    const groundY = this.canvas.height - 80; // Match ground height
    const lampY = groundY - this.lampHeight; // Position lamp above ground

    // Create exactly 2 lamps positioned on left and right
    const positions = [
      this.canvas.width * 0.25, // Left lamp (25% across)
      this.canvas.width * 0.75 // Right lamp (75% across)
    ];

    for (let i = 0; i < this.lampCount; i++) {
      const baseX = positions[i];
      const x = baseX + (Math.random() - 0.5) * 20; // Add slight variation

      this.lamps.push({
        x: x,
        y: lampY,
        height: this.lampHeight,
        poleWidth: 24, // Massive thick poles for close-up scene
        lightIntensity: 0.9, // Consistent intensity, no variation
        flickerPhase: 0, // No animation
        lightRadius: 400 + Math.random() * 80 // Huge light pools for close-up
      });
    }
  }

  /**
   * Update lamp animations (no animation needed - steady lights)
   */
  public update(deltaTime: number): void {
    // No animation - lamps have steady lighting
  }

  /**
   * Render the street lamps and their lighting effects
   */
  public render(): void {
    this.ctx.save();

    // Draw light effects first (behind everything)
    this.drawLightEffects();

    // Then draw the lamp structures
    this.drawLampStructures();

    this.ctx.restore();
  }

  /**
   * Draw the lighting effects from the lamps
   */
  private drawLightEffects(): void {
    this.lamps.forEach(lamp => {
      // Don't draw lights that are off-screen
      if (lamp.x < -150 || lamp.x > this.canvas.width + 150) return;

      // Steady lighting - no flicker
      const currentIntensity = lamp.lightIntensity;
      const currentRadius = lamp.lightRadius;

      const lightX = lamp.x;
      const lightY = lamp.y + 8; // Light source position
      const groundY = this.canvas.height - 80;

      // Create radial gradient for light pool
      const lightGradient = this.ctx.createRadialGradient(
        lightX,
        lightY,
        0,
        lightX,
        lightY,
        currentRadius
      );

      // Warm yellow/orange light color
      const lightColor = `rgba(255, 220, 150, ${currentIntensity * 0.3})`;
      const lightEdge = `rgba(255, 200, 120, 0)`;

      lightGradient.addColorStop(0, lightColor);
      lightGradient.addColorStop(
        0.3,
        `rgba(255, 210, 140, ${currentIntensity * 0.2})`
      );
      lightGradient.addColorStop(
        0.6,
        `rgba(255, 200, 130, ${currentIntensity * 0.1})`
      );
      lightGradient.addColorStop(1, lightEdge);

      // Draw main light pool
      this.ctx.fillStyle = lightGradient;
      this.ctx.beginPath();
      this.ctx.ellipse(
        lightX,
        groundY - 10, // Center light pool on ground area
        currentRadius * 1.2, // Wider horizontally
        currentRadius * 0.7, // Shorter vertically for realistic ground projection
        0,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Add bright center spot
      const centerGradient = this.ctx.createRadialGradient(
        lightX,
        lightY,
        0,
        lightX,
        lightY,
        20
      );
      centerGradient.addColorStop(
        0,
        `rgba(255, 240, 180, ${currentIntensity * 0.6})`
      );
      centerGradient.addColorStop(1, `rgba(255, 220, 150, 0)`);

      this.ctx.fillStyle = centerGradient;
      this.ctx.beginPath();
      this.ctx.arc(lightX, lightY, 25, 0, Math.PI * 2);
      this.ctx.fill();

      // Add atmospheric glow effect
      const glowGradient = this.ctx.createRadialGradient(
        lightX,
        lightY,
        0,
        lightX,
        lightY,
        currentRadius * 1.5
      );
      glowGradient.addColorStop(
        0,
        `rgba(255, 220, 150, ${currentIntensity * 0.1})`
      );
      glowGradient.addColorStop(
        0.5,
        `rgba(255, 200, 120, ${currentIntensity * 0.05})`
      );
      glowGradient.addColorStop(1, `rgba(255, 180, 100, 0)`);

      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.ellipse(
        lightX,
        lightY - 20,
        currentRadius * 0.8,
        currentRadius * 1.2,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
  }

  /**
   * Draw the physical lamp structures
   */
  private drawLampStructures(): void {
    this.lamps.forEach(lamp => {
      // Don't draw lamps that are off-screen
      if (lamp.x < -50 || lamp.x > this.canvas.width + 50) return;

      const groundY = this.canvas.height - 80;

      // Draw lamp pole
      const poleGradient = this.ctx.createLinearGradient(
        lamp.x - lamp.poleWidth / 2,
        0,
        lamp.x + lamp.poleWidth / 2,
        0
      );
      poleGradient.addColorStop(0, "#2a3a4a");
      poleGradient.addColorStop(0.3, "#4a5a6a");
      poleGradient.addColorStop(0.7, "#3a4a5a");
      poleGradient.addColorStop(1, "#1a2a3a");

      this.ctx.fillStyle = poleGradient;
      this.ctx.fillRect(
        lamp.x - lamp.poleWidth / 2,
        lamp.y,
        lamp.poleWidth,
        lamp.height
      );

      // Add pole highlight (wet reflection)
      this.ctx.fillStyle = "rgba(120, 140, 160, 0.3)";
      this.ctx.fillRect(lamp.x - lamp.poleWidth / 2, lamp.y, 1, lamp.height);

      // Draw lamp head (massive for close-up scene)
      const headWidth = 70;
      const headHeight = 45;
      const headY = lamp.y - 15;

      // Lamp housing
      this.ctx.fillStyle = "#3a4a5a";
      this.ctx.fillRect(lamp.x - headWidth / 2, headY, headWidth, headHeight);

      // Light source (steady glowing bulb)
      const bulbIntensity = lamp.lightIntensity;

      this.ctx.fillStyle = `rgba(255, 230, 160, ${bulbIntensity})`;
      this.ctx.fillRect(
        lamp.x - headWidth / 2 + 2,
        headY + 2,
        headWidth - 4,
        headHeight - 4
      );

      // Bright bulb center (massive for close-up scene)
      this.ctx.fillStyle = `rgba(255, 245, 200, ${bulbIntensity * 0.8})`;
      this.ctx.fillRect(lamp.x - 16, headY + 8, 32, headHeight - 16);

      // Lamp housing shadow
      this.ctx.fillStyle = "rgba(10, 20, 30, 0.8)";
      this.ctx.fillRect(lamp.x + headWidth / 2, headY + 2, 2, headHeight + 2);
    });
  }
}

/**
 * Interface for street lamp objects
 */
interface StreetLamp {
  x: number;
  y: number;
  height: number;
  poleWidth: number;
  lightIntensity: number; // 0-1
  flickerPhase: number; // For animation
  lightRadius: number; // Size of light pool
}
