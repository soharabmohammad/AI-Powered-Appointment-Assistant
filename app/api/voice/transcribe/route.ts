import { NextRequest, NextResponse } from 'next/server';
import { speechToText } from '@/lib/voice';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Perform speech-to-text conversion
    const result = await speechToText(
      audioBuffer,
      language as 'en' | 'hi' | 'ta'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[v0] Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
