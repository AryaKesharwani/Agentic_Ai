'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  Lightbulb,
  Assignment,
  Speed,
  Public,
  CheckCircle,
  ExpandLess,
} from '@mui/icons-material';

interface ThinkingStep {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  status: 'pending' | 'processing' | 'completed';
  icon: React.ReactNode;
  duration?: number;
}

interface ThinkingProcessProps {
  intent: string;
  subjects: string[];
  grades: number[];
  isProcessing: boolean;
  onComplete?: () => void;
}

export default function ThinkingProcess({ 
  intent, 
  subjects, 
  grades, 
  isProcessing, 
  onComplete 
}: ThinkingProcessProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const getThinkingSteps = (intentType: string): ThinkingStep[] => {
    const baseSteps = [
      {
        id: 'analysis',
        title: 'Content Analysis',
        description: 'Analyzing the educational requirements',
        reasoning: `Examining the request for ${intentType} content targeting ${subjects.join(', ')} for grades ${grades.join(', ')}`,
        status: 'completed' as const,
        icon: <Psychology color="primary" />,
        duration: 1000,
      },
      {
        id: 'objectives',
        title: 'Learning Objectives',
        description: 'Defining clear learning goals',
        reasoning: 'Establishing what students should know, understand, and be able to do after completing this activity',
        status: isProcessing ? 'processing' : 'completed' as const,
        icon: <Lightbulb color="secondary" />,
        duration: 1500,
      },
      {
        id: 'appropriateness',
        title: 'Grade Appropriateness',
        description: 'Calibrating difficulty level',
        reasoning: `Adjusting content complexity, vocabulary, and concepts for grades ${grades.join(', ')} developmental stage`,
        status: isProcessing ? 'pending' : 'completed' as const,
        icon: <Assignment color="success" />,
        duration: 2000,
      },
      {
        id: 'difficulty',
        title: 'Difficulty Calibration',
        description: 'Balancing challenge and accessibility',
        reasoning: 'Ensuring content is challenging enough to promote learning while remaining accessible to all students',
        status: 'pending' as const,
        icon: <Speed color="warning" />,
        duration: 1200,
      },
      {
        id: 'cultural',
        title: 'Cultural Context',
        description: 'Adapting for Indian classroom context',
        reasoning: 'Incorporating Indian cultural references, examples, and curriculum alignment for better relevance',
        status: 'pending' as const,
        icon: <Public color="info" />,
        duration: 800,
      },
    ];

    // Customize steps based on intent
    switch (intentType) {
      case 'worksheetGeneration':
        return [
          ...baseSteps,
          {
            id: 'format',
            title: 'Worksheet Structure',
            description: 'Designing optimal layout and format',
            reasoning: 'Creating clear sections, instructions, and answer spaces that work well for the target grade levels',
            status: 'pending' as const,
            icon: <Assignment color="primary" />,
            duration: 1000,
          },
        ];

      case 'quizGeneration':
        return [
          ...baseSteps,
          {
            id: 'questions',
            title: 'Question Design',
            description: 'Crafting assessment questions',
            reasoning: 'Creating varied question types that effectively measure student understanding and knowledge',
            status: 'pending' as const,
            icon: <Assignment color="primary" />,
            duration: 1500,
          },
        ];

      default:
        return baseSteps;
    }
  };

  const steps = getThinkingSteps(intent);

  React.useEffect(() => {
    if (isProcessing) {
      const timer = setInterval(() => {
        setActiveStep((prevStep) => {
          const nextStep = prevStep + 1;
          if (nextStep >= steps.length) {
            clearInterval(timer);
            onComplete?.();
            return prevStep;
          }
          return nextStep;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isProcessing, steps.length, onComplete]);

  const getStepStatus = (index: number) => {
    if (index < activeStep) return 'completed';
    if (index === activeStep && isProcessing) return 'processing';
    return 'pending';
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Accordion 
        expanded={expanded} 
        onChange={() => setExpanded(!expanded)}
        sx={{ 
          border: 1, 
          borderColor: 'primary.light',
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              AI Thinking Process
            </Typography>
            {isProcessing && (
              <Chip 
                label="Processing..." 
                size="small" 
                color="secondary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Watch how I analyze and plan your educational content step by step:
          </Typography>

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(index);
              
              return (
                <Step key={step.id} completed={stepStatus === 'completed'}>
                  <StepLabel
                    icon={
                      stepStatus === 'completed' ? (
                        <CheckCircle color="success" />
                      ) : stepStatus === 'processing' ? (
                        step.icon
                      ) : (
                        step.icon
                      )
                    }
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: stepStatus === 'processing' ? 'bold' : 'normal',
                        color: stepStatus === 'processing' ? 'primary.main' : 'inherit',
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      {stepStatus === 'processing' && (
                        <LinearProgress 
                          sx={{ mt: 1, width: '200px' }} 
                          color="primary"
                        />
                      )}
                    </Box>
                  </StepLabel>
                  
                  <StepContent>
                    <Box sx={{ pb: 2 }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', pl: 2 }}>
                        {step.reasoning}
                      </Typography>
                      
                      {stepStatus === 'completed' && (
                        <Chip 
                          label={`Completed in ${step.duration || 1000}ms`}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ mt: 1, ml: 2 }}
                        />
                      )}
                    </Box>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>

          {!isProcessing && activeStep >= steps.length && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                Thinking process complete! Ready to generate your educational content.
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
} 