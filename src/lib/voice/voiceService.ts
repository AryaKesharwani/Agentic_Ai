// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

export interface VoiceConfig {
  apiKey: string;
  voiceId: string;
  modelId: string;
}

export interface SpeechToTextResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceServiceCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onTranscript?: (result: SpeechToTextResult) => void;
  onError?: (error: string) => void;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isRecording = false;
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  private callbacks: VoiceServiceCallbacks = {};

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.callbacks.onSpeechStart?.();
        };

        this.recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;

            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              this.callbacks.onTranscript?.(
                { 
                  transcript: finalTranscript.trim(), 
                  confidence: confidence || 0.9, 
                  isFinal: true 
                }
              );
            } else {
              interimTranscript += transcript;
              this.callbacks.onTranscript?.(
                { 
                  transcript: interimTranscript.trim(), 
                  confidence: confidence || 0.5, 
                  isFinal: false 
                }
              );
            }
          }
        };

        this.recognition.onerror = (event) => {
          this.callbacks.onError?.(`Speech recognition error: ${event.error}`);
        };

        this.recognition.onend = () => {
          this.isRecording = false;
          this.callbacks.onSpeechEnd?.();
        };
      }
    }
  }

  setCallbacks(callbacks: VoiceServiceCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    if (this.isRecording) {
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.isRecording = true;
      this.recognition.start();
    } catch (error) {
      this.callbacks.onError?.('Microphone permission denied');
      throw error;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  async textToSpeech(text: string, voiceId?: string): Promise<void> {
    try {
      this.callbacks.onAudioStart?.();

      // Try server-side ElevenLabs first
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId || process.env.NEXT_PUBLIC_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
          modelId: process.env.NEXT_PUBLIC_VOICE_MODEL_ID || 'eleven_multilingual_v2',
        }),
      });

      if (response.ok && response.headers.get('content-type')?.includes('audio')) {
        // ElevenLabs succeeded - play the audio
        const audioData = await response.arrayBuffer();
        await this.playAudio(audioData);
      } else {
        // ElevenLabs failed or unavailable - use fallback
        const errorData = await response.json().catch(() => ({}));
        console.warn('ElevenLabs TTS unavailable:', errorData.message || 'Unknown error');
        await this.fallbackTextToSpeech(text);
      }

    } catch (error) {
      console.error('TTS API error:', error);
      // Fallback to Web Speech API
      await this.fallbackTextToSpeech(text);
    }
  }

  private async fallbackTextToSpeech(text: string): Promise<void> {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;

        utterance.onstart = () => {
          this.isPlaying = true;
          this.callbacks.onAudioStart?.();
        };

        utterance.onend = () => {
          this.isPlaying = false;
          this.callbacks.onAudioEnd?.();
          resolve();
        };

        utterance.onerror = (error) => {
          this.isPlaying = false;
          this.callbacks.onError?.(`Text-to-speech error: ${error.error}`);
          reject(error);
        };

        window.speechSynthesis.speak(utterance);
      });
    }
  }



  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.currentAudio = new Audio(audioUrl);
      this.isPlaying = true;

      this.currentAudio.oncanplaythrough = () => {
        this.currentAudio?.play();
      };

      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.callbacks.onAudioEnd?.();
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      this.currentAudio.onerror = (error) => {
        this.isPlaying = false;
        this.callbacks.onError?.('Audio playback error');
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
    });
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
      this.callbacks.onAudioEnd?.();
    }

    // Stop web speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Language support for multilingual TTS
  setLanguage(language: string): void {
    if (this.recognition) {
      switch (language) {
        case 'hi':
          this.recognition.lang = 'hi-IN';
          break;
        case 'pa':
          this.recognition.lang = 'pa-IN';
          break;
        default:
          this.recognition.lang = 'en-US';
      }
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch('/api/voice/synthesize');
      const data = await response.json();
      
      if (data.success && data.voices) {
        return data.voices;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [];
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService; 