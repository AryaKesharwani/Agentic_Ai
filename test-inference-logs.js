// Test script to demonstrate enhanced fake inference logs
// Run this with: node test-inference-logs.js

class FakeInferenceLogger {
  constructor() {
    this.logs = [];
  }

  async simulateProcessing(delay) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async addFakeInferenceLog(agentId, step, details = {}) {
    const fakeLogs = this.generateFakeInferenceLogs(agentId, step, details);
    
    for (const log of fakeLogs) {
      this.logs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        ...log
      });
      
      console.log(`🤖 [${agentId}] ${log.message}`);
      console.log(`   Reasoning: ${log.reasoning}`);
      if (log.metadata) {
        console.log(`   Model: ${log.metadata.modelUsed}`);
        console.log(`   Processing Time: ${log.metadata.processingTime}ms`);
        console.log(`   Tokens: ${log.metadata.tokensProcessed}`);
      }
      console.log('');
      
      // Add realistic delays between logs
      await this.simulateProcessing(Math.random() * 500 + 200);
    }
  }

  generateFakeInferenceLogs(agentId, step, details) {
    const logs = [];
    
    switch (agentId) {
      case 'intentClassifier':
        logs.push(
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
          }
        );
        break;
        
      case 'orchestrator':
        logs.push(
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
          }
        );
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

  getLogs() {
    return this.logs;
  }

  getSummary() {
    const totalTime = this.logs.reduce((sum, log) => sum + (log.metadata?.processingTime || 0), 0);
    const totalTokens = this.logs.reduce((sum, log) => sum + (log.metadata?.tokensProcessed || 0), 0);
    const avgConfidence = this.logs
      .filter(log => log.metadata?.confidence)
      .reduce((sum, log) => sum + (log.metadata?.confidence || 0), 0) / 
      this.logs.filter(log => log.metadata?.confidence).length;

    return {
      totalLogs: this.logs.length,
      totalProcessingTime: totalTime,
      totalTokens: totalTokens,
      averageConfidence: avgConfidence || 0
    };
  }
}

// Demo function
async function demonstrateFakeInferenceLogs() {
  console.log('🚀 Starting Enhanced Fake Inference Logs Demonstration\n');
  
  const logger = new FakeInferenceLogger();
  
  // Simulate intent classification
  console.log('📋 Step 1: Intent Classification');
  console.log('=' .repeat(50));
  await logger.addFakeInferenceLog('intentClassifier', 'classification', {
    message: 'Create a worksheet for Mathematics Grade 3'
  });
  
  // Simulate orchestrator
  console.log('🎯 Step 2: Response Generation');
  console.log('=' .repeat(50));
  await logger.addFakeInferenceLog('orchestrator', 'response_generation', {
    message: 'Create a worksheet for Mathematics Grade 3',
    subjects: ['Mathematics'],
    grades: [3]
  });
  
  // Simulate judge
  console.log('⚖️ Step 3: Quality Assessment');
  console.log('=' .repeat(50));
  await logger.addFakeInferenceLog('judge', 'quality_assessment', {
    content: 'Generated worksheet content...',
    grades: [3]
  });
  
  // Show summary
  console.log('📊 Summary');
  console.log('=' .repeat(50));
  const summary = logger.getSummary();
  console.log(`Total Logs: ${summary.totalLogs}`);
  console.log(`Total Processing Time: ${summary.totalProcessingTime}ms (${(summary.totalProcessingTime / 1000).toFixed(1)}s)`);
  console.log(`Total Tokens Processed: ${summary.totalTokens}`);
  console.log(`Average Confidence: ${(summary.averageConfidence * 100).toFixed(1)}%`);
  
  console.log('\n✅ Enhanced fake inference logs demonstration completed!');
  console.log('\nThis demonstrates how the system creates realistic AI processing logs with:');
  console.log('• Detailed technical information (models, tokens, processing times)');
  console.log('• Realistic reasoning and sub-steps');
  console.log('• Confidence scores and parameters');
  console.log('• Proper timing and sequencing');
}

// Run the demonstration
if (require.main === module) {
  demonstrateFakeInferenceLogs().catch(console.error);
}

module.exports = { FakeInferenceLogger }; 