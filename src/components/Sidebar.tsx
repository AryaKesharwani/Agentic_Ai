'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Person,
  History,
  School,
  Subject,
  Grade,
  AccessTime,
  Add as AddIcon,
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { useAgentStore } from '../store/agentStore';

export default function Sidebar() {
  const intl = useIntl();
  const { teacherProfile, sessions, currentSession, createSession, setCurrentSession } = useAgentStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter sessions to only show those with messages > 0
  const sessionsWithMessages = sessions.filter(session => session.messages.length > 0);

  // Fix: Ensure 'date' is a Date object before calling getTime
  const formatLastSeen = (date: Date | string) => {
    let lastSeenDate: Date;
    if (date instanceof Date) {
      lastSeenDate = date;
    } else if (typeof date === 'string') {
      // Try to parse string to Date
      lastSeenDate = new Date(date);
    } else {
      return 'Unknown';
    }

    if (isNaN(lastSeenDate.getTime())) {
      return 'Unknown';
    }

    const now = new Date();
    const diff = now.getTime() - lastSeenDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Format session date
  const formatSessionDate = (date: Date | string) => {
    let sessionDate: Date;
    if (date instanceof Date) {
      sessionDate = date;
    } else if (typeof date === 'string') {
      sessionDate = new Date(date);
    } else {
      return 'Unknown date';
    }

    if (isNaN(sessionDate.getTime())) {
      return 'Unknown date';
    }

    const now = new Date();
    const diff = now.getTime() - sessionDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return sessionDate.toLocaleDateString();
  };

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
  };

  // Handle creating new session
  const handleCreateSession = () => {
    createSession('New Teaching Session');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 60 : 280,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: isCollapsed ? 60 : 280,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header with Collapse Button */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!isCollapsed && (
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {intl.formatMessage({ id: 'app.title' })}
          </Typography>
        )}
        <IconButton 
          size="small" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          sx={{ ml: isCollapsed ? 0 : 'auto' }}
        >
          {isCollapsed ? <History /> : <School />}
        </IconButton>
      </Box>

      {/* Teacher Profile */}
      {!isCollapsed ? (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
              }}
            >
              {teacherProfile.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {teacherProfile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {teacherProfile.school}
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <AccessTime fontSize="small" />
            {intl.formatMessage({ id: 'last.seen' })}: {formatLastSeen(teacherProfile.lastSeen)}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Subject fontSize="small" />
            Subjects: {teacherProfile.subjects.slice(0, 2).join(', ')}
            {teacherProfile.subjects.length > 2 && ` +${teacherProfile.subjects.length - 2}`}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {teacherProfile.grades.slice(0, 3).map((grade) => (
              <Chip
                key={grade}
                label={`Grade ${grade}`}
                size="small"
                variant="outlined"
                icon={<Grade />}
              />
            ))}
            {teacherProfile.grades.length > 3 && (
              <Chip
                label={`+${teacherProfile.grades.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      ) : (
        // Collapsed Teacher Profile - Just Avatar
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={teacherProfile.name} placement="right">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              {teacherProfile.name.charAt(0)}
            </Avatar>
          </Tooltip>
        </Box>
      )}

      {/* Session History */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {!isCollapsed && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: 'session.history' })} 
              {sessions.length > 0 && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({sessionsWithMessages.length}/{sessions.length})
                </Typography>
              )}
            </Typography>
            <Tooltip title="New Session" placement="top">
              <IconButton size="small" onClick={handleCreateSession}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <List dense>
          {sessionsWithMessages.map((session) => (
            <Tooltip
              key={session.id}
              title={isCollapsed ? `${session.title} (${session.messages.length} messages)` : ''}
              placement="right"
              disableHoverListener={!isCollapsed}
            >
              <ListItem
                button
                selected={currentSession?.id === session.id}
                onClick={() => handleSessionSelect(session.id)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  px: isCollapsed ? 1 : 2,
                }}
              >
                <ListItemAvatar sx={{ minWidth: isCollapsed ? 'auto' : 56 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    <History />
                  </Avatar>
                </ListItemAvatar>
                {!isCollapsed && (
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                          {session.title}
                        </Typography>
                        <Chip
                          label={session.messages.length}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatSessionDate(session.lastActive)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    }
                  />
                )}
              </ListItem>
            </Tooltip>
          ))}
        </List>

        {sessionsWithMessages.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {sessions.length === 0 ? 'No conversations yet.' : 'No conversations with messages.'}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreateSession}
              fullWidth
            >
              Start New Session
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
} 