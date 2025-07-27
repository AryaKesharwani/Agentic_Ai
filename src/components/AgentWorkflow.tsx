'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Chip,
  Typography,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Collapse,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Fade,
  Slide,
  Skeleton,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Schedule,
  PlayArrow,
  Pause,
  SkipNext,
  ExpandMore,
  ExpandLess,
  Psychology,
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { Session, Agent } from '@/store/agentStore';
import InferenceLogViewer from './InferenceLogViewer';

interface AgentWorkflowProps {
  session: Session;
}

const getStatusIcon = (status: Agent['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle color="success" />;
    case 'error':
      return <Error color="error" />;
    case 'skipped':
      return <SkipNext color="warning" />;
    case 'suspended':
      return <Pause color="warning" />;
    case 'inProgress':
      return <PlayArrow color="primary" />;
    case 'pending':
    default:
      return <Schedule color="disabled" />;
  }
};

const getStatusColor = (status: Agent['status']) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'error':
      return 'error';
    case 'skipped':
      return 'warning';
    case 'suspended':
      return 'warning';
    case 'inProgress':
      return 'primary';
    case 'pending':
    default:
      return 'default';
  }
};

// Skeleton Agent Card Component
const SkeletonAgentCard = ({ index }: { index: number }) => (
  <Card
    sx={{
      minWidth: 200,
      maxWidth: 200,
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
    <CardContent sx={{ p: 2, pb: 1 }}>
      {/* Agent Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="70%" height={20} />
        </Box>
        <Skeleton variant="circular" width={20} height={20} />
      </Box>

      {/* Status Chip Skeleton */}
      <Skeleton variant="rounded" width={60} height={20} sx={{ mb: 1 }} />

      {/* Logs Count Skeleton */}
      <Skeleton variant="text" width="50%" height={16} />
    </CardContent>
  </Card>
);

export default function AgentWorkflow({ session }: AgentWorkflowProps) {
  const intl = useIntl();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [logsDrawerOpen, setLogsDrawerOpen] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  const [showSkeletons, setShowSkeletons] = useState(true);

  // Track which agents have been activated
  useEffect(() => {
    const newActiveAgents = new Set<string>();
    
    session.agents.forEach(agent => {
      if (agent.status === 'inProgress' || agent.status === 'completed' || agent.logs.length > 0) {
        newActiveAgents.add(agent.id);
      }
    });

    // Hide skeletons immediately when any agent becomes active
    if (newActiveAgents.size > 0) {
      setShowSkeletons(false);
    } else {
      setShowSkeletons(true);
    }

    setActiveAgents(newActiveAgents);
  }, [session.agents]);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setLogsDrawerOpen(true);
  };

  const handleAgentToggle = (agentId: string) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology />
        Agent Workflow
      </Typography>

      {/* Horizontal Scrolling Agent Cards */}
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
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

        {/* Agent Cards Container - Horizontal Scroll */}
        <Box 
          sx={{ 
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 1, // Space for scrollbar
            px: 1, // Add some padding for better visual
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'grey.100',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'grey.400',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'grey.500',
              },
            },
          }}
        >
          {/* Show skeleton cards only when no agents are active */}
          {showSkeletons && activeAgents.size === 0 && session.agents.map((agent, index) => (
            <SkeletonAgentCard key={`skeleton-${agent.id}`} index={index} />
          ))}

          {/* Show real agent cards when active */}
          {session.agents.map((agent, index) => {
            const isActive = activeAgents.has(agent.id);
            
            if (!isActive) return null; // Don't render inactive agents
            
            return (
              <Fade 
                key={agent.id} 
                in={isActive} 
                timeout={500 + index * 200}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <Card
                  sx={{
                    minWidth: 200,
                    maxWidth: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: agent.status === 'inProgress' ? 2 : 1,
                    borderColor: agent.status === 'inProgress' ? 'primary.main' : 'divider',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: 8,
                    },
                    '&:active': {
                      transform: 'translateY(-2px) scale(1.01)',
                    },
                    ...(agent.status === 'completed' && {
                      bgcolor: 'success.50',
                      borderColor: 'success.main',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: 'success.main',
                        borderRadius: '4px 4px 0 0',
                      },
                    }),
                    ...(agent.status === 'error' && {
                      bgcolor: 'error.50',
                      borderColor: 'error.main',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: 'error.main',
                        borderRadius: '4px 4px 0 0',
                      },
                    }),
                    ...(agent.status === 'inProgress' && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: 'primary.main',
                        borderRadius: '4px 4px 0 0',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 },
                        },
                      },
                    }),
                  }}
                  onClick={() => handleAgentClick(agent)}
                >
                  <CardContent sx={{ p: 2, pb: 1 }}>
                    {/* Agent Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: agent.color,
                          fontSize: '0.875rem',
                        }}
                      >
                        {agent.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {agent.name}
                        </Typography>
                      </Box>
                      {getStatusIcon(agent.status)}
                    </Box>

                    {/* Status Chip */}
                    <Chip
                      size="small"
                      label={agent.status}
                      color={getStatusColor(agent.status) as any}
                      sx={{ 
                        mb: 1,
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />

                    {/* Logs Count */}
                    {agent.logs.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {agent.logs.length} log{agent.logs.length !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </CardContent>

                  {/* Expandable Logs Section */}
                  {agent.logs.length > 0 && (
                    <CardActions sx={{ p: 0, pt: 0 }}>
                      <Box sx={{ width: '100%' }}>
                        <Collapse in={expandedAgent === agent.id}>
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Divider sx={{ mb: 1 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              Recent Activity
                            </Typography>
                            {agent.logs.slice(-2).map((log) => (
                              <Box key={log.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {log.timestamp.toLocaleTimeString()}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                                  {log.message.length > 60 ? `${log.message.substring(0, 60)}...` : log.message}
                                </Typography>
                              </Box>
                            ))}
                            {agent.logs.length > 2 && (
                              <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                                View all {agent.logs.length} logs
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                          <Tooltip title={expandedAgent === agent.id ? "Hide logs" : "Show logs"}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAgentToggle(agent.id);
                              }}
                              sx={{ 
                                width: 24, 
                                height: 24,
                                bgcolor: 'action.hover'
                              }}
                            >
                              {expandedAgent === agent.id ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardActions>
                  )}
                </Card>
              </Fade>
            );
          })}
        </Box>

        {/* Workflow Status */}
        {activeAgents.size > 0 && (
          <Box sx={{ textAlign: 'center', pt: 1 }}>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
              {activeAgents.size} of {session.agents.length} agents active
            </Typography>
          </Box>
        )}
      </Box>

      {/* Agent Logs Drawer */}
      <Drawer
        anchor="right"
        open={logsDrawerOpen}
        onClose={() => setLogsDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 600 } }}
      >
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedAgent && selectedAgent.name} - Inference Logs
          </Typography>
          
          {selectedAgent && (
            <InferenceLogViewer
              logs={selectedAgent.logs}
              agentId={selectedAgent.id}
              agentName={selectedAgent.name}
              isExpanded={true}
            />
          )}
        </Box>
      </Drawer>
    </Box>
  );
} 