'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  Avatar,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  ButtonGroup,
  Paper,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Undo,
  Edit,
  Check,
  Close,
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { Session, Message, Agent } from '@/store/agentStore';
import { useAgentStore } from '@/store/agentStore';
import MarkdownMessage from './MarkdownMessage';
import VoiceOutput from './VoiceOutput';

interface ChatAreaProps {
  session: Session;
}

export default function ChatArea({ session }: ChatAreaProps) {
  const intl = useIntl();
  const { updateMessageFeedback, undoLastMessage, addMessage } = useAgentStore();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleFeedback = (message: Message, isPositive: boolean) => {
    if (isPositive) {
      updateMessageFeedback(session.id, message.id, 'positive');
    } else {
      setSelectedMessage(message);
      setFeedbackDialogOpen(true);
    }
  };

  const handleFeedbackSubmit = () => {
    if (selectedMessage) {
      updateMessageFeedback(session.id, selectedMessage.id, 'negative', feedbackReason);
      setFeedbackDialogOpen(false);
      setSelectedMessage(null);
      setFeedbackReason('');
    }
  };

  const handleEditStart = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleEditSave = (messageId: string) => {
    // In a real app, this would update the message in the store
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const getAgentById = (agentId: string): Agent | undefined => {
    return session.agents.find(agent => agent.id === agentId);
  };

  const handleRetry = async () => {
    if (session.messages.length < 2) return;
    
    // Get the last teacher message (the original user query)
    const lastTeacherMessage = [...session.messages]
      .reverse()
      .find(msg => msg.agentId === 'teacher');
    
    if (!lastTeacherMessage) return;

    setIsRetrying(true);

    // Add a new message from teacher asking for simpler content
    addMessage(session.id, {
      agentId: 'teacher',
      content: `Please make this simpler for Grade 2 students: ${lastTeacherMessage.content}`,
      suggestions: [],
      isEditable: false,
    });

    // Call the API to regenerate with simpler instructions
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Please make this simpler for Grade 2 students: ${lastTeacherMessage.content}`,
          sessionId: session.id,
          subjects: [],
          grades: [2],
          locale: 'en',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addMessage(session.id, {
          agentId: 'orchestrator',
          content: data.response,
          suggestions: data.suggestions || [],
          isEditable: false,
        });
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleKeep = () => {
    // Simply do nothing - keep the current content
    console.log('Content kept as is');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50', borderRadius: 2, border: 1, borderColor: 'divider' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white', borderRadius: '8px 8px 0 0' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 32, height: 32 }}>
            🤖
          </Avatar>
          Sahayak AI Assistant
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Your multi-agent teaching companion
        </Typography>
      </Box>

      {/* Messages List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {session.messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              👋 Hello! I'm Sahayak, your AI teaching assistant. How can I help you today?
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip label="Create a worksheet" variant="outlined" size="small" />
              {/* <Chip label="Plan a lesson" variant="outlined" size="small" /> */}
              {/* <Chip label="Generate quiz questions" variant="outlined" size="small" /> */}
            </Box>
          </Box>
        )}
        
        <List sx={{ p: 0 }}>
          {session.messages.map((message, index) => {
            const agent = getAgentById(message.agentId);
            const isEditing = editingMessageId === message.id;

            const isTeacher = message.agentId === 'teacher';
            
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: isTeacher ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: isTeacher ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      bgcolor: isTeacher ? 'secondary.main' : (agent?.color || '#ccc'),
                      width: 36,
                      height: 36,
                      fontSize: '0.875rem',
                    }}
                  >
                    {isTeacher ? '👩‍🏫' : (agent?.name.charAt(0) || '🤖')}
                  </Avatar>

                  {/* Message Bubble */}
                  <Box sx={{ flex: 1 }}>
                    {/* Agent Name & Time */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 0.5,
                      justifyContent: isTeacher ? 'flex-end' : 'flex-start'
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {isTeacher ? 'You' : (agent?.name || 'AI Agent')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>

                    {/* Message Content Bubble */}
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: isTeacher ? 'primary.main' : 'background.paper',
                        color: isTeacher ? 'white' : 'text.primary',
                        borderRadius: isTeacher ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        position: 'relative',
                      }}
                    >
                      {isEditing ? (
                        <Box>
                          <TextField
                            fullWidth
                            multiline
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ mb: 1, bgcolor: 'white' }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<Check />}
                              onClick={() => handleEditSave(message.id)}
                              variant="contained"
                              color="success"
                            >
                              Save
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Close />}
                              onClick={handleEditCancel}
                              variant="outlined"
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        message.isEditable ? (
                          <Typography
                            component="div"
                            contentEditable={message.isEditable}
                            suppressContentEditableWarning
                            sx={{
                              minHeight: '1.2em',
                              outline: 'none',
                              '&:focus': {
                                bgcolor: isTeacher ? 'primary.dark' : 'action.hover',
                                borderRadius: 1,
                                p: 0.5,
                              },
                            }}
                          >
                            {message.content}
                          </Typography>
                                                 ) : (
                           <Box>
                           <MarkdownMessage 
                             content={message.content} 
                             isAI={!isTeacher}
                             enableSmartIndentation={true}
                           />
                           
                           {/* Voice Output for AI responses */}
                           {!isTeacher && (
                             <Box sx={{ mt: 1 }}>
                               <VoiceOutput
                                 text={message.content}
                                 autoPlay={false}
                                 showControls={true}
                                 onError={(error) => {
                                   console.error('Voice output error:', error);
                                 }}
                               />
                             </Box>
                           )}
                         </Box>
                         )
                      )}

                      {/* Action Buttons */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.5, 
                        mt: 1, 
                        justifyContent: isTeacher ? 'flex-start' : 'flex-end',
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}>
                        {!isTeacher && (
                          <>
                            <IconButton
                              size="small"
                              sx={{ color: isTeacher ? 'white' : 'inherit' }}
                              onClick={() => handleFeedback(message, true)}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: isTeacher ? 'white' : 'inherit' }}
                              onClick={() => handleFeedback(message, false)}
                            >
                              <ThumbDown fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {message.isEditable && (
                          <IconButton
                            size="small"
                            onClick={() => handleEditStart(message)}
                            disabled={isEditing}
                            sx={{ color: isTeacher ? 'white' : 'inherit' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => undoLastMessage(session.id)}
                          title="Undo"
                          sx={{ color: isTeacher ? 'white' : 'inherit' }}
                        >
                          <Undo fontSize="small" />
                        </IconButton>
                      </Box>
                                         </Paper>

                    {/* Suggestion Bubbles */}
                    {message.suggestions.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {message.suggestions.map((suggestion, idx) => (
                          <Chip
                            key={idx}
                            label={intl.formatMessage({ id: `suggestion.${suggestion}` })}
                            variant="outlined"
                            size="small"
                            clickable
                          />
                        ))}
                      </Box>
                    )}

                    {/* Feedback Status */}
                    {message.feedback && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {message.feedback === 'positive' ? '✓ Helpful' : '✗ Not helpful'}
                      </Typography>
                    )}

                    {/* Judge Alert for complex content */}
                    {index === session.messages.length - 1 && !isTeacher && (
                      <Alert
                        severity="warning"
                        sx={{ mt: 1 }}
                        action={
                          <ButtonGroup size="small">
                            <Button
                              size="small"
                              onClick={handleRetry}
                              disabled={isRetrying}
                            >
                              {isRetrying ? 'Retrying...' : intl.formatMessage({ id: 'judge.retry' })}
                            </Button>
                            <Button
                              size="small"
                              onClick={handleKeep}
                            >
                              {intl.formatMessage({ id: 'judge.keep' })}
                            </Button>
                          </ButtonGroup>
                        }
                      >
                        {intl.formatMessage(
                          { id: 'judge.tooAdvanced' },
                          { grade: 2 }
                        )}
                      </Alert>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)}>
        <DialogTitle>Why wasn't this helpful?</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value)}
              label="Reason"
            >
              <MenuItem value="tooComplex">
                {intl.formatMessage({ id: 'feedback.tooComplex' })}
              </MenuItem>
              <MenuItem value="wrongLanguage">
                {intl.formatMessage({ id: 'feedback.wrongLanguage' })}
              </MenuItem>
              <MenuItem value="other">
                {intl.formatMessage({ id: 'feedback.other' })}
              </MenuItem>
            </Select>
          </FormControl>
          {feedbackReason === 'other' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Please specify..."
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleFeedbackSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 