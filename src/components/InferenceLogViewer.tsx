'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  Memory,
  AutoAwesome,
  Gavel,
  Person,
  Lightbulb,
  Monitor,
  Timeline,
  Speed,
  Storage,
  Code,
} from '@mui/icons-material';

interface InferenceLog {
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

interface InferenceLogViewerProps {
  logs: InferenceLog[];
  agentId: string;
  agentName: string;
  isExpanded?: boolean;
}

const agentIcons: { [key: string]: React.ReactElement } = {
  intentClassifier: <Psychology />,
  sessionMemory: <Memory />,
  orchestrator: <AutoAwesome />,
  judge: <Gavel />,
  personaliser: <Person />,
  suggestions: <Lightbulb />,
  monitoring: <Monitor />,
};

const modelColors: { [key: string]: string } = {
  'bert-base-multilingual-cased': '#FF6B6B',
  'sentence-transformers/all-MiniLM-L6-v2': '#4ECDC4',
  'gemini-2.0-flash-exp': '#45B7D1',
  'educational-quality-assessor': '#96CEB4',
  'user-preference-model': '#FFEAA7',
  'interaction-pattern-analyzer': '#DDA0DD',
  'safety-classifier-v2': '#98D8C8',
};

export default function InferenceLogViewer({ 
  logs, 
  agentId, 
  agentName, 
  isExpanded = false 
}: InferenceLogViewerProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  const formatProcessingTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getTotalProcessingTime = (): number => {
    return logs.reduce((total, log) => total + (log.metadata?.processingTime || 0), 0);
  };

  const getTotalTokens = (): number => {
    return logs.reduce((total, log) => total + (log.metadata?.tokensProcessed || 0), 0);
  };

  const getAverageConfidence = (): number => {
    const confidenceLogs = logs.filter(log => log.metadata?.confidence);
    if (confidenceLogs.length === 0) return 0;
    return confidenceLogs.reduce((sum, log) => sum + (log.metadata?.confidence || 0), 0) / confidenceLogs.length;
  };

  return (
    <Paper elevation={2} sx={{ mb: 2 }}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {agentIcons[agentId] || <Timeline />}
              <Typography variant="h6" component="span">
                {agentName}
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={`${logs.length} steps`} 
                size="small" 
                variant="outlined" 
                icon={<Code />}
              />
              <Chip 
                label={formatProcessingTime(getTotalProcessingTime())} 
                size="small" 
                variant="outlined" 
                icon={<Speed />}
              />
              <Chip 
                label={`${getTotalTokens()} tokens`} 
                size="small" 
                variant="outlined" 
                icon={<Storage />}
              />
              {getAverageConfidence() > 0 && (
                <Chip 
                  label={`${(getAverageConfidence() * 100).toFixed(0)}% conf`} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                />
              )}
            </Box>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          <Box sx={{ width: '100%' }}>
            {logs.map((log, index) => (
              <Box key={log.id} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                    Step {index + 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {log.timestamp.toLocaleTimeString()}
                  </Typography>
                  {log.metadata?.processingTime && (
                    <Chip 
                      label={formatProcessingTime(log.metadata.processingTime)} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  {log.message}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {log.reasoning}
                </Typography>
                
                {log.metadata && (
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Technical Details
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      {log.metadata.modelUsed && (
                        <Chip 
                          label={log.metadata.modelUsed}
                          size="small"
                          sx={{ 
                            bgcolor: modelColors[log.metadata.modelUsed] || '#E0E0E0',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                      
                      {log.metadata.tokensProcessed && (
                        <Chip 
                          label={`${log.metadata.tokensProcessed} tokens`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      
                      {log.metadata.confidence && (
                        <Chip 
                          label={`${(log.metadata.confidence * 100).toFixed(0)}% confidence`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                    
                    {log.metadata.subSteps && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          Sub-steps:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {log.metadata.subSteps.map((step, stepIndex) => (
                            <ListItem key={stepIndex} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 20 }}>
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={step} 
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {log.metadata.parameters && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          Parameters:
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {Object.entries(log.metadata.parameters).map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {key}:
                              </Typography>
                              <Typography variant="caption">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
                
                {index < logs.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Total Steps: ${logs.length}`}
                  size="small"
                  variant="outlined"
                />
                <Chip 
                  label={`Total Time: ${formatProcessingTime(getTotalProcessingTime())}`}
                  size="small"
                  variant="outlined"
                />
                <Chip 
                  label={`Total Tokens: ${getTotalTokens()}`}
                  size="small"
                  variant="outlined"
                />
                {getAverageConfidence() > 0 && (
                  <Chip 
                    label={`Avg Confidence: ${(getAverageConfidence() * 100).toFixed(0)}%`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
} 