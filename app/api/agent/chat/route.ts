import { NextRequest, NextResponse } from 'next/server';
import {
  convertToModelMessages,
  createAgentUIStreamResponse,
} from 'ai';
import { appointmentAgent, identifyPatient } from '@/lib/agent';
import { db } from '@/lib/db';
import type { UIMessage } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      sessionId,
    }: { messages: UIMessage[]; sessionId: string } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No sessionId provided' },
        { status: 400 }
      );
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    const userContent =
      latestMessage.parts
        ?.filter((p) => p.type === 'text')
        .map((p) => (p as any).text)
        .join('') || '';

    // Identify patient from the message
    const { language, patientId, phoneNumber } = await identifyPatient(
      userContent
    );

    console.log('[v0] Detected language:', language);
    console.log('[v0] Patient ID:', patientId);
    console.log('[v0] Phone number:', phoneNumber);

    // Convert UI messages to model messages for the agent
    const modelMessages = await convertToModelMessages(messages);

    // Add context about patient language
    const contextMessage = {
      role: 'user' as const,
      content: `[CONTEXT] Detected language: ${language}${
        patientId ? `, Patient ID: ${patientId}` : ''
      }${phoneNumber ? `, Phone: ${phoneNumber}` : ''}\n\nUser message: ${userContent}`,
    };

    const messagesWithContext = [
      ...modelMessages.slice(0, -1),
      contextMessage,
    ];

    // Create the agent stream response
    const response = createAgentUIStreamResponse({
      agent: appointmentAgent,
      uiMessages: messages,
    });

    return response;
  } catch (error) {
    console.error('[v0] Agent chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
