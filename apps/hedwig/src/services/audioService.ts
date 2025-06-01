import { Audio } from 'expo-av';

export interface SoundAsset {
  alert: number;
  buttonPress: number;
  notification: number;
  scanError: number;
  scanSuccess: number;
}

export class AudioService {
  private static sounds = new Map<string, Audio.Sound>();
  private static isInitialized = false;
  private static isEnabled = true;

  // Sound file paths (will be loaded from assets if available)
  private static readonly SOUND_ASSETS: Record<string, any> = {};

  /**
   * Initialize audio service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request audio permissions and set audio mode
      await Audio.requestPermissionsAsync();
      
      await Audio.setAudioModeAsync({
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
      });

      // Preload sounds
      await this.preloadSounds();
      
      this.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  /**
   * Preload all sound files
   */
  private static async preloadSounds(): Promise<void> {
    try {
      console.log('Audio service: Sound files not available, running in silent mode');
      // For now, skip preloading since sound files are not available
      // This allows the app to build without requiring actual sound files
    } catch (error) {
      console.error('Failed to preload sounds:', error);
    }
  }

  /**
   * Play a sound by key
   */
  private static async playSound(soundKey: string, volume = 1.0): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const sound = this.sounds.get(soundKey);
      if (!sound) {
        console.warn(`Sound not found: ${soundKey}`);
        return;
      }

      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(volume);
      await sound.playAsync();
    } catch (error) {
      console.error(`Failed to play sound ${soundKey}:`, error);
    }
  }

  /**
   * Play scan success sound
   */
  static async playScanSuccess(): Promise<void> {
    await this.playSound('scanSuccess', 0.8);
  }

  /**
   * Play scan error sound
   */
  static async playScanError(): Promise<void> {
    await this.playSound('scanError', 0.6);
  }

  /**
   * Play notification sound
   */
  static async playNotification(): Promise<void> {
    await this.playSound('notification', 0.7);
  }

  /**
   * Play button press sound
   */
  static async playButtonPress(): Promise<void> {
    await this.playSound('buttonPress', 0.5);
  }

  /**
   * Play alert sound
   */
  static async playAlert(): Promise<void> {
    await this.playSound('alert', 0.9);
  }

  /**
   * Enable/disable all sounds
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  static getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Play custom sound from URL
   */
  static async playCustomSound(
    soundUri: string, 
    options?: {
      volume?: number;
      loop?: boolean;
      rate?: number;
    }
  ): Promise<Audio.Sound | null> {
    if (!this.isEnabled) return null;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUri },
        {
          isLooping: options?.loop || false,
          rate: options?.rate || 1.0,
          shouldPlay: true,
          volume: options?.volume || 1.0,
        }
      );

      // Auto-unload after playing (if not looping)
      if (!options?.loop) {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }

      return sound;
    } catch (error) {
      console.error('Failed to play custom sound:', error);
      return null;
    }
  }

  /**
   * Create audio feedback pattern
   */
  static async playPattern(pattern: 'double-beep' | 'triple-beep' | 'success-jingle'): Promise<void> {
    if (!this.isEnabled) return;

    switch (pattern) {
      case 'double-beep':
        await this.playButtonPress();
        setTimeout(() => this.playButtonPress(), 150);
        break;
        
      case 'triple-beep':
        await this.playButtonPress();
        setTimeout(() => this.playButtonPress(), 150);
        setTimeout(() => this.playButtonPress(), 300);
        break;
        
      case 'success-jingle':
        await this.playSound('buttonPress', 0.5);
        setTimeout(() => this.playSound('buttonPress', 0.6), 100);
        setTimeout(() => this.playScanSuccess(), 200);
        break;
    }
  }

  /**
   * Play voice feedback
   */
  static async speakText(
    text: string, 
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
    }
  ): Promise<void> {
    // Note: For text-to-speech, you might want to use expo-speech instead
    console.log('Text-to-speech:', text, options);
  }

  /**
   * Record audio (for voice notes)
   */
  static async startRecording(): Promise<Audio.Recording | null> {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          bitRate: 128000,
          extension: '.m4a',
          numberOfChannels: 2,
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          sampleRate: 44100,
        },
        ios: {
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
          bitRate: 128000,
          extension: '.m4a',
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
          numberOfChannels: 2,
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          sampleRate: 44100,
        },
      });

      await recording.startAsync();
      return recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return null;
    }
  }

  /**
   * Stop recording
   */
  static async stopRecording(recording: Audio.Recording): Promise<string | null> {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }

  /**
   * Clean up all loaded sounds
   */
  static async cleanup(): Promise<void> {
    try {
      for (const [key, sound] of this.sounds) {
        await sound.unloadAsync();
        this.sounds.delete(key);
      }
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to cleanup audio service:', error);
    }
  }

  /**
   * Get system volume level
   */
  static async getSystemVolume(): Promise<number> {
    // This would require additional native module
    // For now, return a mock value
    return 0.75;
  }

  /**
   * Check if device is muted
   */
  static async isMuted(): Promise<boolean> {
    // This would require additional native module
    // For now, return false
    return false;
  }
}