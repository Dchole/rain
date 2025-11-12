/**
 * Audio Manager for the rain animation
 * Handles all audio effects including rain sounds, thunder, and ambient audio
 * Uses Web Audio API for proper volume control and effects
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private rainGainNode: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainBuffer: AudioBuffer | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private thunderBuffers: AudioBuffer[] = [];
  private isEnabled: boolean = true;
  private isRainPlaying: boolean = false;
  private masterVolume: number = 0.7;
  private rainVolume: number = 0.5;
  private thunderVolume: number = 0.8;

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context and nodes
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.createAudioNodes();
      this.createAudioBuffers();
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  /**
   * Create audio nodes for volume control and effects
   */
  private createAudioNodes(): void {
    if (!this.audioContext) return;

    // Master gain node for overall volume control
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.gain.value = this.masterVolume;
    this.masterGainNode.connect(this.audioContext.destination);

    // Rain-specific gain node
    this.rainGainNode = this.audioContext.createGain();
    this.rainGainNode.gain.value = this.rainVolume;

    // Rain filter for frequency shaping
    this.rainFilter = this.audioContext.createBiquadFilter();
    this.rainFilter.type = "lowpass";
    this.rainFilter.frequency.value = 2000;
    this.rainFilter.Q.value = 0.5;

    // Connect: rainGain -> filter -> masterGain
    this.rainGainNode.connect(this.rainFilter);
    this.rainFilter.connect(this.masterGainNode);
  }

  /**
   * Create audio buffers for rain and thunder sounds
   */
  private createAudioBuffers(): void {
    if (!this.audioContext) return;

    // Create rain buffer
    this.createRainBuffer();

    // Create thunder buffers
    this.createThunderBuffers();
  }

  /**
   * Create procedural rain sound buffer
   */
  private createRainBuffer(): void {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    this.rainBuffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const data = this.rainBuffer.getChannelData(0);

    // Generate filtered white noise for rain
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15; // White noise
    }
  }

  /**
   * Create procedural thunder sound buffers
   */
  private createThunderBuffers(): void {
    if (!this.audioContext) return;

    for (let i = 0; i < 3; i++) {
      const bufferSize = this.audioContext.sampleRate * (1 + i * 0.3); // Varying duration
      const buffer = this.audioContext.createBuffer(
        1,
        bufferSize,
        this.audioContext.sampleRate
      );
      const data = buffer.getChannelData(0);

      // Generate thunder-like noise with envelope
      for (let j = 0; j < bufferSize; j++) {
        const progress = j / bufferSize;
        const envelope =
          Math.exp(-progress * 2) *
          (1 + Math.sin(progress * Math.PI * 8) * 0.3);
        data[j] = (Math.random() * 2 - 1) * envelope * 0.3;
      }

      this.thunderBuffers.push(buffer);
    }
  }

  /**
   * Start rain audio
   */
  public startRain(): void {
    if (
      !this.isEnabled ||
      !this.audioContext ||
      !this.rainBuffer ||
      this.isRainPlaying
    )
      return;

    try {
      // Create new source node
      this.rainSource = this.audioContext.createBufferSource();
      this.rainSource.buffer = this.rainBuffer;
      this.rainSource.loop = true;

      // Connect to audio chain
      if (this.rainGainNode) {
        this.rainSource.connect(this.rainGainNode);
      }

      // Start playing
      this.rainSource.start();
      this.isRainPlaying = true;

      console.log("🌧️ Rain audio started");
    } catch (error) {
      console.warn("Failed to start rain audio:", error);
    }
  }

  /**
   * Stop rain audio
   */
  public stopRain(): void {
    if (this.rainSource && this.isRainPlaying) {
      try {
        this.rainSource.stop();
        this.rainSource.disconnect();
        this.rainSource = null;
        this.isRainPlaying = false;
        console.log("🌧️ Rain audio stopped");
      } catch (error) {
        console.warn("Error stopping rain audio:", error);
      }
    }
  }

  /**
   * Play thunder sound
   */
  public playThunder(): void {
    if (
      !this.isEnabled ||
      !this.audioContext ||
      this.thunderBuffers.length === 0
    )
      return;

    try {
      // Pick random thunder buffer
      const randomIndex = Math.floor(
        Math.random() * this.thunderBuffers.length
      );
      const buffer = this.thunderBuffers[randomIndex];

      // Create source and gain nodes
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = this.thunderVolume;

      // Connect: source -> gain -> masterGain
      source.connect(gainNode);
      if (this.masterGainNode) {
        gainNode.connect(this.masterGainNode);
      }

      // Play thunder
      source.start();

      console.log("⚡ Thunder played");
    } catch (error) {
      console.warn("Failed to play thunder:", error);
    }
  }

  /**
   * Update rain intensity (affects volume and filtering)
   */
  public updateRainIntensity(level: number): void {
    if (!this.rainGainNode || !this.rainFilter) return;

    // Scale volume with intensity (level 1-10)
    const intensityVolume = Math.min(1, (level / 10) * 1.5);
    this.rainGainNode.gain.setValueAtTime(
      this.rainVolume * intensityVolume,
      this.audioContext?.currentTime || 0
    );

    // Adjust filter frequency for intensity
    const filterFreq = 1000 + level * 300; // Higher intensity = more high frequencies
    this.rainFilter.frequency.setValueAtTime(
      filterFreq,
      this.audioContext?.currentTime || 0
    );

    console.log(`🌧️ Rain intensity updated to level ${level}`);
  }

  /**
   * Set master volume (0-1)
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    if (this.masterGainNode && this.audioContext) {
      this.masterGainNode.gain.setValueAtTime(
        this.masterVolume,
        this.audioContext.currentTime
      );
    }

    console.log(
      `🔊 Master volume set to ${Math.round(this.masterVolume * 100)}%`
    );
  }

  /**
   * Toggle audio on/off
   */
  public toggleAudio(): boolean {
    this.isEnabled = !this.isEnabled;

    if (!this.isEnabled) {
      this.stopRain();
      console.log("🔇 Audio disabled");
    } else {
      console.log("🔊 Audio enabled");
    }

    return this.isEnabled;
  }

  /**
   * Enable audio context (required for user interaction)
   */
  public async enableAudio(): Promise<boolean> {
    if (this.audioContext?.state === "suspended") {
      try {
        await this.audioContext.resume();
        console.log("🎵 Audio context resumed");
        return true;
      } catch (error) {
        console.warn("Failed to resume audio context:", error);
        return false;
      }
    }
    return true;
  }

  /**
   * Get current audio state
   */
  public getState(): {
    enabled: boolean;
    masterVolume: number;
    contextState: string;
    rainPlaying: boolean;
  } {
    return {
      enabled: this.isEnabled,
      masterVolume: this.masterVolume,
      contextState: this.audioContext?.state || "unavailable",
      rainPlaying: this.isRainPlaying
    };
  }
}
