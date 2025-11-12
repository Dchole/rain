/**
 * Represents a single raindrop in the animation with realistic physics.
 *
 * Physics Features:
 * - Gravitational acceleration: Raindrops start slow and accelerate downward
 * - Terminal velocity: Each raindrop reaches a maximum falling speed based on its mass
 * - Air resistance: Slight drag effect that increases with velocity
 * - Mass-based physics: Larger raindrops fall faster and have higher terminal velocity
 * - Wind effects: Subtle horizontal movement simulating wind currents
 *
 * This creates a much more realistic rain animation where raindrops behave
 * according to real-world physics principles.
 */
export class Raindrop {
  public x: number;
  public y: number;
  public speed: number;
  public length: number;
  public opacity: number;
  public width: number;

  // Physics properties for realistic acceleration
  public velocityY: number;
  public acceleration: number;
  public terminalVelocity: number;
  public mass: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight - canvasHeight;
    this.speed = Math.random() * 10 + 5; // Speed between 5-15 (kept for backward compatibility)
    this.length = Math.random() * 20 + 10; // Length between 10-30
    this.opacity = Math.random() * 0.6 + 0.4; // Opacity between 0.4-1
    this.width = Math.random() * 2 + 1; // Width between 1-3

    // Initialize physics properties
    this.velocityY = Math.random() * 2 + 1; // Initial velocity (1-3 pixels/frame)
    this.mass = this.width * this.length * 0.1; // Mass based on size
    this.acceleration = 0.3 + Math.random() * 0.2; // Gravity effect (0.3-0.5)
    this.terminalVelocity = 8 + this.mass * 2; // Terminal velocity based on mass (8-16)
  }

  /**
   * Update raindrop position with realistic physics
   */
  update(canvasHeight: number): void {
    // Apply gravity acceleration until terminal velocity is reached
    if (this.velocityY < this.terminalVelocity) {
      this.velocityY += this.acceleration;

      // Add slight air resistance effect as velocity increases
      const airResistance = this.velocityY * 0.02;
      this.velocityY -= airResistance;

      // Ensure we don't exceed terminal velocity
      this.velocityY = Math.min(this.velocityY, this.terminalVelocity);
    }

    // Update position based on current velocity
    this.y += this.velocityY;

    // Add slight horizontal movement for wind effect (more realistic)
    const windEffect =
      Math.sin(this.y * 0.008) * 0.3 + Math.sin(this.y * 0.015) * 0.2;
    this.x += windEffect;

    // Keep backward compatibility with speed property
    this.speed = this.velocityY;
  }

  /**
   * Check if raindrop is out of bounds
   */
  isOutOfBounds(canvasHeight: number): boolean {
    return this.y > canvasHeight + this.length;
  }

  /**
   * Reset raindrop to top of screen
   */
  reset(canvasWidth: number): void {
    this.x = Math.random() * canvasWidth;
    this.y = -this.length;
    this.length = Math.random() * 20 + 10;
    this.opacity = Math.random() * 0.6 + 0.4;

    // Reset physics properties for new raindrop
    this.velocityY = Math.random() * 2 + 1; // Start with small initial velocity
    this.mass = this.width * this.length * 0.1; // Recalculate mass
    this.acceleration = 0.3 + Math.random() * 0.2; // Vary gravity effect slightly
    this.terminalVelocity = 8 + this.mass * 2; // Recalculate terminal velocity
    this.speed = this.velocityY; // Keep backward compatibility
  }

  /**
   * Draw the raindrop on canvas
   */
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Create gradient for raindrop (realistic: tail at top, heavy droplet at bottom)
    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.length
    );
    gradient.addColorStop(0, `rgba(135, 206, 235, ${this.opacity * 0.1})`); // Top: very faint tail
    gradient.addColorStop(0.3, `rgba(153, 221, 255, ${this.opacity * 0.4})`); // Upper middle: building up
    gradient.addColorStop(0.7, `rgba(173, 216, 230, ${this.opacity * 0.8})`); // Lower middle: getting solid
    gradient.addColorStop(1, `rgba(100, 149, 237, ${this.opacity})`);

    // Draw the main raindrop line with gradient
    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.width;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.length);
    ctx.stroke();

    // Add a slightly thicker droplet at the bottom for more realistic shape
    ctx.fillStyle = `rgba(100, 149, 237, ${this.opacity * 0.8})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.length, this.width * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
