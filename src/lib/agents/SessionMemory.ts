interface MemoryItem {
  id: string;
  sessionId: string;
  content: string;
  type: 'fact' | 'preference' | 'context';
  timestamp: Date;
  usageCount: number;
  metadata?: Record<string, any>;
}

interface ContextItem {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'context';
  relevanceScore: number;
  timestamp: Date;
}

export class SessionMemory {
  private sessionId: string;
  private memory: Map<string, MemoryItem> = new Map();
  private static globalMemory: Map<string, MemoryItem[]> = new Map();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.loadSessionMemory();
  }

  private loadSessionMemory(): void {
    const sessionMemory = SessionMemory.globalMemory.get(this.sessionId) || [];
    for (const item of sessionMemory) {
      this.memory.set(item.id, item);
    }
  }

  private saveSessionMemory(): void {
    const sessionMemory = Array.from(this.memory.values());
    SessionMemory.globalMemory.set(this.sessionId, sessionMemory);
  }

  async storeContext(
    message: string,
    intent: any,
    subjects: string[] = [],
    grades: number[] = []
  ): Promise<void> {
    // Extract and store facts from the message
    const facts = this.extractFacts(message, intent, subjects, grades);
    
    for (const fact of facts) {
      const memoryItem: MemoryItem = {
        id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sessionId: this.sessionId,
        content: fact.content,
        type: fact.type,
        timestamp: new Date(),
        usageCount: 0,
        metadata: {
          intent: intent.type,
          subjects,
          grades,
          confidence: intent.confidence,
        },
      };

      this.memory.set(memoryItem.id, memoryItem);
    }

    this.saveSessionMemory();
  }

  async getRelevantContext(query: string, limit: number = 5): Promise<ContextItem[]> {
    const contextItems: ContextItem[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    for (const [id, item] of Array.from(this.memory.entries())) {
      const relevanceScore = this.calculateRelevance(item, queryWords, queryLower);
      
      if (relevanceScore > 0.1) { // Minimum relevance threshold
        contextItems.push({
          id: item.id,
          content: item.content,
          type: item.type,
          relevanceScore,
          timestamp: item.timestamp,
        });

        // Increment usage count
        item.usageCount++;
      }
    }

    // Sort by relevance score and timestamp
    contextItems.sort((a, b) => {
      if (Math.abs(a.relevanceScore - b.relevanceScore) < 0.01) {
        return b.timestamp.getTime() - a.timestamp.getTime(); // More recent first
      }
      return b.relevanceScore - a.relevanceScore; // Higher relevance first
    });

    this.saveSessionMemory();
    return contextItems.slice(0, limit);
  }

  async getRecentMemory(limit: number = 10): Promise<MemoryItem[]> {
    const memoryItems = Array.from(this.memory.values());
    
    // Sort by timestamp (most recent first)
    memoryItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return memoryItems.slice(0, limit);
  }

  async getMemoryByType(type: 'fact' | 'preference' | 'context'): Promise<MemoryItem[]> {
    const memoryItems = Array.from(this.memory.values());
    return memoryItems.filter(item => item.type === type);
  }

  async searchMemory(query: string): Promise<MemoryItem[]> {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    const results: MemoryItem[] = [];

    for (const [id, item] of Array.from(this.memory.entries())) {
      const relevanceScore = this.calculateRelevance(item, queryWords, queryLower);
      
      if (relevanceScore > 0.2) { // Higher threshold for search
        results.push(item);
        item.usageCount++;
      }
    }

    // Sort by relevance and usage
    results.sort((a, b) => {
      const aScore = this.calculateRelevance(a, queryWords, queryLower);
      const bScore = this.calculateRelevance(b, queryWords, queryLower);
      
      if (Math.abs(aScore - bScore) < 0.01) {
        return b.usageCount - a.usageCount; // Higher usage first
      }
      return bScore - aScore;
    });

    this.saveSessionMemory();
    return results;
  }

  async updateMemoryItem(id: string, updates: Partial<MemoryItem>): Promise<void> {
    const item = this.memory.get(id);
    if (item) {
      Object.assign(item, updates);
      this.saveSessionMemory();
    }
  }

  async deleteMemoryItem(id: string): Promise<void> {
    this.memory.delete(id);
    this.saveSessionMemory();
  }

  async getMemoryStats(): Promise<{
    totalItems: number;
    factCount: number;
    preferenceCount: number;
    contextCount: number;
    averageUsage: number;
    oldestItem?: Date;
    newestItem?: Date;
  }> {
    const items = Array.from(this.memory.values());
    
    const stats = {
      totalItems: items.length,
      factCount: items.filter(item => item.type === 'fact').length,
      preferenceCount: items.filter(item => item.type === 'preference').length,
      contextCount: items.filter(item => item.type === 'context').length,
      averageUsage: items.length > 0 
        ? items.reduce((sum, item) => sum + item.usageCount, 0) / items.length 
        : 0,
      oldestItem: items.length > 0 
        ? new Date(Math.min(...items.map(item => item.timestamp.getTime())))
        : undefined,
      newestItem: items.length > 0 
        ? new Date(Math.max(...items.map(item => item.timestamp.getTime())))
        : undefined,
    };

    return stats;
  }

  private extractFacts(
    message: string,
    intent: any,
    subjects: string[],
    grades: number[]
  ): Array<{ content: string; type: 'fact' | 'preference' | 'context' }> {
    const facts: Array<{ content: string; type: 'fact' | 'preference' | 'context' }> = [];

    // Store subject preferences
    if (subjects.length > 0) {
      facts.push({
        content: `Teacher works with subjects: ${subjects.join(', ')}`,
        type: 'preference',
      });
    }

    // Store grade preferences
    if (grades.length > 0) {
      facts.push({
        content: `Teacher handles grades: ${grades.join(', ')}`,
        type: 'preference',
      });
    }

    // Store intent patterns for learning
    facts.push({
      content: `User requested ${intent.type} with confidence ${intent.confidence}%`,
      type: 'context',
    });

    // Extract specific facts from message based on intent
    switch (intent.type) {
      case 'worksheetGeneration':
        facts.push({
          content: `Teacher creates worksheets for ${subjects.join(', ')} subjects`,
          type: 'fact',
        });
        break;

      case 'lessonPlanning':
        facts.push({
          content: `Teacher plans lessons for multi-grade classroom`,
          type: 'fact',
        });
        break;

      case 'behaviorManagement':
        facts.push({
          content: `Teacher needs help with classroom behavior management`,
          type: 'preference',
        });
        break;

      case 'translation':
        facts.push({
          content: `Teacher uses bilingual content (English/Hindi)`,
          type: 'preference',
        });
        break;
    }

    // Extract teaching style preferences from keywords
    if (message.includes('simple') || message.includes('easy')) {
      facts.push({
        content: `Teacher prefers simple, easy-to-understand content`,
        type: 'preference',
      });
    }

    if (message.includes('visual') || message.includes('diagram')) {
      facts.push({
        content: `Teacher uses visual aids and diagrams`,
        type: 'preference',
      });
    }

    if (message.includes('interactive') || message.includes('activity')) {
      facts.push({
        content: `Teacher prefers interactive activities`,
        type: 'preference',
      });
    }

    return facts;
  }

  private calculateRelevance(
    item: MemoryItem,
    queryWords: string[],
    queryLower: string
  ): number {
    let score = 0;
    const itemContentLower = item.content.toLowerCase();

    // Exact phrase match (highest score)
    if (itemContentLower.includes(queryLower)) {
      score += 1.0;
    }

    // Word overlap scoring
    const itemWords = itemContentLower.split(/\s+/);
    const commonWords = queryWords.filter(word => 
      itemWords.some(itemWord => itemWord.includes(word) || word.includes(itemWord))
    );
    
    score += (commonWords.length / queryWords.length) * 0.8;

    // Type-based scoring
    switch (item.type) {
      case 'preference':
        score *= 1.2; // Preferences are more relevant for personalization
        break;
      case 'fact':
        score *= 1.1; // Facts are generally relevant
        break;
      case 'context':
        score *= 0.9; // Context is less critical
        break;
    }

    // Recency boost (items from last 24 hours get boost)
    const hoursSinceCreation = (Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation < 24) {
      score *= 1.1;
    }

    // Usage frequency boost
    score += Math.min(item.usageCount * 0.05, 0.2); // Max 20% boost from usage

    return Math.min(score, 2.0); // Cap at 2.0
  }

  // Cleanup old memory items (run periodically)
  async cleanupOldMemory(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoffTime = Date.now() - maxAge;
    let deletedCount = 0;

    for (const [id, item] of Array.from(this.memory.entries())) {
      // Keep frequently used items longer
      const adjustedMaxAge = maxAge * (1 + item.usageCount * 0.1);
      
      if (item.timestamp.getTime() < (Date.now() - adjustedMaxAge)) {
        this.memory.delete(id);
        deletedCount++;
      }
    }

    this.saveSessionMemory();
    return deletedCount;
  }
} 