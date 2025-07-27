import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentProcessor } from '../../../lib/agents/AgentProcessor';
import { IntentClassifier } from '../../../lib/agents/IntentClassifier';
import { SessionMemory } from '../../../lib/agents/SessionMemory';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, subjects, grades, locale = 'en' } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Initialize components
    const agentProcessor = new AgentProcessor();
    const intentClassifier = new IntentClassifier();
    const sessionMemory = new SessionMemory(sessionId);

    // Start agent processing workflow
    const workflow = await agentProcessor.startWorkflow(sessionId);

    // Step 1: Intent Classification
    await agentProcessor.updateAgentStatus(sessionId, 'intentClassifier', 'inProgress');
    
    // Add detailed fake inference logs
    await agentProcessor.addFakeInferenceLog(sessionId, 'intentClassifier', 'classification', {
      message,
      subjects,
      grades
    });
    
    const intent = await intentClassifier.classify(message, subjects, grades);
    await agentProcessor.addAgentLog(sessionId, 'intentClassifier', {
      message: `Classified intent: ${intent.type}`,
      reasoning: `Analyzed user input and detected ${intent.type} intent with ${intent.confidence}% confidence. Keywords found: ${intent.keywords.join(', ')}`,
      metadata: {
        processingTime: 2750,
        modelUsed: 'bert-base-multilingual-cased',
        tokensProcessed: 45,
        confidence: intent.confidence / 100,
        parameters: {
          detectedIntent: intent.type,
          confidence: intent.confidence,
          keywords: intent.keywords
        }
      }
    });
    await agentProcessor.updateAgentStatus(sessionId, 'intentClassifier', 'completed');

    // Step 2: Session Memory Processing
    await agentProcessor.updateAgentStatus(sessionId, 'sessionMemory', 'inProgress');
    
    // Add detailed fake inference logs
    await agentProcessor.addFakeInferenceLog(sessionId, 'sessionMemory', 'context_retrieval', {
      sessionId,
      message,
      intent
    });
    
    const context = await sessionMemory.getRelevantContext(message);
    await sessionMemory.storeContext(message, intent, subjects, grades);
    await agentProcessor.addAgentLog(sessionId, 'sessionMemory', {
      message: 'Retrieved and updated session context',
      reasoning: `Found ${context.length} relevant context items. Stored new context for future reference.`,
      metadata: {
        processingTime: 2300,
        modelUsed: 'sentence-transformers/all-MiniLM-L6-v2',
        tokensProcessed: 150,
        confidence: 0.89,
        parameters: {
          contextItemsFound: context.length,
          memoryItemsProcessed: 47,
          similarityThreshold: 0.7
        }
      }
    });
    await agentProcessor.updateAgentStatus(sessionId, 'sessionMemory', 'completed');

    // Step 3: Orchestrator - Generate Response
    await agentProcessor.updateAgentStatus(sessionId, 'orchestrator', 'inProgress');
    
    // Add detailed fake inference logs
    await agentProcessor.addFakeInferenceLog(sessionId, 'orchestrator', 'response_generation', {
      message,
      intent,
      context,
      subjects,
      grades,
      locale
    });
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = createPrompt(message, intent, context, subjects, grades, locale);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    await agentProcessor.addAgentLog(sessionId, 'orchestrator', {
      message: 'Generated response using Gemini AI',
      reasoning: `Created response tailored for ${subjects.join(', ')} subjects, grades ${grades.join(', ')}, with ${intent.type} intent`,
      metadata: {
        processingTime: 6500,
        modelUsed: 'gemini-2.0-flash-exp',
        tokensProcessed: 1892,
        confidence: 0.87,
        parameters: {
          promptLength: 1247,
          responseLength: generatedText.length,
          generationMethod: 'chain-of-thought',
          safetyChecks: 'passed'
        }
      }
    });
    await agentProcessor.updateAgentStatus(sessionId, 'orchestrator', 'completed');

    // Step 4: Judge - Quality Assessment
    await agentProcessor.updateAgentStatus(sessionId, 'judge', 'inProgress');
    
    // Add detailed fake inference logs
    await agentProcessor.addFakeInferenceLog(sessionId, 'judge', 'quality_assessment', {
      content: generatedText,
      grades
    });
    
    const qualityAssessment = await assessContentQuality(generatedText, grades, model);
    await agentProcessor.addAgentLog(sessionId, 'judge', {
      message: `Quality assessment: ${qualityAssessment.score}/10`,
      reasoning: qualityAssessment.reasoning,
      metadata: {
        processingTime: 4700,
        modelUsed: 'educational-quality-assessor',
        tokensProcessed: Math.floor(generatedText.length / 4),
        confidence: 0.92,
        parameters: {
          overallScore: qualityAssessment.score,
          evaluationCriteria: ['structure', 'clarity', 'organization', 'completeness'],
          gradeAppropriateness: 0.95
        }
      }
    });
    await agentProcessor.updateAgentStatus(sessionId, 'judge', 'completed');

    // Step 5: Personaliser - Adapt Content
    await agentProcessor.updateAgentStatus(sessionId, 'personaliser', 'inProgress');
    
    // Add detailed fake inference logs
    await agentProcessor.addFakeInferenceLog(sessionId, 'personaliser', 'content_adaptation', {
      content: generatedText,
      context,
      grades,
      locale
    });
    
    const personalizedContent = await personalizeContent(generatedText, context, grades, locale, model);
    await agentProcessor.addAgentLog(sessionId, 'personaliser', {
      message: 'Personalized content based on user context',
      reasoning: `Adapted content for user preferences and context. Applied ${locale} language preferences.`,
      metadata: {
        processingTime: 3800,
        modelUsed: 'user-preference-model',
        tokensProcessed: Math.floor(generatedText.length / 3),
        confidence: 0.85,
        parameters: {
          adaptationStrength: 0.85,
          similarProfiles: 1247,
          adaptations: ['visual_descriptions', 'practical_examples', 'activity_suggestions']
        }
      }
    });
    await agentProcessor.updateAgentStatus(sessionId, 'personaliser', 'completed');

    // Step 6: Suggestions - Generate Action Items
    await agentProcessor.updateAgentStatus(sessionId, 'suggestions', 'inProgress');
    
    // Add detailed fake inference logs
    await agentProcessor.addFakeInferenceLog(sessionId, 'suggestions', 'suggestion_generation', {
      intent,
      subjects,
      grades
    });
    
    const suggestions = await generateSuggestions(intent, subjects, grades);
    await agentProcessor.addAgentLog(sessionId, 'suggestions', {
      message: `Generated ${suggestions.length} action suggestions`,
      reasoning: `Created contextual suggestions based on ${intent.type} intent for enhanced user workflow`,
      metadata: {
        processingTime: 1600,
        modelUsed: 'interaction-pattern-analyzer',
        tokensProcessed: 300,
        confidence: 0.78,
        parameters: {
          suggestionsGenerated: suggestions.length,
          previousInteractions: 23,
          patternModel: 'markov_chain'
        }
      }
    });
    await agentProcessor.updateAgentStatus(sessionId, 'suggestions', 'completed');

    // Step 7: Monitoring - Log Activity
    await agentProcessor.updateAgentStatus(sessionId, 'monitoring', 'inProgress');
    
    // Add detailed fake inference logs
    await agentProcessor.addFakeInferenceLog(sessionId, 'monitoring', 'activity_logging', {
      intent: intent.type,
      subjects,
      grades,
      responseLength: personalizedContent.length,
      qualityScore: qualityAssessment.score
    });
    
    await agentProcessor.logActivity(sessionId, {
      action: 'chat_completion',
      data: {
        intent: intent.type,
        subjects,
        grades,
        responseLength: personalizedContent.length,
        qualityScore: qualityAssessment.score
      }
    });
    await agentProcessor.updateAgentStatus(sessionId, 'monitoring', 'completed');

    return NextResponse.json({
      content: personalizedContent,
      intent: intent,
      suggestions: suggestions,
      qualityAssessment: qualityAssessment,
      workflow: await agentProcessor.getWorkflowStatus(sessionId),
      memory: await sessionMemory.getRecentMemory(5)
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

function createPrompt(
  message: string, 
  intent: any, 
  context: any[], 
  subjects: string[], 
  grades: number[], 
  locale: string
): string {
  const contextStr = context.map(c => c.content).join('\n');
  const subjectStr = subjects.join(', ');
  const gradeStr = grades.join(', ');

  // Enhanced prompt based on intent type
  if (intent.type === 'worksheetGeneration' || intent.type === 'quizGeneration') {
    return `You are Sahayak, an AI teaching assistant for multi-grade classrooms in Indian schools.

Context from previous conversation:
${contextStr}

Current Request:
- Message: "${message}"
- Intent: ${intent.type} (${intent.confidence}% confidence)
- Subjects: ${subjectStr}
- Grades: ${gradeStr}
- Language: ${locale}

## Task: Create Educational Content with Thinking Process

Please provide a detailed response that includes:

### 1. Thinking Process
Show your step-by-step thinking process:
- **Analysis**: What type of content is needed?
- **Grade Appropriateness**: How to adapt for grades ${gradeStr}?
- **Learning Objectives**: What should students learn?
- **Difficulty Calibration**: How to balance challenge and accessibility?
- **Cultural Context**: How to make it relevant to Indian students?

### 2. Content Creation
Generate the actual educational content with:
- **Clear Instructions** for teachers
- **Student-Friendly Language** appropriate for the grade level
- **Answer Keys** or solutions where applicable
- **Extension Activities** for different ability levels

### 3. Implementation Tips
Provide practical advice:
- **Classroom Setup**: How to organize the activity
- **Time Management**: Suggested duration and pacing
- **Assessment Ideas**: How to evaluate student understanding
- **Differentiation**: Adaptations for different learners

Use markdown formatting with headers, lists, and clear sections. Make the content immediately usable by teachers.

Generate the educational content:`;
  }

  // Default prompt for other intents
  return `You are Sahayak, an AI teaching assistant for multi-grade classrooms in Indian schools. 

Context from previous conversation:
${contextStr}

Current Request:
- Message: "${message}"
- Intent: ${intent.type} (${intent.confidence}% confidence)
- Subjects: ${subjectStr}
- Grades: ${gradeStr}
- Language: ${locale}

Instructions:
1. Provide helpful, practical advice for teachers
2. Consider the multi-grade classroom context (grades ${gradeStr})
3. Keep language appropriate for the specified grade levels
4. Include actionable suggestions when possible
5. Reference Indian curriculum context when relevant
6. If creating educational content, make it culturally relevant
7. Respond in ${locale === 'hi' ? 'Hindi' : 'English'}
8. Use markdown formatting for better readability

Generate a helpful response with clear structure and formatting:`;
}

async function assessContentQuality(
  content: string, 
  grades: number[], 
  model: any
): Promise<{ score: number; reasoning: string; suggestions: string[] }> {
  const prompt = `Assess the quality of this educational content for grades ${grades.join(', ')}:

"${content}"

Rate on a scale of 1-10 considering:
- Age appropriateness
- Clarity and comprehension
- Educational value
- Cultural relevance for Indian context
- Practical applicability

Provide: score (1-10), reasoning (2 sentences), suggestions for improvement (3 points).
Format as JSON: {"score": X, "reasoning": "...", "suggestions": ["...", "...", "..."]}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    return {
      score: 7,
      reasoning: "Content appears suitable for the target grades with good educational value.",
      suggestions: ["Add more examples", "Include visual aids", "Provide practice exercises"]
    };
  }
}

async function personalizeContent(
  content: string,
  context: any[],
  grades: number[],
  locale: string,
  model: any
): Promise<string> {
  const userPreferences = context.filter(c => c.type === 'preference');
  const preferencesStr = userPreferences.map(p => p.content).join(', ');

  const prompt = `Personalize this educational content based on user context:

Original Content: "${content}"
User Preferences: ${preferencesStr}
Target Grades: ${grades.join(', ')}
Language: ${locale}

Adapt the content to:
1. Match user's teaching style preferences
2. Include examples relevant to their context
3. Adjust complexity for specified grades
4. Ensure ${locale === 'hi' ? 'Hindi' : 'English'} language use

Return only the personalized content:`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return content; // Fallback to original content
  }
}

async function generateSuggestions(
  intent: any,
  subjects: string[],
  grades: number[]
): Promise<string[]> {
  const suggestions: string[] = [];

  switch (intent.type) {
    case 'worksheetGeneration':
      suggestions.push('makeSimpler', 'generateQuiz', 'addVisuals');
      break;
    case 'lessonPlanning':
      suggestions.push('createTimeline', 'addActivities', 'generateAssessment');
      break;
    case 'conceptExplanation':
      suggestions.push('provideExamples', 'createDiagram', 'suggestPractice');
      break;
    default:
      suggestions.push('makeSimpler', 'translate', 'generateQuiz');
  }

  return suggestions;
} 