/**
 * Ground system that handles ground surface and splash effects
 */
export class Ground {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private groundHeight: number = 80;
  private splashes: Splash[] = [];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Get the Y coordinate of the ground surface
   */
  public getGroundY(): number {
    return this.canvas.height - this.groundHeight;
  }

  /**
   * Add splash effect when raindrop hits ground
   */
  public addSplash(x: number, y: number): void {
    // Create splash particles
    const particleCount = 3 + Math.floor(Math.random() * 4); // 3-6 particles
    
    for (let i = 0; i < particleCount; i++) {
      this.splashes.push({
        x: x + (Math.random() - 0.5) * 8, // Spread particles around impact point
        y: y,
        velocityX: (Math.random() - 0.5) * 60, // Random horizontal velocity
        velocityY: -20 - Math.random() * 30, // Upward velocity with randomness
        life: 1.0, // Full life
        maxLife: 0.3 + Math.random() * 0.4, // 0.3-0.7 seconds
        size: 1 + Math.random() * 2 // 1-3px size
      });
    }

    // Limit total number of splashes for performance
    if (this.splashes.length > 200) {
      this.splashes = this.splashes.slice(-150); // Keep most recent 150
    }
  }

  /**
   * Update splash animations
   */
  public update(deltaTime: number): void {
    // Update each splash particle
    this.splashes = this.splashes.filter(splash => {
      // Update physics
      splash.x += splash.velocityX * deltaTime * 0.001;
      splash.y += splash.velocityY * deltaTime * 0.001;
      
      // Apply gravity
      splash.velocityY += 980 * deltaTime * 0.001; // 980 px/s² gravity
      
      // Apply air resistance
      splash.velocityX *= 0.98;
      splash.velocityY *= 0.995;
      
      // Update life
      splash.life -= deltaTime * 0.001 / splash.maxLife;
      
      // Remove if dead or below ground
      return splash.life > 0 && splash.y < this.getGroundY() + 10;
    });
  }

  /**
   * Render the ground and splash effects
   */
  public render(): void {
    this.drawGround();
    this.drawSplashes();
  }

  /**
   * Draw the ground surface
   */
  private drawGround(): void {
    const groundY = this.getGroundY();
    
    this.ctx.save();
    
    // Ground surface gradient
    const gradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
    gradient.addColorStop(0, "#2a2a2a"); // Dark ground surface
    gradient.addColorStop(0.3, "#1a1a1a"); // Darker ground
    gradient.addColorStop(1, "#0a0a0a"); // Very dark underground
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, groundY, this.canvas.width, this.groundHeight);
    
    // Ground surface highlight (wet look)
    this.ctx.fillStyle = "rgba(100, 100, 120, 0.3)";
    this.ctx.fillRect(0, groundY, this.canvas.width, 2);
    
    // Add some subtle texture to the ground
    this.ctx.fillStyle = "rgba(80, 80, 90, 0.2)";
    for (let i = 0; i < this.canvas.width; i += 20) {
      if (Math.random() < 0.3) {
        this.ctx.fillRect(i, groundY + 5 + Math.random() * 10, 10 + Math.random() * 10, 2);
      }
    }
    
    this.ctx.restore();
  }

  /**
   * Draw splash particle effects
   */
  private drawSplashes(): void {
    this.ctx.save();
    
    this.splashes.forEach(splash => {
      const alpha = splash.life * 0.8; // Fade out as life decreases
      const size = splash.size * (0.5 + splash.life * 0.5); // Shrink as it dies
      
      // Draw splash particle as small droplet
      this.ctx.fillStyle = `rgba(150, 180, 220, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.ellipse(
        splash.x,
        splash.y,
        size * 0.8, // Width
        size, // Height (slightly taller)
        0,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Add slight highlight
      this.ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.5})`;
      this.ctx.beginPath();
      this.ctx.ellipse(
        splash.x - size * 0.2,
        splash.y - size * 0.3,
        size * 0.3,
        size * 0.4,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
    
    this.ctx.restore();
  }
}

/**
 * Interface for splash particles
 */
interface Splash {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number; // 0-1, where 1 is full life
  maxLife: number; // Maximum life duration in seconds
  size: number;
}