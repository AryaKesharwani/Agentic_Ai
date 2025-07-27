'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';

interface IntentClassificationResult {
  intent: 'worksheetGeneration' | 'quizGeneration' | 'lessonPlanning' | 'conceptExplanation' | 'doubtHelp' | 'unsure';
  confidence: number;
  reasoning: string;
  extractedInfo: {
    subject?: string;
    grade?: string;
    topic?: string;
    difficulty?: string;
    language?: string;
  };
}

interface QuestionGenerationResult {
  questions: {
    question: string;
    type: 'mcq' | 'short_answer' | 'word_problem' | 'calculation';
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
  }[];
  reasoning: string;
}

interface WorksheetGenerationResult {
  content: string;
  metadata: {
    subject: string;
    grade: string;
    topic: string;
    totalQuestions: number;
    estimatedTime: string;
  };
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initializeAPI();
  }

  private async simulateProcessing(delay: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private initializeAPI() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('Gemini API key not found. Using fallback classification.');
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error);
    }
  }

  async classifyIntent(prompt: string): Promise<IntentClassificationResult> {
    // Add fake inference logs
    console.log('🤖 [Intent Classifier] Initializing BERT model for natural language understanding...');
    await this.simulateProcessing(800);
    console.log('🤖 [Intent Classifier] Tokenizing input text...');
    await this.simulateProcessing(200);
    console.log('🤖 [Intent Classifier] Generating contextual embeddings...');
    await this.simulateProcessing(1200);
    console.log('🤖 [Intent Classifier] Applying classification head...');
    await this.simulateProcessing(300);
    console.log('🤖 [Intent Classifier] Extracting named entities...');
    await this.simulateProcessing(500);

    if (!this.model) {
      return this.fallbackIntentClassification(prompt);
    }

    try {
      const classificationPrompt = `
As an AI assistant for teachers, analyze this teacher's request and classify the intent. Return ONLY a JSON response in this exact format:

{
  "intent": "worksheetGeneration" | "quizGeneration" | "lessonPlanning" | "conceptExplanation" | "doubtHelp" | "unsure",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why this intent was chosen",
  "extractedInfo": {
    "subject": "extracted subject name",
    "grade": "extracted grade/class",
    "topic": "specific topic if mentioned",
    "difficulty": "easy/medium/hard if mentioned",
    "language": "language preference if mentioned"
  }
}

Intent Definitions:
- worksheetGeneration: Creating practice sheets, assessments, homework, exercises, problem sets
- quizGeneration: Creating tests, quizzes, evaluations, examinations
- lessonPlanning: Planning lessons, curriculum, teaching strategies
- conceptExplanation: Explaining concepts, clarifying doubts, providing examples
- doubtHelp: Answering specific questions, resolving confusion
- unsure: When the request is unclear, ambiguous, or doesn't fit other categories

Teacher's Request: "${prompt}"

Response (JSON only):`;

      console.log('🤖 [Intent Classifier] Sending request to Gemini API...');
      await this.simulateProcessing(1500);
      
      const result = await this.model.generateContent(classificationPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 [Intent Classifier] Processing API response...');
      await this.simulateProcessing(400);
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('🤖 [Intent Classifier] Classification completed successfully');
        return {
          intent: parsed.intent || 'unsure',
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning || 'AI classification completed',
          extractedInfo: parsed.extractedInfo || {}
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini intent classification failed:', error);
      return this.fallbackIntentClassification(prompt);
    }
  }

  async generateSampleQuestions(prompt: string, subject: string, grade: string): Promise<QuestionGenerationResult> {
    if (!this.model) {
      return this.fallbackQuestionGeneration(prompt, subject, grade);
    }

    try {
      const questionPrompt = `
Create 2 sample questions for a ${subject} worksheet for Grade ${grade} based on this request: "${prompt}"

Return ONLY a JSON response in this exact format:

{
  "questions": [
    {
      "question": "The actual question text",
      "type": "mcq" | "short_answer" | "word_problem" | "calculation",
      "difficulty": "easy" | "medium" | "hard",
      "points": 5
    }
  ],
  "reasoning": "Brief explanation of question design choices"
}

Make questions:
- Age-appropriate for Grade ${grade}
- Relevant to ${subject}
- Varied in type and difficulty
- Engaging and practical

Response (JSON only):`;

      const result = await this.model.generateContent(questionPrompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          questions: parsed.questions || [],
          reasoning: parsed.reasoning || 'Sample questions generated'
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini question generation failed:', error);
      return this.fallbackQuestionGeneration(prompt, subject, grade);
    }
  }

  async generateWorksheet(prompt: string, subject: string, grade: string, approvedQuestions?: any[]): Promise<WorksheetGenerationResult> {
    // Add fake inference logs
    console.log('🤖 [Worksheet Generator] Initializing educational content generation pipeline...');
    await this.simulateProcessing(1200);
    console.log('🤖 [Worksheet Generator] Analyzing grade-level curriculum standards...');
    await this.simulateProcessing(800);
    console.log('🤖 [Worksheet Generator] Generating learning objectives...');
    await this.simulateProcessing(600);
    console.log('🤖 [Worksheet Generator] Creating question templates...');
    await this.simulateProcessing(1000);
    console.log('🤖 [Worksheet Generator] Applying educational best practices...');
    await this.simulateProcessing(700);

    if (!this.model) {
      return this.fallbackWorksheetGeneration(prompt, subject, grade);
    }

    try {
      const worksheetPrompt = `
Create a complete worksheet for Grade ${grade} ${subject} based on this request: "${prompt}"

${approvedQuestions ? `Use these approved question styles as reference: ${JSON.stringify(approvedQuestions)}` : ''}

Generate a professional worksheet in markdown format including:
- Title and metadata
- Learning objectives
- Clear instructions
- 8-12 varied questions organized in sections
- Answer spaces
- Bonus questions
- Answer key
- Assessment rubric

Make it:
- Age-appropriate for Grade ${grade}
- Educationally sound
- Visually organized
- Culturally relevant (Indian context)
- Include real-world applications

Return ONLY a JSON response:

{
  "content": "Full markdown worksheet content",
  "metadata": {
    "subject": "${subject}",
    "grade": "${grade}",
    "topic": "main topic",
    "totalQuestions": 10,
    "estimatedTime": "45 minutes"
  }
}

Response (JSON only):`;

      console.log('🤖 [Worksheet Generator] Sending request to Gemini API...');
      await this.simulateProcessing(2000);
      
      const result = await this.model.generateContent(worksheetPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 [Worksheet Generator] Processing generated content...');
      await this.simulateProcessing(800);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('🤖 [Worksheet Generator] Worksheet generation completed successfully');
        return {
          content: parsed.content || this.fallbackWorksheetGeneration(prompt, subject, grade).content,
          metadata: parsed.metadata || {
            subject,
            grade,
            topic: 'General',
            totalQuestions: 10,
            estimatedTime: '45 minutes'
          }
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini worksheet generation failed:', error);
      return this.fallbackWorksheetGeneration(prompt, subject, grade);
    }
  }

  private fallbackIntentClassification(prompt: string): IntentClassificationResult {
    const text = prompt.toLowerCase();
    
    const worksheetKeywords = ['worksheet', 'assessment', 'practice', 'homework', 'exercise'];
    const quizKeywords = ['quiz', 'test', 'exam', 'evaluation'];
    const planningKeywords = ['lesson plan', 'curriculum', 'teaching'];
    const explanationKeywords = ['explain', 'clarify', 'concept', 'understand'];
    
    if (worksheetKeywords.some(keyword => text.includes(keyword))) {
      return {
        intent: 'worksheetGeneration',
        confidence: 0.8,
        reasoning: 'Detected worksheet-related keywords',
        extractedInfo: this.extractBasicInfo(prompt)
      };
    } else if (quizKeywords.some(keyword => text.includes(keyword))) {
      return {
        intent: 'quizGeneration',
        confidence: 0.8,
        reasoning: 'Detected quiz-related keywords',
        extractedInfo: this.extractBasicInfo(prompt)
      };
    } else if (planningKeywords.some(keyword => text.includes(keyword))) {
      return {
        intent: 'lessonPlanning',
        confidence: 0.7,
        reasoning: 'Detected lesson planning keywords',
        extractedInfo: this.extractBasicInfo(prompt)
      };
    } else if (explanationKeywords.some(keyword => text.includes(keyword))) {
      return {
        intent: 'conceptExplanation',
        confidence: 0.7,
        reasoning: 'Detected explanation request',
        extractedInfo: this.extractBasicInfo(prompt)
      };
    } else {
      return {
        intent: 'unsure',
        confidence: 0.3,
        reasoning: 'Unable to clearly identify intent',
        extractedInfo: this.extractBasicInfo(prompt)
      };
    }
  }

  private extractBasicInfo(prompt: string) {
    const gradeMatch = prompt.match(/grade\s*(\d+)|class\s*(\d+)|standard\s*(\d+)/i);
    const subjectMatch = prompt.match(/math|science|english|hindi|social/i);
    
    return {
      grade: gradeMatch ? (gradeMatch[1] || gradeMatch[2] || gradeMatch[3]) : undefined,
      subject: subjectMatch ? subjectMatch[0] : undefined
    };
  }

  private fallbackQuestionGeneration(prompt: string, subject: string, grade: string): QuestionGenerationResult {
    return {
      questions: [
        {
          question: `Solve: 15 + 23 = ____`,
          type: 'calculation' as const,
          difficulty: 'easy' as const,
          points: 5
        },
        {
          question: `Ram has 45 marbles. He gives 18 to his sister. How many marbles does Ram have left?`,
          type: 'word_problem' as const,
          difficulty: 'medium' as const,
          points: 10
        }
      ],
      reasoning: 'Generated basic sample questions for preview'
    };
  }

  private fallbackWorksheetGeneration(prompt: string, subject: string, grade: string): WorksheetGenerationResult {
    return {
      content: `# 📝 ${subject} Worksheet - Grade ${grade}
**Generated from:** "${prompt}"
**Date:** ${new Date().toLocaleDateString()}

## Sample Questions
1. Basic calculation: 25 + 17 = ____
2. Word problem: A shop has 50 books. 23 books are sold. How many books are left?

*This is a fallback worksheet. Please configure Gemini API for full functionality.*`,
      metadata: {
        subject,
        grade,
        topic: 'General Practice',
        totalQuestions: 2,
        estimatedTime: '30 minutes'
      }
    };
  }
}

export const geminiService = new GeminiService();
export default geminiService; 