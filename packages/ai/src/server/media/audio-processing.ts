/**
 * AI SDK v5 Audio Processing
 * Speech synthesis and transcription capabilities
 */

import { openai } from '@ai-sdk/openai';
import type { SpeechModel, TranscriptionModel } from 'ai';
import {
  experimental_generateSpeech as generateSpeech,
  experimental_transcribe as transcribe,
} from 'ai';

export interface SpeechGenerationOptions {
  model?: SpeechModel;
  input: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  speed?: number;
  timeout?: number;
  maxRetries?: number;
}

export interface TranscriptionOptions {
  model?: TranscriptionModel;
  file: File | Uint8Array | ArrayBuffer;
  language?: string;
  prompt?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
  timestampGranularities?: Array<'word' | 'segment'>;
  timeout?: number;
  maxRetries?: number;
}

export interface SpeechResult {
  audio: Uint8Array;
  metadata: {
    input: string;
    voice: string;
    model: string;
    format: string;
    duration?: number;
    timestamp: number;
    usage?: {
      characters: number;
    };
  };
}

export interface TranscriptionResult {
  text: string;
  metadata: {
    language?: string;
    duration?: number;
    model: string;
    confidence?: number;
    timestamp: number;
    segments?: Array<{
      text: string;
      start: number;
      end: number;
      tokens?: number[];
    }>;
    words?: Array<{
      word: string;
      start: number;
      end: number;
      confidence?: number;
    }>;
  };
}

/**
 * Enhanced speech generation manager
 */
export class SpeechManager {
  private defaultModel: SpeechModel;

  constructor(modelName?: string) {
    this.defaultModel = openai.speech(modelName ?? 'tts-1');
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(options: SpeechGenerationOptions): Promise<SpeechResult> {
    const result = await generateSpeech({
      model: options.model ?? this.defaultModel,
      text: options.input,
      voice: options.voice ?? 'alloy',
      outputFormat: options.responseFormat ?? 'mp3',
      speed: options.speed,
      maxRetries: options.maxRetries ?? 2,
      ...(options.timeout && { abortSignal: AbortSignal.timeout(options.timeout) }),
    });

    return {
      audio: result.audio.uint8Array || new Uint8Array(),
      metadata: {
        input: options.input,
        voice: options.voice ?? 'alloy',
        model: result.responses?.[0]?.modelId ?? this.defaultModel.modelId,
        format: options.responseFormat ?? 'mp3',
        timestamp: Date.now(),
        usage: {
          characters: options.input.length,
        },
      },
    };
  }

  /**
   * Generate speech with SSML support
   */
  async generateWithSSML(
    ssmlText: string,
    options?: Partial<SpeechGenerationOptions>,
  ): Promise<SpeechResult> {
    return this.generateSpeech({
      ...options,
      input: ssmlText,
    });
  }

  /**
   * Generate speech for long text with chunking
   */
  async generateLongText(
    text: string,
    options?: Partial<SpeechGenerationOptions> & {
      chunkSize?: number;
      pauseBetweenChunks?: number;
    },
  ): Promise<{
    audioChunks: SpeechResult[];
    combinedAudio?: Uint8Array;
    totalDuration?: number;
  }> {
    const chunkSize = options?.chunkSize ?? 4000; // Character limit per chunk
    const chunks = this.chunkText(text, chunkSize);

    // Generate speech for each chunk
    const audioChunks = await Promise.all(
      chunks.map(chunk =>
        this.generateSpeech({
          ...options,
          input: chunk,
        }),
      ),
    );

    // For basic concatenation (MP3 concatenation is complex, would need proper audio library)
    let combinedAudio: Uint8Array | undefined;
    if (options?.responseFormat === 'wav' || options?.responseFormat === 'pcm') {
      // Simple concatenation for uncompressed formats
      const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.audio.length, 0);
      combinedAudio = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of audioChunks) {
        combinedAudio.set(chunk.audio, offset);
        offset += chunk.audio.length;
      }
    }

    return {
      audioChunks,
      combinedAudio,
      totalDuration: audioChunks.reduce((sum, chunk) => sum + (chunk.metadata.duration ?? 0), 0),
    };
  }

  /**
   * Generate speech with different voices for comparison
   */
  async generateWithVoices(
    text: string,
    voices: Array<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>,
    options?: Partial<SpeechGenerationOptions>,
  ): Promise<Record<string, SpeechResult>> {
    const results: Record<string, SpeechResult> = {};

    await Promise.all(
      voices.map(async voice => {
        results[voice] = await this.generateSpeech({
          ...options,
          input: text,
          voice,
        });
      }),
    );

    return results;
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if ((currentChunk + trimmedSentence).length <= chunkSize) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) chunks.push(currentChunk + '.');
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk + '.');
    return chunks;
  }
}

/**
 * Enhanced transcription manager
 */
export class TranscriptionManager {
  private defaultModel: TranscriptionModel;

  constructor(modelName?: string) {
    this.defaultModel = openai.transcription(modelName ?? 'whisper-1');
  }

  /**
   * Transcribe audio to text
   */
  async transcribe(options: TranscriptionOptions): Promise<TranscriptionResult> {
    const result = await transcribe({
      model: options.model ?? this.defaultModel,
      audio: options.file as any, // AI SDK v5 uses 'audio' instead of 'file'
      providerOptions: {
        openai: {
          ...(options.language && { language: options.language }),
          ...(options.prompt && { prompt: options.prompt }),
          ...(options.temperature && { temperature: options.temperature }),
          ...(options.timestampGranularities && {
            timestampGranularities: options.timestampGranularities,
          }),
        },
      },
      maxRetries: options.maxRetries ?? 2,
      ...(options.timeout && { abortSignal: AbortSignal.timeout(options.timeout) }),
    });

    return {
      text: result.text,
      metadata: {
        language: result.language,
        duration: result.durationInSeconds || 0, // Use correct property name
        model: result.responses?.[0]?.modelId ?? this.defaultModel.modelId,
        timestamp: Date.now(),
        segments: result.segments?.map((segment: any) => ({
          text: segment.text,
          start: segment.startSecond,
          end: segment.endSecond,
          tokens: segment.tokens,
        })),
        words: [], // Words are not directly available in AI SDK v5 transcription result
      },
    };
  }

  /**
   * Transcribe with speaker diarization support
   */
  async transcribeWithSpeakers(
    file: File | Uint8Array | ArrayBuffer,
    options?: Partial<TranscriptionOptions> & {
      speakerPrompt?: string;
    },
  ): Promise<TranscriptionResult & { speakers?: Array<{ speaker: string; segments: number[] }> }> {
    const prompt =
      options?.speakerPrompt ||
      'Please identify different speakers in this audio and label them as Speaker 1, Speaker 2, etc.';

    const result = await this.transcribe({
      ...options,
      file,
      prompt,
      responseFormat: 'verbose_json',
      timestampGranularities: ['segment'],
    });

    // Basic speaker detection from text patterns
    const speakers = this.detectSpeakers(result.text, result.metadata.segments);

    return {
      ...result,
      speakers,
    };
  }

  /**
   * Batch transcription for multiple files
   */
  async transcribeBatch(
    files: Array<{ file: File | Uint8Array | ArrayBuffer; name?: string }>,
    options?: Partial<TranscriptionOptions>,
    onProgress?: (completed: number, total: number) => void,
  ): Promise<Array<TranscriptionResult & { filename?: string }>> {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const { file, name } = files[i];

      try {
        const result = await this.transcribe({
          ...options,
          file,
        });

        results.push({
          ...result,
          filename: name,
        });
      } catch (error) {
        results.push({
          text: '',
          metadata: {
            model: this.defaultModel.modelId,
            timestamp: Date.now(),
          },
          filename: name,
          error: error instanceof Error ? error.message : String(error),
        } as any);
      }

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    }

    return results;
  }

  private detectSpeakers(
    text: string,
    segments?: any[],
  ): Array<{ speaker: string; segments: number[] }> {
    // Simple speaker detection based on common patterns
    const speakers: Record<string, number[]> = {};
    const speakerPattern = /(Speaker \d+|[A-Z][a-z]+):/g;

    if (segments) {
      segments.forEach((segment, index) => {
        const matches = segment.text.match(speakerPattern);
        if (matches) {
          const speaker = matches[0].replace(':', '');
          if (!speakers[speaker]) speakers[speaker] = [];
          speakers[speaker].push(index);
        }
      });
    }

    return Object.entries(speakers).map(([speaker, segmentIndices]) => ({
      speaker,
      segments: segmentIndices,
    }));
  }
}

/**
 * Audio utilities
 */
export const audioUtils = {
  /**
   * Convert audio file to Uint8Array
   */
  async fileToUint8Array(file: File): Promise<Uint8Array> {
    return new Uint8Array(await file.arrayBuffer());
  },

  /**
   * Save audio to file system (Node.js only)
   */
  async saveAudio(audioData: Uint8Array, filepath: string): Promise<void> {
    if (typeof window !== 'undefined') {
      throw new Error('saveAudio is only available in Node.js environment');
    }

    const fs = await import('fs/promises');
    await fs.writeFile(filepath, audioData);
  },

  /**
   * Get audio duration from file (requires audio library for accurate results)
   */
  estimateAudioDuration(audioData: Uint8Array, format: string): number | null {
    // This is a very rough estimation - for accurate duration, use a proper audio library
    if (format === 'mp3') {
      // MP3 at 128kbps ≈ 16KB per second
      return audioData.length / 16000;
    } else if (format === 'wav') {
      // WAV at 44.1kHz 16-bit stereo ≈ 176KB per second
      return audioData.length / 176000;
    }
    return null;
  },

  /**
   * Create audio blob for browser playback
   */
  createAudioBlob(audioData: Uint8Array, mimeType: string): Blob {
    return new Blob([audioData], { type: mimeType });
  },

  /**
   * Create audio URL for browser playback
   */
  createAudioURL(audioData: Uint8Array, mimeType: string): string {
    const blob = this.createAudioBlob(audioData, mimeType);
    return URL.createObjectURL(blob);
  },
} as const;

/**
 * High-level audio functions
 */
export const quickAudio = {
  /**
   * Text to speech with default settings
   */
  async speak(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy',
  ): Promise<SpeechResult> {
    const manager = new SpeechManager();
    return manager.generateSpeech({
      input: text,
      voice,
      responseFormat: 'mp3',
    });
  },

  /**
   * Audio to text with default settings
   */
  async transcribe(file: File | Uint8Array | ArrayBuffer): Promise<TranscriptionResult> {
    const manager = new TranscriptionManager();
    return manager.transcribe({
      file,
      responseFormat: 'verbose_json',
    });
  },

  /**
   * Create podcast-style narration
   */
  async createNarration(
    script: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova',
  ): Promise<SpeechResult> {
    const manager = new SpeechManager();
    return manager.generateSpeech({
      input: script,
      voice,
      responseFormat: 'mp3',
      speed: 1.0,
    });
  },

  /**
   * Meeting transcription with timestamps
   */
  async transcribeMeeting(file: File | Uint8Array | ArrayBuffer): Promise<TranscriptionResult> {
    const manager = new TranscriptionManager();
    return manager.transcribeWithSpeakers(file, {
      responseFormat: 'verbose_json',
      timestampGranularities: ['word', 'segment'],
      speakerPrompt:
        'This is a meeting recording. Please identify different speakers and format as Speaker 1, Speaker 2, etc.',
    });
  },
} as const;

/**
 * Factory functions
 */
export function createSpeechManager(modelName?: string): SpeechManager {
  return new SpeechManager(modelName);
}

export function createTranscriptionManager(modelName?: string): TranscriptionManager {
  return new TranscriptionManager(modelName);
}
