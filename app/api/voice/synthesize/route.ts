import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/voice';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!language || !['en', 'hi', 'ta'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid or missing language' },
        { status: 400 }
      );
    }

    // Perform text-to-speech conversion
    const result = await textToSpeech(text, language);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[v0] Synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}
