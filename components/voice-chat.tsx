'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export default function VoiceChat() {
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'ta'>('en');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID after mount to avoid hydration issues
  useEffect(() => {
    setSessionId(`session_${Math.random().toString(36).substr(2, 15)}`);
    setMounted(true);
  }, []);

  const { messages, append, isLoading, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent/chat',
    }),
    body: {
      sessionId,
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input || !input.trim()) return;

    // Add user message
    await append({
      role: 'user',
      content: input,
    });

    setInput('');
  };

  const handleStartListening = () => {
    setIsListening(true);
    // Mock voice input - in production, integrate with Web Audio API
    console.log('[v0] Listening started...');
    
    // Simulate recognition delay
    setTimeout(() => {
      setRecordedText('I would like to book an appointment');
      setIsListening(false);
    }, 2000);
  };

  const handlePlayResponse = async (text: string) => {
    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: selectedLanguage }),
      });

      const data = await response.json();
      console.log('[v0] Audio synthesized:', data);
      // In production, play the audio using Web Audio API
    } catch (error) {
      console.error('[v0] Synthesis error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chat Messages */}
      <Card className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-background/50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">🎤</div>
                <p className="text-muted-foreground">
                  Start a conversation with the appointment assistant
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Speak naturally about booking, rescheduling, or checking appointments
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-secondary-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">
                      {typeof message.content === 'string'
                        ? message.content
                        : 'Message'}
                    </p>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() =>
                          handlePlayResponse(
                            typeof message.content === 'string'
                              ? message.content
                              : ''
                          )
                        }
                        className="text-xs mt-1 opacity-75 hover:opacity-100"
                      >
                        🔊 Play
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg rounded-bl-none">
                    <Spinner className="w-5 h-5" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </Card>

      {/* Language Selection */}
      <div className="flex gap-2">
        <label className="text-sm font-medium text-foreground">Language:</label>
        {(['en', 'hi', 'ta'] as const).map((lang) => (
          <Button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            variant={selectedLanguage === lang ? 'default' : 'outline'}
            size="sm"
          >
            {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'தமிழ்'}
          </Button>
        ))}
      </div>

      {/* Voice Input */}
      <Card className="bg-card p-4 border border-border">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleStartListening}
              disabled={isListening || isLoading}
              className="gap-2 flex-1"
              variant={isListening ? 'secondary' : 'default'}
            >
              {isListening ? (
                <>
                  <span className="animate-pulse">🎤</span>
                  Listening...
                </>
              ) : (
                <>
                  🎤 Start Listening
                </>
              )}
            </Button>
          </div>

          {recordedText && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                You said:
              </p>
              <p className="text-foreground font-medium">{recordedText}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Text Input */}
      <Card className="bg-card p-4 border border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message or use voice input..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isLoading}
            className="flex-1 bg-input border-border"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input || !input.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4" />
                Sending...
              </>
            ) : (
              <>
                ➤ Send
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Status Info */}
      {mounted && (
        <div className="text-xs text-muted-foreground text-center">
          <p>
            Session ID: {sessionId.substring(0, 20)}...
          </p>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
}
