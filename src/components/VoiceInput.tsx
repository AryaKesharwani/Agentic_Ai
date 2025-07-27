                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Stop,
  Radio,
} from '@mui/icons-material';
import { useVoice } from '../hooks/useVoice';
import { useAgentStore } from '../store/agentStore';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showTranscript?: boolean;
  autoSubmit?: boolean;
}

export default function VoiceInput({
  onTranscript,
  onError,
  disabled = false,
  size = 'medium',
  showTranscript = true,
  autoSubmit = false,
}: VoiceInputProps) {
  const { locale } = useAgentStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const [voiceState, voiceControls] = useVoice({
    autoStopListening: true,
    autoStopTimeout: 2000,
    language: locale,
    onTranscriptComplete: (transcript) => {
      onTranscript(transcript);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      if (autoSubmit) {
        // Auto-submit the transcript
        setTimeout(() => {
          // This would trigger form submission in the parent component
        }, 500);
      }
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  // Update language when locale changes
  useEffect(() => {
    voiceControls.setLanguage(locale);
  }, [locale, voiceControls]);

  const handleMicClick = async () => {
    if (voiceState.isRecording) {
      voiceControls.stopListening();
    } else {
      try {
        voiceControls.clearTranscript();
        await voiceControls.startListening();
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 'small' as const;
      case 'large': return 'large' as const;
      default: return 'medium' as const;
    }
  };

  const getMicrophoneIcon = () => {
    if (voiceState.isRecording) {
      return <Stop fontSize={getIconSize()} />;
    }
    return <Mic fontSize={getIconSize()} />;
  };

  const getTooltipText = () => {
    if (!voiceState.isSupported) {
      return 'Voice input not supported in this browser';
    }
    if (disabled) {
      return 'Voice input disabled';
    }
    if (voiceState.isRecording) {
      return 'Stop recording';
    }
    return 'Start voice input';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      {/* Voice Input Button */}
      <Box sx={{ position: 'relative' }}>
        <Tooltip title={getTooltipText()}>
          <span>
            <IconButton
              onClick={handleMicClick}
              disabled={disabled || !voiceState.isSupported}
              sx={{
                width: getButtonSize(),
                height: getButtonSize(),
                background: voiceState.isRecording 
                  ? 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)'
                  : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                color: 'white',
                '&:hover': {
                  background: voiceState.isRecording 
                    ? 'linear-gradient(45deg, #d32f2f 30%, #e64a19 90%)'
                    : 'linear-gradient(45deg, #0d47a1 30%, #1976d2 90%)',
                  boxShadow: voiceState.isRecording 
                    ? '0 0 25px rgba(244, 67, 54, 0.7)'
                    : '0 6px 20px rgba(25, 118, 210, 0.4)',
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #bdbdbd 30%, #9e9e9e 90%)',
                  color: 'grey.600',
                },
                transition: 'all 0.3s ease',
                transform: voiceState.isRecording ? 'scale(1.1)' : 'scale(1)',
                boxShadow: voiceState.isRecording 
                  ? '0 0 20px rgba(244, 67, 54, 0.5)'
                  : '0 4px 15px rgba(25, 118, 210, 0.3)',
              }}
            >
              {getMicrophoneIcon()}
            </IconButton>
          </span>
        </Tooltip>

        {/* Recording Animation */}
        {voiceState.isRecording && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              border: 2,
              borderColor: 'error.main',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.5, transform: 'scale(1.1)' },
                '100%': { opacity: 1, transform: 'scale(1)' },
              },
            }}
          />
        )}

        {/* Recording Indicator */}
        {voiceState.isRecording && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'error.main',
              borderRadius: '50%',
              width: 12,
              height: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Radio sx={{ fontSize: 8, color: 'white' }} />
          </Box>
        )}
      </Box>

      {/* Recording Status */}
      {voiceState.isRecording && (
        <Fade in={voiceState.isRecording}>
          <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
            🎤 Listening...
          </Typography>
        </Fade>
      )}

      {/* Success Indicator */}
      {showSuccess && (
        <Fade in={showSuccess}>
          <Chip
            label="✓ Voice captured!"
            size="small"
            color="success"
            variant="filled"
          />
        </Fade>
      )}

      {/* Transcript Display */}
      {showTranscript && voiceState.transcript && (
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mt: 2,
            maxWidth: 350,
            minWidth: 250,
            background: voiceState.isTranscriptFinal 
              ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
              : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
            border: 2,
            borderColor: voiceState.isTranscriptFinal ? 'success.main' : 'primary.light',
            borderRadius: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: voiceState.isTranscriptFinal 
                ? '8px solid #4caf50'
                : '8px solid #9c27b0',
            },
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              color: voiceState.isTranscriptFinal ? 'success.dark' : 'primary.dark',
            }}
          >
            {voiceState.transcript}
          </Typography>
          
          {/* Confidence Indicator */}
          {voiceState.confidence > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                Confidence:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={voiceState.confidence * 100}
                color={getConfidenceColor(voiceState.confidence)}
                sx={{ 
                  flex: 1, 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {Math.round(voiceState.confidence * 100)}%
              </Typography>
            </Box>
          )}

          {/* Status Indicators */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {voiceState.isTranscriptFinal ? (
              <Chip 
                label="✓ Final" 
                size="small" 
                color="success" 
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip 
                label="⏳ Processing..." 
                size="small" 
                color="primary" 
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Error Display */}
      {voiceState.error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {voiceState.error}
        </Alert>
      )}

      {/* Browser Support Warning */}
      {!voiceState.isSupported && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.
        </Alert>
      )}
    </Box>
  );
} 