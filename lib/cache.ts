// In-memory session cache for conversation context
// Replaces Redis for development/demo purposes
// In production, replace with actual Redis using Upstash

export interface SessionContext {
  patientId?: string;
  patientName?: string;
  phone?: string;
  language: 'en' | 'hi' | 'ta';
  lastActivity: Date;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  ttl?: number; // Time to live in milliseconds
}

class SessionCache {
  private sessions: Map<string, SessionContext> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup routine (runs every 5 minutes)
    this.startCleanup();
  }

  /**
   * Get session context
   */
  getSession(sessionId: string): SessionContext | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if session has expired
    if (session.ttl) {
      const now = new Date().getTime();
      const createdTime = session.lastActivity.getTime();
      if (now - createdTime > session.ttl) {
        this.sessions.delete(sessionId);
        return null;
      }
    }

    // Update last activity
    session.lastActivity = new Date();
    return session;
  }

  /**
   * Create or update session
   */
  setSession(sessionId: string, context: Partial<SessionContext>): SessionContext {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        language: context.language || 'en',
        lastActivity: new Date(),
        conversationHistory: [],
        ttl: 30 * 60 * 1000, // 30 minutes default
        ...context,
      };
    } else {
      session = {
        ...session,
        ...context,
        lastActivity: new Date(),
      };
    }

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Add message to conversation history
   */
  addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): void {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        language: 'en',
        lastActivity: new Date(),
        conversationHistory: [],
        ttl: 30 * 60 * 1000,
      };
      this.sessions.set(sessionId, session);
    }

    session.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
    });

    session.lastActivity = new Date();

    // Keep only last 20 messages
    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-20);
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(
    sessionId: string
  ): SessionContext['conversationHistory'] {
    const session = this.getSession(sessionId);
    return session?.conversationHistory || [];
  }

  /**
   * Clear session
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Get all sessions (for monitoring)
   */
  getAllSessions(): Map<string, SessionContext> {
    return new Map(this.sessions);
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Start cleanup routine
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = new Date().getTime();
      const sessionsToDelete: string[] = [];

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.ttl) {
          const createdTime = session.lastActivity.getTime();
          if (now - createdTime > session.ttl) {
            sessionsToDelete.push(sessionId);
          }
        }
      }

      for (const sessionId of sessionsToDelete) {
        this.sessions.delete(sessionId);
        console.log(`[v0] Expired session: ${sessionId}`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Stop cleanup routine
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global cache instance
export const sessionCache = new SessionCache();

/**
 * Helper to format session context for LLM
 */
export function formatSessionContext(session: SessionContext): string {
  const lines: string[] = [];

  if (session.patientName) {
    lines.push(`Patient: ${session.patientName}`);
  }
  if (session.phone) {
    lines.push(`Phone: ${session.phone}`);
  }
  lines.push(`Language: ${session.language}`);
  lines.push(
    `Last Activity: ${session.lastActivity.toLocaleTimeString('en-US')}`
  );

  if (session.conversationHistory.length > 0) {
    lines.push(`Messages: ${session.conversationHistory.length}`);
  }

  return lines.join('\n');
}

/**
 * Get cached context string for API calls
 */
export function getSessionContextString(sessionId: string): string {
  const session = sessionCache.getSession(sessionId);
  if (!session) {
    return 'No session context available';
  }

  return formatSessionContext(session);
}
