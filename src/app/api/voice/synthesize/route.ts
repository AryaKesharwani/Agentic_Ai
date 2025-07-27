import { NextRequest, NextResponse } from 'next/server';

// ElevenLabs API configuration
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

async function synthesizeSpeech(text: string, voiceId: string, modelId: string, voiceSettings: any) {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: modelId,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  return response.arrayBuffer();
}

async function getVoices() {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      voiceId = '21m00Tcm4TlvDq8ikWAM', // Default voice
      modelId = 'eleven_multilingual_v2',
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0.5,
      useSpeakerBoost = true 
    } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Limit text length for safety
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      );
    }

    try {
      const audioBuffer = await synthesizeSpeech(text, voiceId, modelId, {
        stability: stability,
        similarity_boost: similarityBoost,
        style: style,
        use_speaker_boost: useSpeakerBoost,
      });

      // Return audio data with proper headers
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });

    } catch (elevenLabsError) {
      console.error('ElevenLabs API error:', elevenLabsError);
      
      // Return fallback response indicating to use browser TTS
      return NextResponse.json(
        { 
          error: 'ElevenLabs service unavailable',
          fallback: true,
          message: 'Please use browser text-to-speech as fallback'
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Voice synthesis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle voice list requests
  try {
    const voices = await getVoices();
    
    return NextResponse.json({
      voices: voices.voices || [],
      success: true
    });

  } catch (error) {
    console.error('Failed to fetch voices:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch voices',
        voices: [],
        success: false
      },
      { status: 500 }
    );
  }
} 