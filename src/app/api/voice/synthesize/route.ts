import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabs } from '@elevenlabs/elevenlabs-js';

// Initialize ElevenLabs client
let elevenlabs: ElevenLabs | null = null;

function getElevenLabsClient() {
  if (!elevenlabs) {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    elevenlabs = new ElevenLabs({
      apiKey: apiKey,
    });
  }
  return elevenlabs;
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
      const client = getElevenLabsClient();

      const audioStream = await client.generate({
        voice: voiceId,
        model_id: modelId,
        text: text,
        voice_settings: {
          stability: stability,
          similarity_boost: similarityBoost,
          style: style,
          use_speaker_boost: useSpeakerBoost,
        },
      });

      // Convert stream to buffer
      const reader = audioStream.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const audioBuffer = new Uint8Array(totalLength);
      let offset = 0;

      for (const chunk of chunks) {
        audioBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      // Return audio data with proper headers
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
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
    const client = getElevenLabsClient();
    const voices = await client.voices.getAll();
    
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