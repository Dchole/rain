/**
 * Guardrails system for roadside atmosphere
 */
export class Guardrails {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private posts: GuardrailPost[] = [];
  private railHeight: number = 50; // Taller posts for highway guardrails
  private postSpacing: number = 150; // Distance between posts

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.createGuardrails();
  }

  /**
   * Recalculate guardrail positions when canvas is resized
   */
  public onCanvasResize(): void {
    this.posts = [];
    this.createGuardrails();
  }

  /**
   * Create guardrail posts across the scene
   */
  private createGuardrails(): void {
    this.posts = [];

    // Calculate how many posts we need to cover the screen width
    const postCount = Math.ceil(this.canvas.width / this.postSpacing) + 1;

    // Create posts with slight random variations
    for (let i = 0; i < postCount; i++) {
      const baseX = i * this.postSpacing - 50; // Start slightly off-screen left
      const x = baseX + (Math.random() - 0.5) * 20; // Add slight variation
      const groundY = this.canvas.height - 80; // Match ground height from Ground class
      const railY = groundY - this.railHeight; // Position rails so they touch the ground edge

      this.posts.push({
        x: x,
        y: railY,
        height: this.railHeight,
        width: 8,
        weathering: Math.random() * 0.3 + 0.1 // Random weathering amount
      });
    }
  }

  /**
   * Render the guardrails
   */
  public render(): void {
    this.ctx.save();

    // Draw the continuous rail first (behind posts)
    this.drawContinuousRail();

    // Then draw the posts (in front of rail)
    this.drawPosts();

    this.ctx.restore();
  }

  /**
   * Draw the continuous horizontal rail
   */
  private drawContinuousRail(): void {
    if (this.posts.length === 0) return;

    const railY = this.posts[0].y + 15; // Position rail higher up the taller posts
    const railHeight = 8; // Slightly thicker rail for better proportion    // Main rail - metallic gray with gradient
    const railGradient = this.ctx.createLinearGradient(
      0,
      railY,
      0,
      railY + railHeight
    );
    railGradient.addColorStop(0, "#8a9ba8");
    railGradient.addColorStop(0.3, "#6b7a85");
    railGradient.addColorStop(0.7, "#4a5a65");
    railGradient.addColorStop(1, "#3a4a55");

    this.ctx.fillStyle = railGradient;
    this.ctx.fillRect(0, railY, this.canvas.width, railHeight);

    // Top highlight (wet reflection)
    this.ctx.fillStyle = "rgba(140, 160, 180, 0.4)";
    this.ctx.fillRect(0, railY, this.canvas.width, 1);

    // Bottom shadow
    this.ctx.fillStyle = "rgba(20, 30, 40, 0.6)";
    this.ctx.fillRect(0, railY + railHeight, this.canvas.width, 2);

    // Add some subtle rust/weathering spots
    this.ctx.fillStyle = "rgba(120, 80, 60, 0.3)";
    for (let x = 0; x < this.canvas.width; x += 80 + Math.random() * 40) {
      if (Math.random() < 0.4) {
        const rustWidth = 15 + Math.random() * 25;
        this.ctx.fillRect(x, railY + 1, rustWidth, railHeight - 2);
      }
    }
  }

  /**
   * Draw the support posts
   */
  private drawPosts(): void {
    this.posts.forEach(post => {
      // Don't draw posts that are off-screen
      if (post.x < -20 || post.x > this.canvas.width + 20) return;

      // Post gradient - metallic appearance
      const postGradient = this.ctx.createLinearGradient(
        post.x,
        post.y,
        post.x + post.width,
        post.y
      );
      postGradient.addColorStop(0, "#7a8a95");
      postGradient.addColorStop(0.3, "#9aabb8");
      postGradient.addColorStop(0.7, "#5a6a75");
      postGradient.addColorStop(1, "#3a4a55");

      // Draw main post
      this.ctx.fillStyle = postGradient;
      this.ctx.fillRect(post.x, post.y, post.width, post.height);

      // Left highlight (catches light)
      this.ctx.fillStyle = "rgba(160, 180, 200, 0.5)";
      this.ctx.fillRect(post.x, post.y, 1, post.height);

      // Right shadow
      this.ctx.fillStyle = "rgba(20, 30, 40, 0.7)";
      this.ctx.fillRect(post.x + post.width, post.y, 2, post.height + 3);

      // Add weathering effects
      if (post.weathering > 0.2) {
        this.ctx.fillStyle = `rgba(100, 70, 50, ${post.weathering})`;
        this.ctx.fillRect(
          post.x + 1,
          post.y + post.height * 0.6,
          post.width - 2,
          post.height * 0.3
        );
      }

      // Wet reflection on top
      this.ctx.fillStyle = "rgba(120, 140, 160, 0.3)";
      this.ctx.fillRect(post.x, post.y, post.width, 2);
    });
  }
}

/**
 * Interface for guardrail posts
 */
interface GuardrailPost {
  x: number;
  y: number;
  height: number;
  width: number;
  weathering: number; // 0-1, amount of rust/weathering
}
