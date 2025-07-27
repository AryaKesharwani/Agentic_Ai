'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Mic,
  VolumeUp,
  PlayArrow,
  Pause,
  Stop,
  Settings,
} from '@mui/icons-material';
import { useVoice } from '@/hooks/useVoice';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import { useAgentStore } from '@/store/agentStore';

export default function VoiceTestPanel() {
  const { locale, setLocale } = useAgentStore();
  const [testText, setTestText] = useState('Hello! This is a test of the voice synthesis system. How does it sound?');
  const [capturedText, setCapturedText] = useState('');
  
  const [voiceState, voiceControls] = useVoice({
    language: locale,
    onTranscriptComplete: (transcript) => {
      setCapturedText(transcript);
    },
    onError: (error) => {
      console.error('Voice test error:', error);
    }
  });

  const handleLanguageChange = (newLocale: 'en' | 'hi' | 'pa') => {
    setLocale(newLocale);
    voiceControls.setLanguage(newLocale);
    
    // Update test text based on language
    switch (newLocale) {
      case 'hi':
        setTestText('नमस्ते! यह आवाज संश्लेषण सिस्टम का परीक्षण है। यह कैसा लगता है?');
        break;
      case 'pa':
        setTestText('ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਇਹ ਆਵਾਜ਼ ਸਿੰਥੈਸਿਸ ਸਿਸਟਮ ਦਾ ਟੈਸਟ ਹੈ। ਇਹ ਕਿਵੇਂ ਲੱਗਦਾ ਹੈ?');
        break;
      default:
        setTestText('Hello! This is a test of the voice synthesis system. How does it sound?');
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 3,
        m: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)',
        border: 2,
        borderColor: 'primary.light',
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" sx={{ 
        mb: 3, 
        fontWeight: 600,
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
      }}>
        🎤🔊 Voice System Test Panel
      </Typography>

      {/* Language Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={locale}
            label="Language"
            onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'hi' | 'pa')}
          >
            <MenuItem value="en">🇺🇸 English</MenuItem>
            <MenuItem value="hi">🇮🇳 हिंदी (Hindi)</MenuItem>
            <MenuItem value="pa">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Speech-to-Text Test */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 500 }}>
          🎤 Speech-to-Text Test
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <VoiceInput
            onTranscript={(transcript) => setCapturedText(transcript)}
            onError={(error) => console.error('Voice input error:', error)}
            size="large"
            showTranscript={true}
            disabled={false}
          />
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Status: {voiceState.isRecording ? '🔴 Recording...' : '⚪ Ready'}
            </Typography>
            {capturedText && (
              <Alert severity="success" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Captured:</strong> "{capturedText}"
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`Language: ${locale.toUpperCase()}`} color="primary" variant="outlined" />
          <Chip 
            label={`Supported: ${voiceState.isSupported ? '✅ Yes' : '❌ No'}`} 
            color={voiceState.isSupported ? 'success' : 'error'} 
            variant="outlined" 
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Text-to-Speech Test */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 500 }}>
          🔊 Text-to-Speech Test
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          label="Text to speak"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <VoiceOutput
            text={testText}
            autoPlay={false}
            showControls={true}
            onPlayStart={() => console.log('TTS started')}
            onPlayEnd={() => console.log('TTS ended')}
            onError={(error) => console.error('TTS error:', error)}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => voiceControls.speak(testText)}
              disabled={voiceState.isPlaying}
              startIcon={<PlayArrow />}
            >
              Test Voice
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => voiceControls.stopSpeaking()}
              disabled={!voiceState.isPlaying}
              startIcon={<Stop />}
            >
              Stop
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Status Information */}
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        borderRadius: 2,
        border: 1,
        borderColor: 'primary.light',
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          📊 System Status
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`Recording: ${voiceState.isRecording ? 'Active' : 'Inactive'}`}
            color={voiceState.isRecording ? 'error' : 'default'}
            size="small"
          />
          <Chip 
            label={`Playing: ${voiceState.isPlaying ? 'Active' : 'Inactive'}`}
            color={voiceState.isPlaying ? 'success' : 'default'}
            size="small"
          />
          <Chip 
            label={`Language: ${locale}`}
            color="primary"
            size="small"
          />
          {voiceState.error && (
            <Chip 
              label={`Error: ${voiceState.error}`}
              color="error"
              size="small"
            />
          )}
        </Box>

        {voiceState.transcript && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Live Transcript: "{voiceState.transcript}"
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Confidence: {Math.round(voiceState.confidence * 100)}% | 
              Final: {voiceState.isTranscriptFinal ? 'Yes' : 'No'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Instructions:</strong>
          <br />• Click the microphone to start voice input
          <br />• Speak clearly in the selected language
          <br />• Use the text field to test speech output
          <br />• Try different languages to test multilingual support
        </Typography>
      </Alert>
    </Paper>
  );
} 