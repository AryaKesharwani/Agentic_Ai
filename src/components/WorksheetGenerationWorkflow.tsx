'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Chip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Fade,
  Grow,
  alpha,
} from '@mui/material';
import {
  Psychology,
  AutoAwesome,
  Person,
  ThumbUp,
  ThumbDown,
  Gavel,
  Memory,
  Visibility,
  HandshakeOutlined,
  Schedule,
  PictureAsPdf,
  Notifications,
  CheckCircle,
  PlayArrow,
  Refresh,
  HelpOutline,
} from '@mui/icons-material';
import LoadingAnimation from './LoadingAnimation';
import geminiService from '@/lib/gemini/geminiService';
import { useWorksheetWorkflowStore } from '@/store/worksheetWorkflowStore';

interface WorkflowStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  subSteps?: string[];
}

interface WorksheetGenerationWorkflowProps {
  trigger: string;
  onComplete: (worksheet: string) => void;
  onCancel: () => void;
}

// Skeleton Agent Card Component
const SkeletonAgentCard = ({ index }: { index: number }) => (
  <Card
    sx={{
      opacity: 0.8,
      bgcolor: 'grey.50',
      border: '1px dashed',
      borderColor: 'grey.300',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        bgcolor: 'grey.300',
        borderRadius: '4px 4px 0 0',
        animation: 'shimmer 2s infinite',
        '@keyframes shimmer': {
          '0%': { opacity: 0.3 },
          '50%': { opacity: 0.7 },
          '100%': { opacity: 0.3 },
        },
      },
    }}
  >
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
        <Skeleton variant="circular" width={16} height={16} sx={{ ml: 'auto' }} />
      </Box>
      <Skeleton variant="text" width="70%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width={60} height={20} />
    </CardContent>
  </Card>
);

export default function WorksheetGenerationWorkflow({ 
  trigger, 
  onComplete, 
  onCancel 
}: WorksheetGenerationWorkflowProps) {
  // Use Zustand store for all state management
  const {
    currentStep,
    isRunning,
    progress,
    currentSubStep,
    showInitialThinking,
    intentClassified,
    extractedInfo,
    showFeedback,
    feedbackGiven,
    sampleQuestions,
    isRegenerating,
    regenerationCount,
    schedulerOpen,
    selectedDate,
    steps,
    
    setCurrentStep,
    setIsRunning,
    setProgress,
    setCurrentSubStep,
    setShowInitialThinking,
    setIntentClassified,
    setExtractedInfo,
    setShowFeedback,
    setFeedbackGiven,
    setSampleQuestions,
    setIsRegenerating,
    setSchedulerOpen,
    setSelectedDate,
    updateStepStatus,
    resetWorkflow,
    incrementRegenerationCount,
    setRegenerationCount,
  } = useWorksheetWorkflowStore();

  // Skeleton state management
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [activeAgents, setActiveAgents] = useState<Set<number>>(new Set());

  // Get steps with icons populated (store has null icons)
  const stepsWithIcons = steps.map(step => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'orchestrator': <Psychology />,
      'intent-classifier': <AutoAwesome />,
      'worksheet-generator': <PlayArrow />,
      'personaliser': <Person />,
      'judge': <Gavel />,
      'feedback': <ThumbUp />,
      'memory': <Memory />,
      'scheduler': <Schedule />,
      'pdf-exporter': <PictureAsPdf />,
      'notifier': <Notifications />,
    };
    
    return {
      ...step,
      icon: iconMap[step.id] || <AutoAwesome />
    };
  });

  // Track which agents have been activated
  useEffect(() => {
    const newActiveAgents = new Set<number>();

    steps.forEach((step, index) => {
      if (step.status === 'running' || step.status === 'completed' || step.status === 'error') {
        newActiveAgents.add(index);
      }
    });

    // Hide skeletons immediately when any agent becomes active
    if (newActiveAgents.size > 0) {
      setShowSkeletons(false);
    } else {
      setShowSkeletons(true);
    }

    setActiveAgents(newActiveAgents);
  }, [steps]);

  useEffect(() => {
    if (isRunning) {
      console.log('Starting workflow execution...');
      runWorkflow();
    }
  }, [isRunning]);

  useEffect(() => {
    // Debug: Track current step changes
    if (currentStep >= 0) {
      console.log(`Current step: ${currentStep} - ${steps[currentStep]?.name || 'Unknown'}`);
    }
  }, [currentStep]);

  // Clean up function - reset workflow when component unmounts
  useEffect(() => {
    return () => {
      resetWorkflow();
    };
  }, [resetWorkflow]);

  const runWorkflow = async () => {
    // Step 1: Initial AI thinking phase
    setShowInitialThinking(true);
    await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 4000)); // 5-9 seconds
    
    // Classify intent using Gemini
    const intentResult = await geminiService.classifyIntent(trigger);
    setExtractedInfo(intentResult.extractedInfo);
    setIntentClassified(true);
    setShowInitialThinking(false);

    // If intent is unsure, handle accordingly
    if (intentResult.intent === 'unsure') {
      updateStepStatus(1, 'error'); // Intent classifier is at index 1
      return;
    }

    // Continue with normal workflow
    for (let i = 0; i < steps.length; i++) {
      if (!isRunning) break;

      console.log(`Starting step ${i}: ${steps[i].name}`);
      setCurrentStep(i);
      updateStepStatus(i, 'running');

      // Add random delays for realistic timing
      const randomDelay = Math.random() * 3000 + 1500; // 1.5-4.5 seconds extra

      // Special handling for manual steps
      if (steps[i].id === 'feedback') {
        console.log('Entering feedback step...');
        // Generate sample questions before showing feedback
        const subject = extractedInfo.subject || 'Mathematics';
        const grade = extractedInfo.grade || '3';
        
        const questionsResult = await geminiService.generateSampleQuestions(trigger, subject, grade);
        setSampleQuestions(questionsResult.questions);
        
        setShowFeedback(true);
        console.log('Waiting for feedback...');
        
        try {
          await waitForFeedback();
          console.log('Feedback received, continuing workflow...');
        } catch (error) {
          console.error('Error in feedback step:', error);
        }
        
        // Reset feedback state and mark step as completed
        setFeedbackGiven(null);
        updateStepStatus(i, 'completed');
        setProgress(((i + 1) / steps.length) * 100);
        
        console.log(`Completed feedback step, progress: ${((i + 1) / steps.length) * 100}%`);
        
        // Add small delay before continuing to next step
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('Continuing to next step after feedback...');
        continue;
      }

      if (steps[i].id === 'scheduler') {
        console.log('Entering scheduler step...');
        setSchedulerOpen(true);
        console.log('Waiting for scheduling...');
        
        try {
          await waitForScheduling();
          console.log('Scheduling completed, continuing workflow...');
        } catch (error) {
          console.error('Error in scheduler step:', error);
        }
        
        // Reset scheduling state
        setSelectedDate('');
        updateStepStatus(i, 'completed');
        setProgress(((i + 1) / steps.length) * 100);
        
        console.log(`Completed scheduler step, progress: ${((i + 1) / steps.length) * 100}%`);
        
        // Add small delay before continuing to next step
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('Continuing to next step after scheduling...');
        continue;
      }

      // Simulate step execution with sub-steps and random timing
      if (steps[i].subSteps) {
        for (let j = 0; j < steps[i].subSteps!.length; j++) {
          setCurrentSubStep(j);
          const stepDelay = (steps[i].duration / steps[i].subSteps!.length) + Math.random() * 1500 + 800; // More variation
          await new Promise(resolve => setTimeout(resolve, stepDelay));
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, steps[i].duration + randomDelay));
      }

      updateStepStatus(i, 'completed');
      setProgress(((i + 1) / steps.length) * 100);
      
      console.log(`Completed step ${i}: ${steps[i].name}, progress: ${((i + 1) / steps.length) * 100}%`);
      
      // Add delay between regular steps for better visual feedback
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    console.log('All steps completed, generating final worksheet...');
    // Generate final worksheet using AI
    const subject = extractedInfo.subject || 'Mathematics';
    const grade = extractedInfo.grade || '3';
    const worksheetResult = await geminiService.generateWorksheet(trigger, subject, grade, sampleQuestions);
    
    setTimeout(() => onComplete(worksheetResult.content), 500);
  };

  const waitForFeedback = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('waitForFeedback: Starting to wait for feedback...');
      
      const checkFeedback = () => {
        const store = useWorksheetWorkflowStore.getState();
        const currentFeedback = store.feedbackGiven;
        console.log('waitForFeedback: Checking feedback from store:', currentFeedback);
        
        if (currentFeedback) {
          console.log('waitForFeedback: Feedback received:', currentFeedback, 'Resolving promise...');
          // Add a small delay before closing to show the action was registered
          setTimeout(() => {
            store.setShowFeedback(false);
            console.log('waitForFeedback: Modal closed, resolving...');
            resolve();
          }, 500);
        } else {
          setTimeout(checkFeedback, 100);
        }
      };
      
      // Start checking immediately
      checkFeedback();
      
      // Add a timeout to prevent infinite waiting
      setTimeout(() => {
        const store = useWorksheetWorkflowStore.getState();
        if (!store.feedbackGiven) {
          console.error('waitForFeedback: Timeout - no feedback received after 30 seconds');
          reject(new Error('Feedback timeout'));
        }
      }, 30000);
    });
  };

  const waitForScheduling = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('waitForScheduling: Starting to wait for date selection...');
      
      const checkScheduling = () => {
        const store = useWorksheetWorkflowStore.getState();
        const currentDate = store.selectedDate;
        console.log('waitForScheduling: Checking selectedDate from store:', currentDate);
        
        if (currentDate) {
          console.log('waitForScheduling: Date selected:', currentDate, 'Resolving...');
          setTimeout(() => {
            store.setSchedulerOpen(false);
            console.log('waitForScheduling: Scheduler closed, resolving...');
            resolve();
          }, 500);
        } else {
          setTimeout(checkScheduling, 100);
        }
      };
      
      checkScheduling();
      
      // Add timeout for scheduler too
      setTimeout(() => {
        const store = useWorksheetWorkflowStore.getState();
        if (!store.selectedDate) {
          console.error('waitForScheduling: Timeout - no date selected after 30 seconds');
          reject(new Error('Scheduling timeout'));
        }
      }, 30000);
    });
  };

  const generateWorksheet = (): string => {
    const subject = extractSubject(trigger);
    const grade = extractGrade(trigger) || '3';
    
    return `# 📝 Mathematics Worksheet - Grade ${grade}
**Subject:** ${subject} | **Date:** ${new Date().toLocaleDateString()} | **Duration:** 45 minutes

---

## 🎯 Learning Objectives
- Understand basic addition and subtraction concepts
- Practice problem-solving with real-world scenarios
- Develop computational fluency

---

## 📋 Instructions
1. Read each question carefully
2. Show your work in the space provided
3. Check your answers before submitting
4. Ask for help if needed

---

## ✏️ Section A: Basic Operations (20 points)

### Question 1 (5 points)
Solve the following addition problems:

a) 15 + 23 = ____
b) 47 + 38 = ____
c) 29 + 56 = ____

**Work Space:**
[                                    ]

### Question 2 (5 points)
Solve the following subtraction problems:

a) 85 - 34 = ____
b) 72 - 29 = ____
c) 90 - 47 = ____

**Work Space:**
[                                    ]

### Question 3 (10 points)
**Word Problem:** Sarah has 45 stickers. She gives 18 stickers to her friend Maya and buys 27 more stickers from the store. How many stickers does Sarah have now?

**Answer:** ________________

**Explanation:**
[                                    ]
[                                    ]

---

## 🧮 Section B: Problem Solving (30 points)

### Question 4 (15 points)
**Shopping Scenario:** 
Mom went to the grocery store with ₹200. She bought:
- Vegetables for ₹45
- Fruits for ₹38  
- Rice for ₹67

How much money does she have left?

**Solution Steps:**
1. Total spent = ________________
2. Money left = ________________

### Question 5 (15 points)
**Pattern Recognition:**
Complete the following number patterns:

a) 5, 10, 15, 20, ____, ____, ____
b) 100, 90, 80, 70, ____, ____, ____
c) 2, 4, 6, 8, ____, ____, ____

---

## 🌟 Section C: Challenge Questions (Bonus - 10 points)

### Bonus Question
**Logic Puzzle:** In a classroom, there are 25 students. 12 students like mathematics, 15 students like science, and 8 students like both subjects. How many students don't like either subject?

**Answer:** ________________

**Reasoning:**
[                                    ]
[                                    ]

---

## ✅ Answer Key (For Teacher Use)
- **Section A:** 1a) 38, 1b) 85, 1c) 85; 2a) 51, 2b) 43, 2c) 43; 3) 54 stickers
- **Section B:** 4) ₹50 left; 5a) 25,30,35; 5b) 60,50,40; 5c) 10,12,14
- **Bonus:** 6 students

---

## 📊 Assessment Rubric
- **Excellent (A):** 85-100% - Shows complete understanding
- **Good (B):** 70-84% - Shows good understanding with minor errors
- **Satisfactory (C):** 55-69% - Shows basic understanding
- **Needs Improvement (D):** Below 55% - Requires additional support

---

*Generated by Sahayak AI Assistant | Customized for Grade ${grade} | ${new Date().toLocaleDateString()}*`;
  };

  const extractSubject = (text: string): string => {
    const subjects = ['mathematics', 'math', 'science', 'english', 'hindi', 'social studies'];
    const found = subjects.find(subject => text.toLowerCase().includes(subject));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : 'Mathematics';
  };

  const extractGrade = (text: string): string | null => {
    const gradeMatch = text.match(/grade\s*(\d+)|class\s*(\d+)|standard\s*(\d+)/i);
    return gradeMatch ? (gradeMatch[1] || gradeMatch[2] || gradeMatch[3]) : null;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedbackGiven(type);
  };

  const handleRegenerateQuestions = async () => {
    setIsRegenerating(true);
    incrementRegenerationCount();
    
    await new Promise(resolve => setTimeout(resolve, 3500 + Math.random() * 2500)); // 3.5-6 seconds
    
    const subject = extractedInfo.subject || 'Mathematics';
    const grade = extractedInfo.grade || '3';
    
    const newQuestionsResult = await geminiService.generateSampleQuestions(
      `${trigger} (attempt ${regenerationCount + 1}, make it different)`, 
      subject, 
      grade
    );
    
    setSampleQuestions(newQuestionsResult.questions);
    setIsRegenerating(false);
  };

  const handleApplyToAll = () => {
    console.log('handleApplyToAll: Setting feedback to positive...');
    setFeedbackGiven('positive');
    // Don't close the dialog here - let waitForFeedback handle it
  };

  const handleScheduleSelect = (date: string) => {
    console.log('handleScheduleSelect called with:', date);
    setSelectedDate(date);
  };

  return (
    <Paper elevation={6} sx={{ p: 3, m: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ 
        mb: 3, 
        textAlign: 'center',
        color: 'primary.main',
        fontWeight: 500
      }}>
        🤖 Multi-Agent Worksheet Generation Workflow
      </Typography>

      {/* Initial Thinking Phase */}
      {showInitialThinking && (
        <LoadingAnimation 
          type="thinking"
          message="AI analyzing your request..."
          showSkeleton={true}
        />
      )}

      {/* Intent Classification Result */}
      {intentClassified && (
        <Alert 
          severity={steps.find(s => s.id === 'intent-classifier')?.status === 'error' ? 'warning' : 'success'} 
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>Detected Intent:</strong> {
              steps.find(s => s.id === 'intent-classifier')?.status === 'error' 
                ? 'Unclear Request - Please be more specific'
                : 'Worksheet Generation'
            }
            <br />
            <strong>Request:</strong> "{trigger}"
            {extractedInfo.subject && (
              <>
                <br />
                <strong>Subject:</strong> {extractedInfo.subject} | <strong>Grade:</strong> {extractedInfo.grade || 'Not specified'}
              </>
            )}
          </Typography>
        </Alert>
      )}

      {/* Show "I'm not sure" handler */}
      {intentClassified && steps.find(s => s.id === 'intent-classifier')?.status === 'error' && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, border: 2, borderColor: 'warning.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <HelpOutline sx={{ color: 'warning.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" color="warning.main">
                I'm Not Sure About This Request
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The request seems unclear or doesn't match typical educational tasks.
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Could you please clarify what you'd like me to help you with? For example:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip label="Create a worksheet" size="small" variant="outlined" />
            <Chip label="Generate quiz questions" size="small" variant="outlined" />
            <Chip label="Plan a lesson" size="small" variant="outlined" />
            <Chip label="Explain a concept" size="small" variant="outlined" />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              Try Again
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                // Force continue as worksheet generation
                updateStepStatus(1, 'completed'); // Intent classifier is at index 1
                setIsRunning(true);
              }}
            >
              Continue as Worksheet
            </Button>
          </Box>
        </Paper>
      )}

      {/* Progress Overview */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Overall Progress: {Math.round(progress)}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            }
          }} 
        />
      </Box>

      {/* Loading State Indicator */}
      {showSkeletons && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 500, mb: 1 }}>
            🤖 Initializing AI Agents...
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Agents will become active as the workflow progresses
          </Typography>
        </Box>
      )}

      {/* Agent Status Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Show skeleton cards only when no agents are active */}
        {showSkeletons && activeAgents.size === 0 && steps.map((step, index) => (
          <Grid item xs={6} sm={4} md={3} key={`skeleton-${step.id}`}>
            <SkeletonAgentCard index={index} />
          </Grid>
        ))}

        {/* Show real agent cards when active */}
        {steps.map((step, index) => {
          const isActive = activeAgents.has(index);

          return (
            <Fade
              key={step.id}
              in={isActive}
              timeout={500 + index * 200}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <Grid item xs={6} sm={4} md={3}>
                <Card 
                  elevation={currentStep === index ? 4 : 1}
                  sx={{ 
                    border: currentStep === index ? 2 : 1,
                    borderColor: currentStep === index ? step.color : 'grey.300',
                    background: step.status === 'completed' 
                      ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                      : step.status === 'running'
                      ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                      : 'white'
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ color: step.color, mr: 1 }}>
                        {step.icon}
                      </Box>
                      {step.status === 'running' && (
                        <CircularProgress size={16} sx={{ ml: 'auto' }} />
                      )}
                      {step.status === 'completed' && (
                        <CheckCircle sx={{ color: 'success.main', ml: 'auto' }} />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                      {step.name}
                    </Typography>
                    <Chip 
                      label={step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                      size="small"
                      color={
                        step.status === 'completed' ? 'success' :
                        step.status === 'running' ? 'warning' :
                        step.status === 'error' ? 'error' : 'default'
                      }
                      sx={{ mt: 0.5 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Fade>
          );
        })}
      </Grid>

      {/* Workflow Status */}
      {activeAgents.size > 0 && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
            {activeAgents.size} of {steps.length} agents active
          </Typography>
        </Box>
      )}

      {/* Current Step Details */}
      {isRunning && currentStep < steps.length && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, border: 2, borderColor: steps[currentStep].color }}>
          <Typography variant="h6" sx={{ color: steps[currentStep].color, mb: 1 }}>
            🔄 {steps[currentStep].name} Active
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {steps[currentStep].description}
          </Typography>
          
          {steps[currentStep].subSteps && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Progress:
              </Typography>
              {steps[currentStep].subSteps!.map((subStep, index) => (
                <Chip
                  key={index}
                  label={subStep}
                  size="small"
                  color={index <= currentSubStep ? 'primary' : 'default'}
                  variant={index === currentSubStep ? 'filled' : 'outlined'}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!isRunning ? (
          <>
            <Button 
              variant="contained" 
              onClick={handleStart}
              startIcon={<PlayArrow />}
              sx={{ 
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                px: 4 
              }}
            >
              Start Workflow
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => setIsRunning(false)}
          >
            Stop Workflow
          </Button>
        )}
      </Box>

      {/* Enhanced Feedback Dialog with Sample Questions */}
      <Dialog open={showFeedback} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          📋 Sample Questions Generated - Please Review
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Here are 2 sample questions based on your request. Review them to ensure they match your expectations.
          </Alert>
          
          {/* Sample Questions Display */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Sample Questions Preview:
            </Typography>
            
            {isRegenerating ? (
              <LoadingAnimation 
                type="generating"
                message="Generating new questions..."
                showSkeleton={false}
              />
            ) : (
              <Grid container spacing={2}>
                {sampleQuestions.map((question, index) => (
                  <Grid item xs={12} key={index}>
                    <Card 
                      elevation={2} 
                      sx={{ 
                        p: 2,
                        border: 1,
                        borderColor: alpha('#1976d2', 0.2),
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                      }}
                    >
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                        Question {index + 1} ({question.type} - {question.difficulty}) - {question.points} points
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {question.question}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Feedback Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Are these questions appropriate for your needs?
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<ThumbUp />}
                onClick={handleApplyToAll}
                disabled={isRegenerating || feedbackGiven === 'positive'}
                sx={{ px: 4 }}
              >
                {feedbackGiven === 'positive' ? 'Applied ✓' : 'Apply to All Questions'}
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Refresh />}
                onClick={handleRegenerateQuestions}
                disabled={isRegenerating || feedbackGiven === 'positive'}
                sx={{ px: 4 }}
              >
                {isRegenerating ? 'Regenerating...' : 'Try Different Questions'}
              </Button>
              
              <Button
                variant="text"
                color="error"
                startIcon={<ThumbDown />}
                onClick={() => handleFeedback('negative')}
                disabled={isRegenerating || feedbackGiven === 'positive'}
              >
                Cancel Workflow
              </Button>
            </Box>

            {feedbackGiven === 'positive' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ✅ Questions approved! Proceeding to generate the complete worksheet...
                </Typography>
              </Alert>
            )}

            {regenerationCount > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Regeneration attempt: {regenerationCount + 1}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Scheduler Dialog */}
      <Dialog open={schedulerOpen} maxWidth="sm" fullWidth>
        <DialogTitle>📅 Schedule Worksheet Distribution</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            When would you like to distribute this worksheet to students?
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Distribution Date</InputLabel>
            <Select
              value={selectedDate}
              label="Select Distribution Date"
              onChange={(e) => handleScheduleSelect(e.target.value)}
            >
              <MenuItem value="today">📅 Today (Immediate)</MenuItem>
              <MenuItem value="tomorrow">📅 Tomorrow</MenuItem>
              <MenuItem value="next-week">📅 Next Week</MenuItem>
              <MenuItem value="custom">📅 Custom Date</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              const dateToUse = selectedDate || 'today';
              setSelectedDate(dateToUse);
              console.log('Scheduler: Schedule Now clicked with date:', dateToUse);
            }}
            variant="contained"
            disabled={!selectedDate}
            sx={{ px: 4 }}
          >
            Schedule Now
          </Button>
          <Button 
            onClick={() => {
              setSelectedDate('today');
              console.log('Scheduler: Auto-selecting today and proceeding');
            }}
            variant="outlined"
          >
            Skip (Use Today)
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 