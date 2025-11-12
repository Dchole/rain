/**
 * Ground system that handles ground surface and splash effects
 */
export class Ground {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private groundHeight: number = 80;
  private splashes: Splash[] = [];
  private puddles: Puddle[] = [];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.createPuddles();
  }

  /**
   * Get the Y coordinate of the ground surface
   */
  public getGroundY(): number {
    return this.canvas.height - this.groundHeight;
  }

  /**
   * Get the maximum puddle height (depth) for collision calculations
   */
  public getMaxPuddleHeight(): number {
    if (this.puddles.length === 0) return 20; // Default depth if no puddles
    return Math.max(...this.puddles.map(p => p.height));
  }

  /**
   * Recalculate puddle positions when canvas is resized
   */
  public onCanvasResize(): void {
    // Clear existing puddles and recreate them for the new canvas size
    this.puddles = [];
    this.createPuddles();
  }

  /**
   * Create 3 specific puddles: medium, huge+attached smaller, and small
   */
  private createPuddles(): void {
    this.puddles = [];

    // Calculate positions to spread across screen
    const screenWidth = this.canvas.width;
    const section1 = screenWidth * 0.2; // Left area (20%)
    const section2 = screenWidth * 0.5; // Center area (50%)
    const section3 = screenWidth * 0.8; // Right area (80%)

    // 1. Medium puddle (left side)
    const mediumWidth = 120 + Math.random() * 40; // 120-160px
    const mediumHeight = 20 + Math.random() * 10; // 20-30px
    this.puddles.push({
      x: section1 - mediumWidth / 2,
      width: mediumWidth,
      height: mediumHeight,
      ripples: []
    });

    // 2. Compound puddle (center) - looks like two overlapping puddles
    const mainWidth = 220 + Math.random() * 60; // 220-280px (large main puddle)
    const mainHeight = 35 + Math.random() * 15; // 35-50px (tall!)
    const compoundX = section2 - mainWidth / 2;

    // Create a special compound puddle that will be rendered as overlapping shapes
    this.puddles.push({
      x: compoundX,
      width: mainWidth,
      height: mainHeight,
      ripples: [],
      // Add special properties to indicate this is a compound puddle
      isCompound: true,
      smallerWidth: 80 + Math.random() * 30, // 80-110px (smaller attached part)
      smallerHeight: 18 + Math.random() * 12, // 18-30px
      overlapOffset: mainWidth * 0.7 // Overlap position (70% along main puddle)
    } as any);

    // Remove the separate attached puddle since it's now part of the compound puddle

    // 4. Small puddle (right side)
    const smallWidth = 50 + Math.random() * 30; // 50-80px (small)
    const smallHeight = 12 + Math.random() * 6; // 12-18px
    this.puddles.push({
      x: section3 - smallWidth / 2,
      width: smallWidth,
      height: smallHeight,
      ripples: []
    });

    // Ensure all puddles stay within screen bounds
    this.puddles.forEach(puddle => {
      if (puddle.x < 10) puddle.x = 10;
      if (puddle.x + puddle.width > screenWidth - 10) {
        puddle.x = screenWidth - puddle.width - 10;
      }
    });
  }

  /**
   * Add splash effect when raindrop hits ground or puddle
   */
  public addSplash(x: number, y: number): void {
    const groundY = this.getGroundY();

    // Find the largest puddle height to determine the maximum depth range
    const maxPuddleHeight = Math.max(...this.puddles.map(p => p.height));
    const puddleDepthRange = groundY + maxPuddleHeight + 5; // Allow hits within full puddle depth

    // Check if raindrop hits a puddle
    let hitPuddle = false;
    for (const puddle of this.puddles) {
      const isCompound = (puddle as any).isCompound;

      if (isCompound) {
        // Check collision with compound puddle (main puddle + smaller overlapping puddle)
        const mainLeft = puddle.x;
        const mainRight = puddle.x + puddle.width;

        const smallerWidth = (puddle as any).smallerWidth;
        const overlapOffset = (puddle as any).overlapOffset;
        const smallerLeft = puddle.x + overlapOffset;
        const smallerRight = smallerLeft + smallerWidth;

        // Check if raindrop hits either part of the compound puddle below ground edge
        const hitMain = x >= mainLeft && x <= mainRight;
        const hitSmaller = x >= smallerLeft && x <= smallerRight;
        const puddleBottom = groundY + puddle.height + 5; // Full depth below ground

        if ((hitMain || hitSmaller) && y > groundY && y <= puddleBottom) {
          // Hit compound puddle - create ripple effect AND splash particles
          this.addRipple(puddle, x, y);
          this.createSplashParticles(x, y); // Splash at raindrop impact depth
          hitPuddle = true;
          break;
        }
      } else {
        // Regular single puddle collision
        const puddleLeft = puddle.x;
        const puddleRight = puddle.x + puddle.width;
        const puddleBottom = groundY + puddle.height + 5; // Full depth below ground

        // Check if raindrop hits this puddle area below the ground edge
        if (
          x >= puddleLeft &&
          x <= puddleRight &&
          y > groundY &&
          y <= puddleBottom
        ) {
          // Hit a puddle - create ripple effect AND splash particles
          this.addRipple(puddle, x, y);
          this.createSplashParticles(x, y); // Splash at raindrop impact depth
          hitPuddle = true;
          break;
        }
      }
    }

    if (!hitPuddle && y > groundY) {
      // Hit dry ground - create splash particles at impact depth
      this.createSplashParticles(x, y);
    }
  }

  /**
   * Create splash particles at the specified position
   */
  private createSplashParticles(x: number, y: number): void {
    const particleCount = 3 + Math.floor(Math.random() * 4); // 3-6 particles

    for (let i = 0; i < particleCount; i++) {
      this.splashes.push({
        x: x + (Math.random() - 0.5) * 8, // Spread particles around impact point
        y: y, // Splash at specified position (below ground edge)
        velocityX: (Math.random() - 0.5) * 60, // Random horizontal velocity
        velocityY: -20 - Math.random() * 30, // Upward velocity with randomness
        life: 1.0, // Full life
        maxLife: 0.3 + Math.random() * 0.4, // 0.3-0.7 seconds
        size: 1 + Math.random() * 2, // 1-3px size
        impactY: y // Remember the original impact position
      });
    }

    // Limit total number of splashes for performance
    if (this.splashes.length > 200) {
      this.splashes = this.splashes.slice(-150); // Keep most recent 150
    }
  }

  /**
   * Add ripple effect to a puddle
   */
  private addRipple(puddle: Puddle, x: number, y: number): void {
    const puddleCenterX = puddle.x + puddle.width / 2;
    const waterSurfaceY = this.getGroundY() + 7; // Water surface position

    // Calculate proportional max radius based on puddle size
    // Use the smaller dimension to ensure ripples stay within puddle bounds
    const avgPuddleSize = (puddle.width + puddle.height) / 2;
    const maxRadius = Math.min(
      puddle.width * 0.4,
      puddle.height * 0.4,
      avgPuddleSize * 0.6
    );

    // Create ripple at impact point relative to puddle center
    puddle.ripples.push({
      x: x - puddleCenterX,
      y: 0, // Ripples spread on surface, not vertically
      radius: 0,
      opacity: 1,
      maxRadius: maxRadius, // Proportional to puddle size
      time: 0
    });

    // Limit ripples per puddle
    if (puddle.ripples.length > 6) {
      puddle.ripples.shift();
    }
  }

  /**
   * Update splash and ripple animations
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
      splash.life -= (deltaTime * 0.001) / splash.maxLife;

      // Remove if dead or if particle has fallen back to its original impact position
      return splash.life > 0 && splash.y <= splash.impactY;
    });

    // Update ripples in all puddles
    this.puddles.forEach(puddle => {
      puddle.ripples = puddle.ripples.filter(ripple => {
        ripple.time += deltaTime * 0.001;
        ripple.radius = ripple.time * 20; // Expand at realistic 20px/second
        ripple.opacity = Math.max(0, 1 - ripple.time * 1.2); // Fade out over ~0.8 seconds

        // Remove ripple when it's too large or faded
        return ripple.radius < ripple.maxRadius && ripple.opacity > 0;
      });
    });
  }

  /**
   * Render the ground, puddles, and splash effects
   */
  public render(): void {
    this.drawGround();
    this.drawPuddles();
    this.drawSplashes();
  }

  /**
   * Draw the ground surface
   */
  private drawGround(): void {
    const groundY = this.getGroundY();

    this.ctx.save();

    // Ground surface gradient
    const gradient = this.ctx.createLinearGradient(
      0,
      groundY,
      0,
      this.canvas.height
    );
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
        this.ctx.fillRect(
          i,
          groundY + 5 + Math.random() * 10,
          10 + Math.random() * 10,
          2
        );
      }
    }

    this.ctx.restore();
  }

  /**
   * Draw puddles and their ripple effects
   */
  private drawPuddles(): void {
    const groundY = this.getGroundY();

    this.ctx.save();

    this.puddles.forEach(puddle => {
      // Position puddles below the ground level (like small depressions)
      const puddleTop = groundY + 5;
      const puddleBottom = puddleTop + puddle.height;

      // Check if this is a compound puddle
      const isCompound = (puddle as any).isCompound;

      if (isCompound) {
        // Draw compound puddle (main puddle + smaller overlapping puddle)
        const mainCenterX = puddle.x + puddle.width / 2;
        const mainCenterY = puddleTop + puddle.height / 2;

        const smallerWidth = (puddle as any).smallerWidth;
        const smallerHeight = (puddle as any).smallerHeight;
        const overlapOffset = (puddle as any).overlapOffset;

        // Position the smaller puddle to overlap with the main one
        const smallerCenterX = puddle.x + overlapOffset + smallerWidth / 2;
        const smallerCenterY = puddleTop + smallerHeight / 2;

        // Draw main puddle (single layer - water in depression)
        this.ctx.fillStyle = "rgba(80, 120, 160, 0.9)";
        this.ctx.beginPath();
        this.ctx.ellipse(
          mainCenterX,
          mainCenterY,
          puddle.width / 2,
          puddle.height / 2,
          0,
          0,
          Math.PI * 2
        );
        this.ctx.fill();

        // Draw smaller overlapping puddle (single layer)
        this.ctx.fillStyle = "rgba(75, 115, 155, 0.9)"; // Slightly different shade
        this.ctx.beginPath();
        this.ctx.ellipse(
          smallerCenterX,
          smallerCenterY,
          smallerWidth / 2,
          smallerHeight / 2,
          0,
          0,
          Math.PI * 2
        );
        this.ctx.fill();

        // Add subtle reflections on both puddles
        this.ctx.fillStyle = "rgba(140, 170, 200, 0.4)";
        this.ctx.beginPath();
        this.ctx.ellipse(
          mainCenterX - puddle.width * 0.15,
          mainCenterY - puddle.height * 0.15,
          (puddle.width / 2) * 0.4,
          (puddle.height / 2) * 0.25,
          0,
          0,
          Math.PI * 2
        );
        this.ctx.fill();

        // Smaller puddle reflection
        this.ctx.beginPath();
        this.ctx.ellipse(
          smallerCenterX - smallerWidth * 0.15,
          smallerCenterY - smallerHeight * 0.15,
          (smallerWidth / 2) * 0.4,
          (smallerHeight / 2) * 0.25,
          0,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      } else {
        // Draw regular single puddle (single layer - water in depression)
        const puddleCenterX = puddle.x + puddle.width / 2;
        const puddleCenterY = puddleTop + puddle.height / 2;

        // Draw puddle as water in depression (single layer)
        this.ctx.fillStyle = "rgba(80, 120, 160, 0.9)";
        this.ctx.beginPath();
        this.ctx.ellipse(
          puddleCenterX,
          puddleCenterY,
          puddle.width / 2,
          puddle.height / 2,
          0,
          0,
          Math.PI * 2
        );
        this.ctx.fill();

        // Add subtle reflection
        this.ctx.fillStyle = "rgba(140, 170, 200, 0.4)";
        this.ctx.beginPath();
        this.ctx.ellipse(
          puddleCenterX - puddle.width * 0.15,
          puddleCenterY - puddle.height * 0.15,
          (puddle.width / 2) * 0.4,
          (puddle.height / 2) * 0.25,
          0,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      }

      // Draw ripples on water surface (works for both compound and regular puddles)
      const puddleCenterX = puddle.x + puddle.width / 2;
      const puddleCenterY = puddleTop + puddle.height / 2;
      const puddleIsCompound = (puddle as any).isCompound;

      puddle.ripples.forEach(ripple => {
        // Calculate ripple dimensions to match puddle shape proportionally
        const rippleScale = ripple.radius / ripple.maxRadius;

        // Scale ripples proportionally to puddle dimensions
        // Use a scaling factor that makes larger puddles have larger ripples
        const sizeScale = Math.sqrt(puddle.width * puddle.height) / 100; // Normalize based on puddle area
        const rippleWidthRadius =
          (puddle.width / 2) * rippleScale * (0.6 + sizeScale * 0.3);
        const rippleHeightRadius =
          (puddle.height / 2) * rippleScale * (0.6 + sizeScale * 0.3);

        // Only draw ripples that are within reasonable size bounds
        if (rippleScale <= 1.0 && rippleWidthRadius > 1) {
          this.ctx.strokeStyle = `rgba(200, 220, 255, ${ripple.opacity * 0.6})`;
          this.ctx.lineWidth = 1.0;
          this.ctx.beginPath();

          // Draw ripple as ellipse matching puddle proportions
          this.ctx.ellipse(
            puddleCenterX + ripple.x,
            puddleCenterY + ripple.y * 0.3, // Slight Y offset for natural look
            rippleWidthRadius, // Width matches puddle width proportionally
            rippleHeightRadius, // Height matches puddle height proportionally
            0,
            0,
            Math.PI * 2
          );
          this.ctx.stroke();

          // For compound puddles, also draw ripple on the smaller overlapping part if close enough
          if (puddleIsCompound) {
            const smallerWidth = (puddle as any).smallerWidth;
            const smallerHeight = (puddle as any).smallerHeight;
            const overlapOffset = (puddle as any).overlapOffset;
            const smallerCenterX = puddle.x + overlapOffset + smallerWidth / 2;
            const smallerCenterY = puddleCenterY;

            // Check if ripple origin is closer to the smaller puddle part
            const distToMain = Math.abs(
              puddleCenterX + ripple.x - puddleCenterX
            );
            const distToSmaller = Math.abs(
              puddleCenterX + ripple.x - smallerCenterX
            );

            if (distToSmaller < distToMain && rippleScale <= 1.0) {
              // Scale smaller puddle ripples proportionally
              const smallerSizeScale =
                Math.sqrt(smallerWidth * smallerHeight) / 100;
              const smallerRippleWidthRadius =
                (smallerWidth / 2) *
                rippleScale *
                (0.6 + smallerSizeScale * 0.3);
              const smallerRippleHeightRadius =
                (smallerHeight / 2) *
                rippleScale *
                (0.6 + smallerSizeScale * 0.3);

              if (smallerRippleWidthRadius > 1) {
                this.ctx.strokeStyle = `rgba(190, 210, 245, ${
                  ripple.opacity * 0.5
                })`;
                this.ctx.beginPath();
                this.ctx.ellipse(
                  smallerCenterX + ripple.x * 0.7, // Slightly different offset for smaller puddle
                  smallerCenterY + ripple.y * 0.2,
                  smallerRippleWidthRadius,
                  smallerRippleHeightRadius,
                  0,
                  0,
                  Math.PI * 2
                );
                this.ctx.stroke();
              }
            }
          }
        }
      });
    });

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
  impactY: number; // Original Y position where raindrop hit
}

/**
 * Interface for puddles on the ground
 */
interface Puddle {
  x: number;
  width: number;
  height: number;
  ripples: Ripple[];
}

/**
 * Interface for ripple effects on puddles
 */
interface Ripple {
  x: number; // Position relative to puddle center
  y: number; // Position relative to puddle center
  radius: number;
  opacity: number;
  maxRadius: number;
  time: number;
}
