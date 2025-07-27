interface AgentStatus {
  id: string;
  name: string;
  status: 'pending' | 'inProgress' | 'suspended' | 'skipped' | 'completed' | 'error';
  logs: AgentLog[];
  startTime?: Date;
  endTime?: Date;
}

interface AgentLog {
  id: string;
  timestamp: Date;
  message: string;
  reasoning: string;
  metadata?: {
    processingTime?: number;
    modelUsed?: string;
    tokensProcessed?: number;
    confidence?: number;
    parameters?: any;
    subSteps?: string[];
  };
}

interface WorkflowActivity {
  sessionId: string;
  timestamp: Date;
  action: string;
  data: any;
}

export class AgentProcessor {
  private workflows: Map<string, AgentStatus[]> = new Map();
  private activities: Map<string, WorkflowActivity[]> = new Map();

  private readonly AGENTS = [
    { id: 'orchestrator', name: 'Orchestrator' },
    { id: 'sessionMemory', name: 'Session Memory' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'personaliser', name: 'Personaliser' },
    { id: 'suggestions', name: 'Suggestions' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'intentClassifier', name: 'Intent Classifier' },
    { id: 'monitoring', name: 'Monitoring' },
    { id: 'judge', name: 'Judge' },
  ];

  async startWorkflow(sessionId: string): Promise<AgentStatus[]> {
    const agents: AgentStatus[] = this.AGENTS.map(agent => ({
      id: agent.id,
      name: agent.name,
      status: 'pending' as const,
      logs: [],
    }));

    this.workflows.set(sessionId, agents);
    
    // Initialize activities array for this session
    if (!this.activities.has(sessionId)) {
      this.activities.set(sessionId, []);
    }

    return agents;
  }

  async updateAgentStatus(
    sessionId: string, 
    agentId: string, 
    status: AgentStatus['status']
  ): Promise<void> {
    const workflow = this.workflows.get(sessionId);
    if (!workflow) {
      throw new Error(`Workflow not found for session: ${sessionId}`);
    }

    const agent = workflow.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    agent.status = status;
    
    if (status === 'inProgress') {
      agent.startTime = new Date();
    } else if (status === 'completed' || status === 'error') {
      agent.endTime = new Date();
    }

    // Broadcast status update to connected clients (in a real app, use WebSockets)
    this.notifyStatusUpdate(sessionId, agentId, status);
  }

  async addAgentLog(
    sessionId: string, 
    agentId: string, 
    log: Omit<AgentLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const workflow = this.workflows.get(sessionId);
    if (!workflow) {
      throw new Error(`Workflow not found for session: ${sessionId}`);
    }

    const agent = workflow.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const newLog: AgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...log,
    };

    agent.logs.push(newLog);
  }

  // Enhanced fake inference logging methods
  async addFakeInferenceLog(
    sessionId: string,
    agentId: string,
    step: string,
    details: any = {}
  ): Promise<void> {
    const fakeLogs = this.generateFakeInferenceLogs(agentId, step, details);
    
    for (const log of fakeLogs) {
      await this.addAgentLog(sessionId, agentId, log);
      // Add realistic delays between logs
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    }
  }

  private generateFakeInferenceLogs(agentId: string, step: string, details: any): Omit<AgentLog, 'id' | 'timestamp'>[] {
    const logs: Omit<AgentLog, 'id' | 'timestamp'>[] = [];
    
    switch (agentId) {
      case 'intentClassifier':
        logs.push(...this.generateIntentClassifierLogs(step, details));
        break;
      case 'sessionMemory':
        logs.push(...this.generateSessionMemoryLogs(step, details));
        break;
      case 'orchestrator':
        logs.push(...this.generateOrchestratorLogs(step, details));
        break;
      case 'judge':
        logs.push(...this.generateJudgeLogs(step, details));
        break;
      case 'personaliser':
        logs.push(...this.generatePersonaliserLogs(step, details));
        break;
      case 'suggestions':
        logs.push(...this.generateSuggestionsLogs(step, details));
        break;
      case 'monitoring':
        logs.push(...this.generateMonitoringLogs(step, details));
        break;
      default:
        logs.push({
          message: `Processing ${step}`,
          reasoning: `Executing ${step} with standard parameters`,
          metadata: {
            processingTime: Math.random() * 2000 + 500,
            modelUsed: 'gemini-2.0-flash-exp',
            tokensProcessed: Math.floor(Math.random() * 1000) + 100
          }
        });
    }
    
    return logs;
  }

  private generateIntentClassifierLogs(step: string, details: any): Omit<AgentLog, 'id' | 'timestamp'>[] {
    return [
      {
        message: 'Initializing intent classification pipeline',
        reasoning: 'Loading pre-trained BERT model for natural language understanding. Model: bert-base-multilingual-cased, Vocabulary size: 119,547 tokens',
        metadata: {
          processingTime: 1200,
          modelUsed: 'bert-base-multilingual-cased',
          tokensProcessed: 45,
          subSteps: ['Model loading', 'Tokenization', 'Embedding generation']
        }
      },
      {
        message: 'Tokenizing input text',
        reasoning: `Input: "${details.message || 'user input'}". Generated ${Math.floor(Math.random() * 20) + 10} tokens. Special tokens: [CLS], [SEP] added for sequence classification`,
        metadata: {
          processingTime: 150,
          modelUsed: 'bert-base-multilingual-cased',
          tokensProcessed: Math.floor(Math.random() * 20) + 10
        }
      },
      {
        message: 'Extracting contextual embeddings',
        reasoning: 'Generating 768-dimensional contextual embeddings for each token. Using attention mechanism to capture semantic relationships',
        metadata: {
          processingTime: 800,
          modelUsed: 'bert-base-multilingual-cased',
          tokensProcessed: Math.floor(Math.random() * 20) + 10,
          confidence: Math.random() * 0.3 + 0.7
        }
      },
      {
        message: 'Applying classification head',
        reasoning: 'Using softmax activation over 6 intent classes. Top 3 predictions: worksheetGeneration (0.87), quizGeneration (0.08), lessonPlanning (0.03)',
        metadata: {
          processingTime: 200,
          modelUsed: 'bert-base-multilingual-cased',
          tokensProcessed: Math.floor(Math.random() * 20) + 10,
          confidence: Math.random() * 0.3 + 0.7,
          parameters: {
            intentClasses: ['worksheetGeneration', 'quizGeneration', 'lessonPlanning', 'conceptExplanation', 'doubtHelp', 'unsure'],
            topPredictions: [
              { intent: 'worksheetGeneration', confidence: 0.87 },
              { intent: 'quizGeneration', confidence: 0.08 },
              { intent: 'lessonPlanning', confidence: 0.03 }
            ]
          }
        }
      },
      {
        message: 'Extracting named entities',
        reasoning: 'Using NER model to identify subjects, grades, and topics. Found entities: Mathematics (SUBJECT), Grade 3 (GRADE), Addition (TOPIC)',
        metadata: {
          processingTime: 400,
          modelUsed: 'bert-base-multilingual-cased',
          tokensProcessed: Math.floor(Math.random() * 20) + 10,
          parameters: {
            entities: [
              { text: 'Mathematics', type: 'SUBJECT', confidence: 0.95 },
              { text: 'Grade 3', type: 'GRADE', confidence: 0.92 },
              { text: 'Addition', type: 'TOPIC', confidence: 0.88 }
            ]
          }
        }
      }
    ];
  }

  private generateSessionMemoryLogs(step: string, details: any): Omit<AgentLog, 'id' | 'timestamp'>[] {
    return [
      {
        message: 'Initializing memory retrieval system',
        reasoning: 'Loading session context from Redis cache. Session ID: ' + (details.sessionId || 'unknown') + '. Using semantic similarity search with FAISS index',
        metadata: {
          processingTime: 300,
          modelUsed: 'sentence-transformers/all-MiniLM-L6-v2',
          tokensProcessed: 150
        }
      },
      {
        message: 'Computing semantic similarity',
        reasoning: 'Generating embeddings for current query and comparing with 47 stored memory items. Using cosine similarity threshold: 0.7',
        metadata: {
          processingTime: 1200,
          modelUsed: 'sentence-transformers/all-MiniLM-L6-v2',
          tokensProcessed: 150,
          parameters: {
            memoryItems: 47,
            similarityThreshold: 0.7,
            topMatches: 5
          }
        }
      },
      {
        message: 'Retrieved relevant context',
        reasoning: `Found ${Math.floor(Math.random() * 5) + 1} relevant memory items. Top match: "Teacher prefers visual aids" (similarity: 0.89)`,
        metadata: {
          processingTime: 200,
          modelUsed: 'sentence-transformers/all-MiniLM-L6-v2',
          tokensProcessed: 150,
          confidence: Math.random() * 0.3 + 0.7
        }
      },
      {
        message: 'Storing new context',
        reasoning: 'Encoding new information using transformer encoder. Adding to memory with metadata: intent, subjects, grades, timestamp',
        metadata: {
          processingTime: 600,
          modelUsed: 'sentence-transformers/all-MiniLM-L6-v2',
          tokensProcessed: 150,
          parameters: {
            newMemoryItems: 1,
            metadataFields: ['intent', 'subjects', 'grades', 'timestamp']
          }
        }
      }
    ];
  }

  private generateOrchestratorLogs(step: string, details: any): Omit<AgentLog, 'id' | 'timestamp'>[] {
    return [
      {
        message: 'Initializing response generation pipeline',
        reasoning: 'Loading Gemini 2.0 Flash model. Model parameters: temperature=0.7, max_tokens=2048, top_p=0.9. Context window: 1M tokens',
        metadata: {
          processingTime: 1800,
          modelUsed: 'gemini-2.0-flash-exp',
          tokensProcessed: 0,
          parameters: {
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
            contextWindow: '1M tokens'
          }
        }
      },
      {
        message: 'Constructing system prompt',
        reasoning: 'Building comprehensive prompt with context, intent, subjects, grades. Total prompt length: 1,247 tokens. Including safety filters and educational guidelines',
        metadata: {
          processingTime: 400,
          modelUsed: 'gemini-2.0-flash-exp',
          tokensProcessed: 1247,
          parameters: {
            promptSections: ['system', 'context', 'intent', 'constraints', 'output_format'],
            safetyFilters: ['educational_appropriate', 'cultural_sensitive', 'age_appropriate']
          }
        }
      },
      {
        message: 'Generating response with chain-of-thought',
        reasoning: 'Using few-shot prompting with reasoning examples. Generating step-by-step thinking process before final response. Tokens generated: 1,892',
        metadata: {
          processingTime: 3500,
          modelUsed: 'gemini-2.0-flash-exp',
          tokensProcessed: 1892,
          confidence: Math.random() * 0.3 + 0.7,
          parameters: {
            reasoningSteps: 5,
            responseLength: 1892,
            generationMethod: 'chain-of-thought'
          }
        }
      },
      {
        message: 'Applying content filters',
        reasoning: 'Running response through safety classifier. Checks: educational_value, age_appropriateness, cultural_sensitivity. All checks passed',
        metadata: {
          processingTime: 800,
          modelUsed: 'safety-classifier-v2',
          tokensProcessed: 1892,
          parameters: {
            safetyChecks: ['educational_value', 'age_appropriateness', 'cultural_sensitivity'],
            results: 'all_passed'
          }
        }
      }
    ];
  }

  private generateJudgeLogs(step: string, details: any): Omit<AgentLog, 'id' | 'timestamp'>[] {
    return [
      {
        message: 'Initializing quality assessment model',
        reasoning: 'Loading specialized educational content evaluator. Model trained on 50K+ educational materials with teacher annotations',
        metadata: {
          processingTime: 900,
          modelUsed: 'educational-quality-assessor',
          tokensProcessed: 0
        }
      },
      {
        message: 'Analyzing content structure',
        reasoning: 'Evaluating logical flow, clarity, and organization. Score: 8.5/10. Areas for improvement: add more examples, include visual cues',
        metadata: {
          processingTime: 1200,
          modelUsed: 'educational-quality-assessor',
          tokensProcessed: Math.floor(Math.random() * 1000) + 500,
          confidence: Math.random() * 0.3 + 0.7,
          parameters: {
            evaluationCriteria: ['structure', 'clarity', 'organization', 'completeness'],
            scores: { structure: 8.5, clarity: 8.2, organization: 8.8, completeness: 7.9 }
          }
        }
      },
      {
        message: 'Assessing grade appropriateness',
        reasoning: 'Comparing content complexity with grade-level standards. Vocabulary analysis: 95% appropriate for target grade. Concept difficulty: well-calibrated',
        metadata: {
          processingTime: 1500,
          modelUsed: 'grade-appropriateness-analyzer',
          tokensProcessed: Math.floor(Math.random() * 1000) + 500,
          parameters: {
            vocabularyAppropriateness: 0.95,
            conceptDifficulty: 'well_calibrated',
            gradeStandards: 'aligned'
          }
        }
      },
      {
        message: 'Evaluating educational value',
        reasoning: 'Assessing learning objectives, engagement potential, and practical applicability. Overall score: 8.7/10. High educational value with clear learning outcomes',
        metadata: {
          processingTime: 1100,
          modelUsed: 'educational-value-evaluator',
          tokensProcessed: Math.floor(Math.random() * 1000) + 500,
          confidence: Math.random() * 0.3 + 0.7,
          parameters: {
            learningObjectives: 'clear_and_measurable',
            engagementPotential: 'high',
            practicalApplicability: 'excellent',
            overallScore: 8.7
          }
        }
      }
    ];
  }

  private generatePersonaliserLogs(step: string, details: any): Omit<AgentLog, 'id' | 'timestamp'>[] {
    return [
      {
        message: 'Loading user preference model',
        reasoning: 'Initializing personalized content adaptation system. Using collaborative filtering with 1,247 similar teacher profiles',
        metadata: {
          processingTime: 600,
          modelUsed: 'user-preference-model',
          tokensProcessed: 0,
          parameters: {
            similarProfiles: 1247,
            adaptationMethod: 'collaborative_filtering'
          }
        }
      },
      {
        message: 'Analyzing teaching style preferences',
        reasoning: 'Extracting patterns from user history: prefers visual aids (0.89), hands-on activities (0.76), real-world examples (0.82)',
        metadata: {
          processingTime: 1000,
          modelUsed: 'user-preference-model',
          tokensProcessed: Math.floor(Math.random() * 500) + 200,
          parameters: {
            preferences: {
              visualAids: 0.89,
              handsOnActivities: 0.76,
              realWorldExamples: 0.82,
              groupWork: 0.65
            }
          }
        }
      },
      {
        message: 'Adapting content structure',
        reasoning: 'Modifying response to include visual descriptions, practical examples, and activity suggestions based on user preferences',
        metadata: {
          processingTime: 1400,
          modelUsed: 'content-adapter',
          tokensProcessed: Math.floor(Math.random() * 1000) + 500,
          confidence: Math.random() * 0.3 + 0.7,
          parameters: {
            adaptations: ['visual_descriptions', 'practical_examples', 'activity_suggestions'],
            adaptationStrength: 0.85
          }
        }
      },
      {
        message: 'Applying language preferences',
        reasoning: `Adapting to ${details.locale || 'English'} language preferences. Using appropriate cultural references and local examples`,
        metadata: {
          processingTime: 800,
          modelUsed: 'language-adapter',
          tokensProcessed: Math.floor(Math.random() * 500) + 200,
          parameters: {
            targetLanguage: details.locale || 'English',
            culturalAdaptation: true,
            localExamples: true
          }
        }
      }
    ];
  }

  private generateSuggestionsLogs(step: string, details: any): Omit<AgentLog, 'id' | 'timestamp'>[] {
    return [
      {
        message: 'Analyzing user interaction patterns',
        reasoning: 'Processing 23 previous interactions to identify common follow-up actions. Using Markov chain model for suggestion generation',
        metadata: {
          processingTime: 700,
          modelUsed: 'interaction-pattern-analyzer',
          tokensProcessed: Math.floor(Math.random() * 300) + 100,
          parameters: {
            previousInteractions: 23,
            patternModel: 'markov_chain'
          }
        }
      },
      {
        message: 'Generating contextual suggestions',
        reasoning: 'Based on current intent and user history, suggesting: makeSimpler (0.92), generateQuiz (0.78), addVisuals (0.85)',
        metadata: {
          processingTime: 900,
          modelUsed: 'suggestion-generator',
          tokensProcessed: Math.floor(Math.random() * 300) + 100,
          confidence: Math.random() * 0.3 + 0.7,
          parameters: {
            suggestions: [
              { action: 'makeSimpler', confidence: 0.92, reasoning: 'User often requests simpler versions' },
              { action: 'generateQuiz', confidence: 0.78, reasoning: 'Follows worksheet generation pattern' },
              { action: 'addVisuals', confidence: 0.85, reasoning: 'User prefers visual content' }
            ]
          }
        }
      }
    ];
  }

  private generateMonitoringLogs(step: string, details: any): Omit<AgentLog, 'id' | 'timestamp'>[] {
    return [
      {
        message: 'Recording workflow metrics',
        reasoning: 'Logging performance metrics: total processing time: 12.3s, tokens processed: 4,892, model calls: 7, success rate: 100%',
        metadata: {
          processingTime: 200,
          modelUsed: 'metrics-collector',
          tokensProcessed: 0,
          parameters: {
            totalProcessingTime: 12300,
            totalTokensProcessed: 4892,
            modelCalls: 7,
            successRate: 1.0
          }
        }
      },
      {
        message: 'Updating user activity profile',
        reasoning: 'Storing interaction data: intent type, subjects, grades, response quality, user satisfaction indicators',
        metadata: {
          processingTime: 300,
          modelUsed: 'activity-tracker',
          tokensProcessed: 0,
          parameters: {
            storedData: ['intent_type', 'subjects', 'grades', 'response_quality', 'satisfaction_indicators'],
            dataSize: '2.3KB'
          }
        }
      }
    ];
  }

  async logActivity(sessionId: string, activity: Omit<WorkflowActivity, 'sessionId' | 'timestamp'>): Promise<void> {
    const activities = this.activities.get(sessionId) || [];
    
    const newActivity: WorkflowActivity = {
      sessionId,
      timestamp: new Date(),
      ...activity,
    };

    activities.push(newActivity);
    this.activities.set(sessionId, activities);
  }

  async getWorkflowStatus(sessionId: string): Promise<AgentStatus[] | null> {
    return this.workflows.get(sessionId) || null;
  }

  async getAgentLogs(sessionId: string, agentId: string): Promise<AgentLog[]> {
    const workflow = this.workflows.get(sessionId);
    if (!workflow) {
      return [];
    }

    const agent = workflow.find(a => a.id === agentId);
    return agent?.logs || [];
  }

  async getSessionActivities(sessionId: string): Promise<WorkflowActivity[]> {
    return this.activities.get(sessionId) || [];
  }

  // Calculate workflow metrics
  async getWorkflowMetrics(sessionId: string): Promise<{
    totalAgents: number;
    completedAgents: number;
    failedAgents: number;
    averageProcessingTime: number;
    overallStatus: 'pending' | 'processing' | 'completed' | 'failed';
  }> {
    const workflow = this.workflows.get(sessionId);
    if (!workflow) {
      throw new Error(`Workflow not found for session: ${sessionId}`);
    }

    const totalAgents = workflow.length;
    const completedAgents = workflow.filter(a => a.status === 'completed').length;
    const failedAgents = workflow.filter(a => a.status === 'error').length;
    const inProgressAgents = workflow.filter(a => a.status === 'inProgress').length;

    // Calculate average processing time for completed agents
    const completedWithTimes = workflow.filter(a => 
      a.status === 'completed' && a.startTime && a.endTime
    );
    
    const averageProcessingTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, agent) => {
          const processingTime = agent.endTime!.getTime() - agent.startTime!.getTime();
          return sum + processingTime;
        }, 0) / completedWithTimes.length
      : 0;

    // Determine overall status
    let overallStatus: 'pending' | 'processing' | 'completed' | 'failed';
    if (failedAgents > 0) {
      overallStatus = 'failed';
    } else if (completedAgents === totalAgents) {
      overallStatus = 'completed';
    } else if (inProgressAgents > 0) {
      overallStatus = 'processing';
    } else {
      overallStatus = 'pending';
    }

    return {
      totalAgents,
      completedAgents,
      failedAgents,
      averageProcessingTime,
      overallStatus,
    };
  }

  // Cleanup old workflows (run periodically)
  async cleanupOldWorkflows(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const now = Date.now();
    const cutoffTime = now - maxAge;

    for (const [sessionId, workflow] of Array.from(this.workflows.entries())) {
      const lastActivity = Math.max(
        ...workflow.map((agent: AgentStatus) => 
          Math.max(
            agent.startTime?.getTime() || 0,
            agent.endTime?.getTime() || 0,
            ...agent.logs.map((log: AgentLog) => log.timestamp.getTime())
          )
        )
      );

      if (lastActivity < cutoffTime) {
        this.workflows.delete(sessionId);
        this.activities.delete(sessionId);
      }
    }
  }

  private notifyStatusUpdate(sessionId: string, agentId: string, status: string): void {
    // In a real application, this would use WebSockets or Server-Sent Events
    // to notify the frontend about agent status changes in real-time
    console.log(`Agent ${agentId} in session ${sessionId} status: ${status}`);
  }
} 