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
  private rainVolume: number = 0.3; // Quieter rain to let thunder dominate
  private thunderVolume: number = 3.5; // MUCH LOUDER thunder!

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
   * Create natural rumbling thunder sound buffers
   */
  private createThunderBuffers(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;

    for (let i = 0; i < 3; i++) {
      const duration = 3 + i * 0.8; // 3-5.6 seconds of rumble
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate natural thunder rumble
      for (let j = 0; j < bufferSize; j++) {
        const time = j / sampleRate;
        const progress = j / bufferSize;

        // Natural thunder envelope - quick crack then long rumble
        let envelope;
        if (progress < 0.05) {
          // Initial crack
          envelope = 1.0;
        } else {
          // Long rumbling decay
          envelope = Math.exp(-(progress - 0.05) * 2.5) * 0.8;
        }

        // Base noise for natural rumble texture
        let sample = (Math.random() * 2 - 1) * 0.4;

        // Low-frequency rumble modulation (creates the rolling effect)
        const rumbleFreq = 0.8 + Math.sin(time * 0.5) * 0.3; // Very slow modulation
        const rumbleMod = Math.sin(time * Math.PI * 2 * rumbleFreq) * 0.6;
        sample *= 1 + rumbleMod;

        // Add some deeper bass texture
        const bassRumble =
          Math.sin(time * Math.PI * 2 * (40 + Math.sin(time) * 20)) * 0.3;
        sample += bassRumble;

        // Initial crack sound (only at the beginning)
        if (progress < 0.1) {
          const crack = (Math.random() * 2 - 1) * (1 - progress * 10) * 0.5;
          sample += crack;
        }

        // Apply envelope and ensure natural sound
        sample *= envelope;

        // Boost the power for LOUD thunder
        sample *= 1.4; // Significant amplitude boost
        if (sample > 0.95) sample = 0.95 + (sample - 0.95) * 0.1;
        if (sample < -0.95) sample = -0.95 + (sample + 0.95) * 0.1;

        data[j] = sample * 0.9; // Much higher final volume
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
   * Play natural rumbling thunder sound
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

      // Create simple audio chain for natural sound
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const lowPassFilter = this.audioContext.createBiquadFilter();

      source.buffer = buffer;

      // Simple low-pass filter to emphasize the rumble
      lowPassFilter.type = "lowpass";
      lowPassFilter.frequency.value = 150; // Cut harsh highs, keep rumble
      lowPassFilter.Q.value = 0.7;

      // Set powerful volume
      gainNode.gain.value = this.thunderVolume;

      // Simple chain: source -> filter -> gain -> master
      source.connect(lowPassFilter);
      lowPassFilter.connect(gainNode);
      if (this.masterGainNode) {
        gainNode.connect(this.masterGainNode);
      }

      // Play natural thunder rumble
      source.start();

      console.log("⚡ Natural thunder rumble!");
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
