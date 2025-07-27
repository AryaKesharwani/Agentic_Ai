interface Intent {
  type: string;
  confidence: number;
  keywords: string[];
  parameters?: Record<string, any>;
}

interface IntentPattern {
  type: string;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
}

export class IntentClassifier {
  private readonly intentPatterns: IntentPattern[] = [
    {
      type: 'worksheetGeneration',
      keywords: ['worksheet', 'activity sheet', 'exercise', 'practice', 'homework', 'assignment'],
      patterns: [
        /create.*worksheet/i,
        /generate.*activity/i,
        /make.*exercise/i,
        /design.*practice/i,
      ],
      weight: 1.0,
    },
    {
      type: 'lessonPlanning',
      keywords: ['lesson plan', 'teaching plan', 'curriculum', 'schedule', 'syllabus', 'plan'],
      patterns: [
        /lesson\s+plan/i,
        /teaching\s+plan/i,
        /plan.*lesson/i,
        /curriculum.*design/i,
      ],
      weight: 1.0,
    },
    {
      type: 'conceptExplanation',
      keywords: ['explain', 'what is', 'how does', 'definition', 'meaning', 'understand'],
      patterns: [
        /explain.*concept/i,
        /what\s+is/i,
        /how\s+does/i,
        /help.*understand/i,
      ],
      weight: 0.9,
    },
    {
      type: 'quizGeneration',
      keywords: ['quiz', 'test', 'questions', 'assessment', 'exam', 'evaluation'],
      patterns: [
        /create.*quiz/i,
        /generate.*questions/i,
        /make.*test/i,
        /assessment.*questions/i,
      ],
      weight: 1.0,
    },
    {
      type: 'gradeAdaptation',
      keywords: ['grade', 'level', 'age appropriate', 'simplify', 'adapt', 'modify'],
      patterns: [
        /for\s+grade/i,
        /age\s+appropriate/i,
        /simplify.*for/i,
        /adapt.*level/i,
      ],
      weight: 0.8,
    },
    {
      type: 'translation',
      keywords: ['translate', 'hindi', 'english', 'language', 'convert'],
      patterns: [
        /translate.*to/i,
        /in\s+hindi/i,
        /in\s+english/i,
        /convert.*language/i,
      ],
      weight: 0.9,
    },
    {
      type: 'resourceCreation',
      keywords: ['resource', 'material', 'handout', 'visual', 'diagram', 'chart'],
      patterns: [
        /create.*resource/i,
        /make.*material/i,
        /design.*visual/i,
        /generate.*diagram/i,
      ],
      weight: 0.8,
    },
    {
      type: 'behaviorManagement',
      keywords: ['behavior', 'discipline', 'manage', 'classroom management', 'student behavior'],
      patterns: [
        /manage.*behavior/i,
        /classroom\s+management/i,
        /student\s+discipline/i,
        /behavior\s+problems/i,
      ],
      weight: 0.7,
    },
    {
      type: 'parentCommunication',
      keywords: ['parent', 'communication', 'family', 'guardian', 'meeting'],
      patterns: [
        /parent.*communication/i,
        /talk.*parents/i,
        /family.*meeting/i,
        /guardian.*discuss/i,
      ],
      weight: 0.7,
    },
    {
      type: 'generalQuery',
      keywords: ['help', 'advice', 'suggestion', 'guidance', 'support'],
      patterns: [
        /help.*me/i,
        /need.*advice/i,
        /suggest.*me/i,
        /guidance.*on/i,
      ],
      weight: 0.5,
    },
  ];

  async classify(
    message: string, 
    subjects: string[] = [], 
    grades: number[] = []
  ): Promise<Intent> {
    const normalizedMessage = message.toLowerCase().trim();
    const words = normalizedMessage.split(/\s+/);
    
    const scores = new Map<string, number>();
    const foundKeywords = new Map<string, string[]>();

    // Calculate scores for each intent
    for (const pattern of this.intentPatterns) {
      let score = 0;
      const keywords: string[] = [];

      // Keyword matching
      for (const keyword of pattern.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          score += pattern.weight * 0.3;
          keywords.push(keyword);
        }
      }

      // Pattern matching
      for (const regex of pattern.patterns) {
        if (regex.test(normalizedMessage)) {
          score += pattern.weight * 0.5;
        }
      }

      // Context-based scoring
      score += this.getContextScore(pattern.type, subjects, grades) * 0.2;

      if (score > 0) {
        scores.set(pattern.type, score);
        foundKeywords.set(pattern.type, keywords);
      }
    }

    // Find the highest scoring intent
    let bestIntent = 'generalQuery';
    let bestScore = 0.1; // Minimum threshold
    let bestKeywords: string[] = [];

    for (const [intentType, score] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intentType;
        bestKeywords = foundKeywords.get(intentType) || [];
      }
    }

    // Calculate confidence percentage
    const confidence = Math.min(Math.round(bestScore * 100), 95);

    // Extract parameters based on intent type
    const parameters = this.extractParameters(bestIntent, normalizedMessage, subjects, grades);

    return {
      type: bestIntent,
      confidence,
      keywords: bestKeywords,
      parameters,
    };
  }

  private getContextScore(intentType: string, subjects: string[], grades: number[]): number {
    let score = 0;

    // Subject-specific scoring
    if (subjects.length > 0) {
      switch (intentType) {
        case 'worksheetGeneration':
        case 'quizGeneration':
          score += 0.3; // These are common for all subjects
          break;
        case 'conceptExplanation':
          if (subjects.includes('Science') || subjects.includes('Mathematics')) {
            score += 0.4;
          }
          break;
        case 'resourceCreation':
          if (subjects.includes('Art') || subjects.includes('Science')) {
            score += 0.3;
          }
          break;
      }
    }

    // Grade-specific scoring
    if (grades.length > 0) {
      const avgGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      
      switch (intentType) {
        case 'behaviorManagement':
          if (avgGrade <= 3) score += 0.2; // More common for lower grades
          break;
        case 'conceptExplanation':
          score += 0.1; // Always relevant
          break;
        case 'gradeAdaptation':
          if (grades.length > 1) score += 0.4; // Multi-grade context
          break;
      }
    }

    return score;
  }

  private extractParameters(
    intentType: string, 
    message: string, 
    subjects: string[], 
    grades: number[]
  ): Record<string, any> {
    const parameters: Record<string, any> = {};

    // Common parameters
    if (subjects.length > 0) parameters.subjects = subjects;
    if (grades.length > 0) parameters.grades = grades;

    // Intent-specific parameter extraction
    switch (intentType) {
      case 'worksheetGeneration':
      case 'quizGeneration':
        // Extract number of questions/exercises
        const numberMatch = message.match(/(\d+)\s*(question|exercise|problem)/i);
        if (numberMatch) {
          parameters.count = parseInt(numberMatch[1]);
        }
        
        // Extract difficulty level
        if (message.includes('easy') || message.includes('simple')) {
          parameters.difficulty = 'easy';
        } else if (message.includes('hard') || message.includes('difficult')) {
          parameters.difficulty = 'hard';
        } else {
          parameters.difficulty = 'medium';
        }
        break;

      case 'translation':
        // Extract target language
        if (message.includes('hindi')) {
          parameters.targetLanguage = 'hi';
        } else if (message.includes('english')) {
          parameters.targetLanguage = 'en';
        }
        break;

      case 'gradeAdaptation':
        // Extract target grade if mentioned
        const gradeMatch = message.match(/grade\s*(\d+)/i);
        if (gradeMatch) {
          parameters.targetGrade = parseInt(gradeMatch[1]);
        }
        break;

      case 'lessonPlanning':
        // Extract duration
        const durationMatch = message.match(/(\d+)\s*(minute|hour|day)/i);
        if (durationMatch) {
          parameters.duration = {
            value: parseInt(durationMatch[1]),
            unit: durationMatch[2].toLowerCase(),
          };
        }
        break;
    }

    return parameters;
  }

  // Get intent suggestions based on partial input
  async getSuggestions(partialMessage: string, subjects: string[] = []): Promise<string[]> {
    const suggestions: string[] = [];
    const normalized = partialMessage.toLowerCase();

    for (const pattern of this.intentPatterns) {
      for (const keyword of pattern.keywords) {
        if (keyword.toLowerCase().startsWith(normalized) || normalized.includes(keyword.toLowerCase())) {
          suggestions.push(`${pattern.type}: ${keyword}`);
        }
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // Get all available intent types
  getAvailableIntents(): string[] {
    return this.intentPatterns.map(pattern => pattern.type);
  }
} 