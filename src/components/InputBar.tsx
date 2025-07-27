'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Alert,
  Fade,
} from '@mui/material';
import { Send, Mic, Subject, Grade } from '@mui/icons-material';
import { useAgentStore } from '@/store/agentStore';
import ThinkingProcess from './ThinkingProcess';
import WorksheetGenerationWorkflow from './WorksheetGenerationWorkflow';
import VoiceInput from './VoiceInput';
import LoadingAnimation from './LoadingAnimation';
import geminiService from '@/lib/gemini/geminiService';

interface InputBarProps {
  session: any;
  isProcessing: boolean;
  onSend: (message: string) => void;
}

export default function InputBar({ session, isProcessing, onSend }: InputBarProps) {
  const { addMessage } = useAgentStore();
  const [inputText, setInputText] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [detectedIntent, setDetectedIntent] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [showWorksheetWorkflow, setShowWorksheetWorkflow] = useState(false);
  const [worksheetTrigger, setWorksheetTrigger] = useState('');
  const [isClassifyingIntent, setIsClassifyingIntent] = useState(false);
  const [intentResult, setIntentResult] = useState<any>(null);

  // Enhanced intent detection using Gemini AI
  useEffect(() => {
    const classifyIntent = async () => {
      if (inputText.trim().length < 10) {
        setDetectedIntent(null);
        setIntentResult(null);
        return;
      }

      setIsClassifyingIntent(true);
      
      try {
        const result = await geminiService.classifyIntent(inputText);
        setDetectedIntent(result.intent);
        setIntentResult(result);
      } catch (error) {
        console.error('Intent classification failed:', error);
        // Fallback to basic detection
        setDetectedIntent(basicIntentDetection(inputText));
      } finally {
        setIsClassifyingIntent(false);
      }
    };

    const timeoutId = setTimeout(classifyIntent, 1500);
    return () => clearTimeout(timeoutId);
  }, [inputText]);

  const basicIntentDetection = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    const worksheetKeywords = [
      'worksheet', 'activity sheet', 'assessment', 'reinforcement', 
      'practice problems', 'exercises', 'assignment', 'homework',
      'test paper', 'evaluation', 'problem set', 'workbook',
      'drill', 'practice sheet', 'student activity'
    ];
    
    const hasWorksheetIntent = worksheetKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    if (hasWorksheetIntent) {
      return 'worksheetGeneration';
    } else if (lowerText.includes('quiz') || lowerText.includes('test')) {
      return 'quizGeneration';
    } else if (lowerText.includes('lesson plan')) {
      return 'lessonPlanning';
    } else if (lowerText.includes('explain') || lowerText.includes('concept')) {
      return 'conceptExplanation';
    }
    
    return null;
  };

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const currentInputText = inputText;
    
    // Check if this is a worksheet generation request
    const isWorksheetGeneration = detectedIntent === 'worksheetGeneration';
    
    if (isWorksheetGeneration) {
      setWorksheetTrigger(currentInputText);
      setShowWorksheetWorkflow(true);
      setInputText('');
      return; // Don't proceed with normal chat flow
    }
    
    // Check if this is other content generation that should show thinking process
    const isOtherContentGeneration = inputText.toLowerCase().includes('quiz') ||
                                     inputText.toLowerCase().includes('create') ||
                                     inputText.toLowerCase().includes('generate');
    
    if (isOtherContentGeneration) {
      setShowThinking(true);
    }

    // Add teacher message
    addMessage(session.id, {
      agentId: 'teacher',
      content: inputText,
      suggestions: [],
      isEditable: true,
    });

    setInputText('');

    // Call the parent's onSend function
    onSend(currentInputText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Worksheet Generation Workflow */}
      {showWorksheetWorkflow && (
        <WorksheetGenerationWorkflow
          trigger={worksheetTrigger}
          onComplete={(worksheet) => {
            // Add the generated worksheet as a message
            addMessage(session.id, {
              agentId: 'orchestrator',
              content: worksheet,
              suggestions: ['generateQuiz', 'makeSimpler', 'translate'],
              isEditable: false,
            });
            setShowWorksheetWorkflow(false);
          }}
          onCancel={() => {
            setShowWorksheetWorkflow(false);
          }}
        />
      )}

      {/* Thinking Process for Educational Content Generation */}
      {showThinking && (
        <ThinkingProcess
          intent={detectedIntent || 'worksheetGeneration'}
          subjects={selectedSubjects}
          grades={selectedGrades}
          isProcessing={isProcessing}
          onComplete={() => {
            // Thinking process completed
            setShowThinking(false);
            console.log('Thinking process completed');
          }}
        />
      )}

      {/* Intent Classification Loading */}
      {isClassifyingIntent && (
        <Fade in={true}>
          <Box sx={{ mb: 2 }}>
            <LoadingAnimation 
              type="analyzing"
              message="AI analyzing your request..."
              showSkeleton={false}
            />
          </Box>
        </Fade>
      )}

      {/* Intent Detection Alert */}
      {intentResult && detectedIntent && !isClassifyingIntent && (
        <Fade in={true}>
          <Alert 
            severity={detectedIntent === 'unsure' ? 'warning' : 'info'} 
            sx={{ mb: 2 }}
            onClose={() => setIntentResult(null)}
          >
            <Typography variant="body2">
              <strong>🤖 AI Detected:</strong> {
                detectedIntent === 'worksheetGeneration' ? '📝 Worksheet Generation' :
                detectedIntent === 'quizGeneration' ? '📊 Quiz Generation' :
                detectedIntent === 'lessonPlanning' ? '📚 Lesson Planning' :
                detectedIntent === 'conceptExplanation' ? '💡 Concept Explanation' :
                detectedIntent === 'doubtHelp' ? '❓ Doubt Resolution' :
                '🤔 Unclear Request'
              }
              <br />
              <strong>Confidence:</strong> {Math.round(intentResult.confidence * 100)}%
              {intentResult.extractedInfo?.subject && (
                <>
                  <br />
                  <strong>Subject:</strong> {intentResult.extractedInfo.subject} 
                  {intentResult.extractedInfo?.grade && ` | Grade: ${intentResult.extractedInfo.grade}`}
                </>
              )}
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Quick Action Chips */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label="📝 Create worksheet"
          variant="outlined"
          size="small"
          clickable
          onClick={() => setInputText('Create a mathematics worksheet for Grade 3 students with basic addition and subtraction problems')}
          sx={{ 
            '&:hover': { bgcolor: 'primary.light', color: 'white' },
            transition: 'all 0.2s'
          }}
        />
        {/* <Chip
          label="📊 Make quiz"
          variant="outlined"
          size="small"
          clickable
          onClick={() => setInputText('Create a quiz for ')}
          sx={{ 
            '&:hover': { bgcolor: 'secondary.light', color: 'white' },
            transition: 'all 0.2s'
          }}
        /> */}
        {/* <Chip
          label="💡 Explain concept"
          variant="outlined"
          size="small"
          clickable
          onClick={() => setInputText('Explain the concept of ')}
          sx={{ 
            '&:hover': { bgcolor: 'info.light', color: 'white' },
            transition: 'all 0.2s'
          }}
        />
        <Chip
          label="📚 Plan lesson"
          variant="outlined"
          size="small"
          clickable
          onClick={() => setInputText('Create a lesson plan for ')}
          sx={{ 
            '&:hover': { bgcolor: 'success.light', color: 'white' },
            transition: 'all 0.2s'
          }}
        /> */}
      </Box>

      {/* Main Input Area */}
      <Paper
        elevation={4}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          border: 2,
          borderColor: 'primary.light',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
        }}
      >
        {/* Voice Input and Quick Actions */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Add subject/grade">
            <IconButton size="small">
              <Subject />
            </IconButton>
          </Tooltip>
          <VoiceInput
            onTranscript={(transcript) => {
              setInputText(transcript);
            }}
            onError={(error) => {
              console.error('Voice input error:', error);
            }}
            size="small"
            showTranscript={false}
            disabled={isProcessing}
          />
        </Box>

        {/* Text Input */}
        <TextField
          multiline
          maxRows={4}
          fullWidth
          variant="outlined"
          placeholder="Ask me to create worksheets, quizzes, lesson plans, or explain concepts..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isProcessing}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
        />

        {/* Send Button */}
        <IconButton
          onClick={handleSend}
          disabled={!inputText.trim() || isProcessing}
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #0d47a1 30%, #1976d2 90%)',
              transform: 'scale(1.05)',
            },
            '&:disabled': {
              background: 'linear-gradient(45deg, #bdbdbd 30%, #9e9e9e 90%)',
              color: 'grey.600',
            },
            width: 56,
            height: 56,
            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          <Send />
        </IconButton>
      </Paper>
    </Box>
  );
} 