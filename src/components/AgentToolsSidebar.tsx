'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Divider,
  Fab,
  Badge,
  Collapse,
  Alert,
} from '@mui/material';
import {
  ChevronLeft,
  Psychology,
  Memory,
  Close,
  SmartToy,
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { Session } from '@/store/agentStore';
import { useAgentStore } from '@/store/agentStore';
import AgentWorkflow from './AgentWorkflow';
import MemoryWidget from './MemoryWidget';

interface AgentToolsSidebarProps {
  session: Session;
}

export default function AgentToolsSidebar({ session }: AgentToolsSidebarProps) {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [activeAgentsCount, setActiveAgentsCount] = useState(0);
  const [showLLMTrigger, setShowLLMTrigger] = useState(false);

  // Monitor agent activity to trigger sidebar
  useEffect(() => {
    const activeAgents = session.agents.filter(agent => 
      agent.status === 'inProgress' || agent.status === 'completed'
    );
    setActiveAgentsCount(activeAgents.length);

    // Trigger sidebar when agents become active (LLM calls)
    if (activeAgents.length > 0 && !isTriggered) {
      setIsTriggered(true);
      setShowLLMTrigger(true);
      
      // Auto-open sidebar after a brief delay for dramatic effect
      setTimeout(() => {
        setIsOpen(true);
      }, 500);
    }
  }, [session.agents, isTriggered]);

  // Monitor for new memory items (LLM storing context)
  useEffect(() => {
    if (session.memory.length > 0) {
      setIsTriggered(true);
      setShowLLMTrigger(true);
    }
  }, [session.memory.length]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowLLMTrigger(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button - Only shown when triggered by LLM */}
      {isTriggered && !isOpen && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            animation: showLLMTrigger ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
              '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
              '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' },
            },
          }}
          onClick={handleOpen}
        >
          <Badge badgeContent={activeAgentsCount} color="secondary">
            <SmartToy />
          </Badge>
        </Fab>
      )}

      {/* LLM Trigger Alert */}
      {showLLMTrigger && !isOpen && (
        <Alert
          severity="info"
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            zIndex: 1200,
            maxWidth: 300,
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              from: { transform: 'translateX(100%)', opacity: 0 },
              to: { transform: 'translateX(0)', opacity: 1 },
            },
          }}
          action={
            <IconButton size="small" onClick={() => setShowLLMTrigger(false)}>
              <Close fontSize="small" />
            </IconButton>
          }
        >
          🤖 AI agents are processing your request. Click to view details.
        </Alert>
      )}

      {/* Agent Tools Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleClose}
        variant="persistent"
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
            borderLeft: 1,
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy />
              <Typography variant="h6">AI Agent Tools</Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={handleClose}
              sx={{ color: 'white' }}
            >
              <ChevronLeft />
            </IconButton>
          </Box>

          {/* Status Indicator */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {activeAgentsCount > 0 
                ? `${activeAgentsCount} agents are actively processing`
                : 'No active agent processing'
              }
            </Typography>
          </Box>

          {/* Agent Workflow Section */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Psychology color="primary" />
                Agent Workflow
              </Typography>
            </Box>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              <AgentWorkflow session={session} />
            </Box>
          </Box>

          <Divider />

          {/* Memory Widget Section */}
          <Box sx={{ height: 250, overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Memory color="secondary" />
                Session Memory
              </Typography>
            </Box>
            <MemoryWidget session={session} />
          </Box>

          {/* Footer */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              This panel appears when AI agents are processing your requests
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
} 