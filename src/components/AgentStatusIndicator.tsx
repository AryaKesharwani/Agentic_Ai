'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  LinearProgress,
  Avatar,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Psychology,
  AutoAwesome,
  Person,
  ThumbUp,
  Gavel,
  Memory,
  Visibility,
  HandshakeOutlined,
  Schedule,
  PictureAsPdf,
  Notifications,
  CheckCircle,
  Error,
} from '@mui/icons-material';

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  status: 'idle' | 'thinking' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

interface AgentStatusIndicatorProps {
  agents: Agent[];
  showOnlyActive?: boolean;
}

export default function AgentStatusIndicator({ 
  agents, 
  showOnlyActive = false 
}: AgentStatusIndicatorProps) {
  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'thinking':
      case 'processing':
        return <CircularProgress size={16} />;
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'error':
        return <Error sx={{ color: 'error.main' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'thinking':
        return 'info';
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const visibleAgents = showOnlyActive 
    ? agents.filter(agent => agent.status !== 'idle')
    : agents;

  if (visibleAgents.length === 0) {
    return null;
  }

  return (
    <Fade in={true}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 2, 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: 1,
          borderColor: 'primary.light',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          🤖 Multi-Agent System Status
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {visibleAgents.map((agent) => (
            <Tooltip 
              key={agent.id} 
              title={agent.message || `${agent.name} - ${agent.status}`}
              placement="top"
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 2,
                  background: agent.status === 'processing' || agent.status === 'thinking'
                    ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                    : agent.status === 'completed'
                    ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                    : 'white',
                  border: 1,
                  borderColor: agent.status === 'processing' || agent.status === 'thinking'
                    ? 'warning.light'
                    : agent.status === 'completed'
                    ? 'success.light'
                    : 'grey.300',
                  minWidth: 120,
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    bgcolor: agent.color,
                    fontSize: 12
                  }}
                >
                  {agent.icon}
                </Avatar>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    {agent.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip 
                      label={agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      size="small"
                      color={getStatusColor(agent.status) as any}
                      sx={{ height: 16, fontSize: '0.6rem' }}
                    />
                    {getStatusIcon(agent.status)}
                  </Box>

                  {agent.progress !== undefined && (
                    <LinearProgress 
                      variant="determinate" 
                      value={agent.progress} 
                      sx={{ 
                        mt: 0.5, 
                        height: 3, 
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(0,0,0,0.1)'
                      }} 
                    />
                  )}
                </Box>
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* Overall Progress */}
        {visibleAgents.some(agent => agent.progress !== undefined) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Overall Progress: {Math.round(
                visibleAgents
                  .filter(agent => agent.progress !== undefined)
                  .reduce((sum, agent) => sum + (agent.progress || 0), 0) /
                visibleAgents.filter(agent => agent.progress !== undefined).length
              )}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={
                visibleAgents
                  .filter(agent => agent.progress !== undefined)
                  .reduce((sum, agent) => sum + (agent.progress || 0), 0) /
                visibleAgents.filter(agent => agent.progress !== undefined).length
              }
              sx={{ 
                mt: 0.5, 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                }
              }}
            />
          </Box>
        )}
      </Paper>
    </Fade>
  );
} 