# 🎤🔊 ElevenLabs Voice Integration Setup Guide

This guide will help you set up the complete multimodal voice integration with ElevenLabs API for speech-to-text and text-to-speech functionality.

## 🚀 Features

- **Speech-to-Text**: Real-time voice input with visual feedback
- **Text-to-Speech**: AI responses with high-quality ElevenLabs voices
- **Multilingual Support**: English, Hindi, and Punjabi
- **Voice Selection**: Choose from available ElevenLabs voices
- **Fallback Support**: Browser TTS when ElevenLabs is unavailable
- **Visual Indicators**: Recording status, confidence levels, and playback controls

## 📋 Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **API Key**: Get your API key from the ElevenLabs dashboard
3. **Browser Support**: Chrome, Edge, or Safari for speech recognition

## ⚙️ Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```env
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_DEFAULT_VOICE_ID=21m00Tcm4TlvDq8ikWAM
NEXT_PUBLIC_VOICE_MODEL_ID=eleven_multilingual_v2

# Optional: Client-side key for direct API calls (not recommended for production)
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
```

### 2. Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up or log in to your account
3. Navigate to your profile settings
4. Copy your API key
5. Paste it in your `.env.local` file

### 3. Choose Voice IDs

**Popular Voice IDs:**
- `21m00Tcm4TlvDq8ikWAM` - Rachel (Default, clear female voice)
- `AZnzlk1XvdvUeBnXmlld` - Domi (Confident male voice)
- `EXAVITQu4vr4xnSDxMaL` - Bella (Soothing female voice)
- `ErXwobaYiN019PkySvjV` - Antoni (Calm male voice)
- `MF3mGyEYCl7XYWbV9V6O` - Elli (Young female voice)

You can also fetch available voices programmatically or check your ElevenLabs dashboard.

## 🎯 Usage

### Voice Input Component

```tsx
import VoiceInput from '@/components/VoiceInput';

<VoiceInput
  onTranscript={(transcript) => {
    console.log('Voice input:', transcript);
    // Handle the transcript
  }}
  onError={(error) => {
    console.error('Voice error:', error);
  }}
  size="medium"
  showTranscript={true}
  disabled={false}
/>
```

### Voice Output Component

```tsx
import VoiceOutput from '@/components/VoiceOutput';

<VoiceOutput
  text="Hello! This text will be spoken."
  autoPlay={false}
  showControls={true}
  voiceId="21m00Tcm4TlvDq8ikWAM"
  onPlayStart={() => console.log('Started speaking')}
  onPlayEnd={() => console.log('Finished speaking')}
/>
```

### Voice Hook

```tsx
import { useVoice } from '@/hooks/useVoice';

function MyComponent() {
  const [voiceState, voiceControls] = useVoice({
    language: 'en',
    onTranscriptComplete: (transcript) => {
      console.log('Final transcript:', transcript);
    }
  });

  return (
    <div>
      <button onClick={voiceControls.startListening}>
        Start Listening
      </button>
      <button onClick={() => voiceControls.speak('Hello world!')}>
        Speak Text
      </button>
    </div>
  );
}
```

## 🔧 Configuration Options

### Voice Settings

You can customize voice settings in the API call:

```typescript
{
  stability: 0.5,        // 0-1, voice consistency
  similarityBoost: 0.75, // 0-1, voice similarity to original
  style: 0.5,           // 0-1, style expression
  useSpeakerBoost: true // Enhanced speaker clarity
}
```

### Language Support

- **English**: `en-US`
- **Hindi**: `hi-IN`
- **Punjabi**: `pa-IN`

The system automatically adapts based on your selected locale.

## 🛡️ Security Best Practices

1. **Never expose API keys in client-side code**
2. **Use server-side API routes** (already implemented)
3. **Implement rate limiting** for production use
4. **Monitor API usage** in your ElevenLabs dashboard

## 🔍 Troubleshooting

### Common Issues

**1. Voice input not working:**
- Check browser compatibility (Chrome/Edge/Safari required)
- Ensure microphone permissions are granted
- Check for HTTPS (required for microphone access)

**2. ElevenLabs TTS not working:**
- Verify API key is correct
- Check if you have available characters in your ElevenLabs account
- Look for error messages in browser console

**3. No sound output:**
- Check device volume and browser audio settings
- Verify audio permissions in browser
- Try the fallback Web Speech API

### Error Handling

The system includes automatic fallbacks:

1. **ElevenLabs unavailable** → Falls back to browser Web Speech API
2. **API key missing** → Uses browser TTS only
3. **Network issues** → Graceful degradation with error messages

## 📊 API Limits

**ElevenLabs Free Tier:**
- 10,000 characters per month
- Standard voices only
- Rate limits apply

**Paid Plans:**
- Higher character limits
- Premium voices
- Faster processing
- Commercial usage rights

## 🚀 Production Deployment

### Environment Variables

Ensure these are set in your production environment:

```bash
ELEVENLABS_API_KEY=your_production_api_key
NEXT_PUBLIC_DEFAULT_VOICE_ID=21m00Tcm4TlvDq8ikWAM
NEXT_PUBLIC_VOICE_MODEL_ID=eleven_multilingual_v2
```

### Performance Optimization

1. **Cache audio responses** (already implemented with 1-hour cache)
2. **Limit text length** (5000 characters max)
3. **Implement request queuing** for high traffic
4. **Monitor API usage** and costs

## 🧪 Testing

### Test Voice Input
1. Click the microphone button
2. Speak clearly in English, Hindi, or Punjabi
3. Check transcript accuracy and confidence levels

### Test Voice Output
1. Type a message in the chat
2. Click the play button on AI responses
3. Test different voices and languages

## 📖 API Reference

### Voice Service Methods

```typescript
// Start speech recognition
await voiceService.startListening();

// Stop speech recognition
voiceService.stopListening();

// Text-to-speech
await voiceService.textToSpeech(text, voiceId);

// Stop audio playback
voiceService.stopAudio();

// Set language
voiceService.setLanguage('hi-IN');

// Get available voices
const voices = await voiceService.getAvailableVoices();
```

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your ElevenLabs account status
3. Test with different browsers
4. Review the error messages in the UI

## 🔄 Updates

This integration is designed to be:
- **Backward compatible** with existing functionality
- **Extensible** for new voice providers
- **Maintainable** with clear separation of concerns

---

**🎉 You're all set!** Your Sahayak application now supports advanced voice interactions powered by ElevenLabs AI. 