'use client';

import { useState, useEffect, useCallback } from 'react';
import { voiceService, SpeechToTextResult, VoiceServiceCallbacks } from '@/lib/voice/voiceService';

export interface VoiceState {
  isRecording: boolean;
  isPlaying: boolean;
  transcript: string;
  isTranscriptFinal: boolean;
  confidence: number;
  error: string | null;
  isSupported: boolean;
}

export interface VoiceControls {
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string, voiceId?: string) => Promise<void>;
  stopSpeaking: () => void;
  clearTranscript: () => void;
  setLanguage: (language: string) => void;
}

export interface UseVoiceOptions {
  autoStopListening?: boolean;
  autoStopTimeout?: number;
  onTranscriptComplete?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

export function useVoice(options: UseVoiceOptions = {}): [VoiceState, VoiceControls] {
  const {
    autoStopListening = true,
    autoStopTimeout = 3000,
    onTranscriptComplete,
    onError,
    language = 'en'
  } = options;

  const [state, setState] = useState<VoiceState>({
    isRecording: false,
    isPlaying: false,
    transcript: '',
    isTranscriptFinal: false,
    confidence: 0,
    error: null,
    isSupported: typeof window !== 'undefined' && (
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in (window as any)
    ),
  });

  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);

  // Set up voice service callbacks
  useEffect(() => {
    const callbacks: VoiceServiceCallbacks = {
      onSpeechStart: () => {
        setState(prev => ({ ...prev, isRecording: true, error: null }));
        // Clear any existing silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      },

      onSpeechEnd: () => {
        setState(prev => ({ ...prev, isRecording: false }));
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      },

      onTranscript: (result: SpeechToTextResult) => {
        setState(prev => ({
          ...prev,
          transcript: result.transcript,
          isTranscriptFinal: result.isFinal,
          confidence: result.confidence,
        }));

        // Handle final transcript
        if (result.isFinal && result.transcript.trim()) {
          onTranscriptComplete?.(result.transcript.trim());
          
          // Auto-stop listening after successful transcript
          if (autoStopListening) {
            setTimeout(() => {
              voiceService.stopListening();
            }, 500);
          }
        } else if (!result.isFinal && autoStopListening) {
          // Reset silence timer for interim results
          if (silenceTimer) {
            clearTimeout(silenceTimer);
          }
          
          const timer = setTimeout(() => {
            voiceService.stopListening();
          }, autoStopTimeout);
          
          setSilenceTimer(timer);
        }
      },

      onError: (error: string) => {
        setState(prev => ({ ...prev, error, isRecording: false }));
        onError?.(error);
      },

      onAudioStart: () => {
        setState(prev => ({ ...prev, isPlaying: true, error: null }));
      },

      onAudioEnd: () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      },
    };

    voiceService.setCallbacks(callbacks);
    voiceService.setLanguage(language);

    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [autoStopListening, autoStopTimeout, onTranscriptComplete, onError, language, silenceTimer]);

  const startListening = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, transcript: '', isTranscriptFinal: false }));
      await voiceService.startListening();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start listening';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  }, [silenceTimer]);

  const speak = useCallback(async (text: string, voiceId?: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await voiceService.textToSpeech(text, voiceId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to speak text';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [onError]);

  const stopSpeaking = useCallback(() => {
    voiceService.stopAudio();
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      transcript: '', 
      isTranscriptFinal: false, 
      confidence: 0 
    }));
  }, []);

  const setLanguage = useCallback((newLanguage: string) => {
    voiceService.setLanguage(newLanguage);
  }, []);

  const controls: VoiceControls = {
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    setLanguage,
  };

  return [state, controls];
}

export default useVoice; 