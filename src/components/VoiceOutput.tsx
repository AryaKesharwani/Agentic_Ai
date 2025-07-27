'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  VolumeUp,
  VolumeOff,
  Stop,
  PlayArrow,
  Pause,
  SettingsVoice,
  Person,
} from '@mui/icons-material';
import { useVoice } from '@/hooks/useVoice';
import { voiceService } from '@/lib/voice/voiceService';

interface VoiceOutputProps {
  text: string;
  autoPlay?: boolean;
  showControls?: boolean;
  voiceId?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

export default function VoiceOutput({
  text,
  autoPlay = false,
  showControls = true,
  voiceId,
  onPlayStart,
  onPlayEnd,
  onError,
}: VoiceOutputProps) {
  const [voiceState, voiceControls] = useVoice({
    onError: (error) => {
      onError?.(error);
    },
  });

  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceId || '');
  const [voiceMenuAnchor, setVoiceMenuAnchor] = useState<HTMLElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await voiceService.getAvailableVoices();
        setAvailableVoices(voices);
        
        // Set default voice if none selected
        if (!selectedVoice && voices.length > 0) {
          setSelectedVoice(voices[0].voice_id);
        }
      } catch (error) {
        console.error('Failed to load voices:', error);
      }
    };

    loadVoices();
  }, [selectedVoice]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && text.trim()) {
      handlePlay();
    }
  }, [autoPlay, text]);

  // Play state callbacks
  useEffect(() => {
    if (voiceState.isPlaying) {
      onPlayStart?.();
    } else {
      onPlayEnd?.();
    }
  }, [voiceState.isPlaying, onPlayStart, onPlayEnd]);

  const handlePlay = async () => {
    if (voiceState.isPlaying) {
      voiceControls.stopSpeaking();
    } else {
      try {
        await voiceControls.speak(text, selectedVoice);
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
  };

  const handleVoiceMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setVoiceMenuAnchor(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleVoiceMenuClose = () => {
    setVoiceMenuAnchor(null);
    setIsMenuOpen(false);
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    handleVoiceMenuClose();
  };

  const getSelectedVoiceName = () => {
    const voice = availableVoices.find(v => v.voice_id === selectedVoice);
    return voice ? voice.name : 'Default Voice';
  };

  const getPlayIcon = () => {
    if (voiceState.isPlaying) {
      return <Stop />;
    }
    return <PlayArrow />;
  };

  const getPlayTooltip = () => {
    if (voiceState.isPlaying) {
      return 'Stop playback';
    }
    return 'Play with voice';
  };

  if (!text.trim()) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showControls && (
        <>
          {/* Play/Stop Button */}
          <Tooltip title={getPlayTooltip()}>
            <IconButton
              onClick={handlePlay}
              disabled={!text.trim()}
              size="small"
              sx={{
                background: voiceState.isPlaying 
                  ? 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)'
                  : 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
                color: 'white',
                '&:hover': {
                  background: voiceState.isPlaying 
                    ? 'linear-gradient(45deg, #d32f2f 30%, #e64a19 90%)'
                    : 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)',
                  transform: 'scale(1.05)',
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #bdbdbd 30%, #9e9e9e 90%)',
                  color: 'grey.600',
                },
                transition: 'all 0.3s ease',
                boxShadow: voiceState.isPlaying 
                  ? '0 0 15px rgba(244, 67, 54, 0.4)'
                  : '0 4px 12px rgba(46, 125, 50, 0.3)',
                minWidth: 40,
                minHeight: 40,
              }}
            >
              {getPlayIcon()}
            </IconButton>
          </Tooltip>

          {/* Voice Selection */}
          {availableVoices.length > 0 && (
            <>
              <Tooltip title="Select voice">
                <IconButton
                  onClick={handleVoiceMenuOpen}
                  size="small"
                  sx={{ color: 'primary.main' }}
                >
                  <SettingsVoice />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={voiceMenuAnchor}
                open={isMenuOpen}
                onClose={handleVoiceMenuClose}
                PaperProps={{
                  style: {
                    maxHeight: 300,
                    width: 250,
                  },
                }}
              >
                {availableVoices.map((voice) => (
                  <MenuItem
                    key={voice.voice_id}
                    onClick={() => handleVoiceSelect(voice.voice_id)}
                    selected={voice.voice_id === selectedVoice}
                  >
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary={voice.name}
                      secondary={`${voice.labels?.gender || 'Unknown'} • ${voice.labels?.accent || 'Default'}`}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </>
      )}

      {/* Playing Indicator */}
      {voiceState.isPlaying && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          padding: '8px 12px',
          borderRadius: 2,
          border: 1,
          borderColor: 'primary.light',
        }}>
          <VolumeUp sx={{ 
            fontSize: 18, 
            color: 'primary.main',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.7, transform: 'scale(1.1)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
          }} />
          <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
            🎵 Playing...
          </Typography>
          <Box sx={{ width: 60 }}>
            <LinearProgress 
              variant="indeterminate" 
              sx={{ 
                height: 4, 
                borderRadius: 2,
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                },
              }}
            />
          </Box>
        </Box>
      )}

      {/* Voice Info */}
      {showControls && selectedVoice && availableVoices.length > 0 && (
        <Chip
          label={getSelectedVoiceName()}
          size="small"
          variant="outlined"
          icon={<Person />}
          sx={{ fontSize: '0.75rem' }}
        />
      )}

      {/* Error Display */}
      {voiceState.error && (
        <Typography variant="caption" color="error">
          ⚠️ {voiceState.error}
        </Typography>
      )}
    </Box>
  );
} 