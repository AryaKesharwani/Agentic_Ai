'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { useIntl } from 'react-intl';
import { useAgentStore } from '../../store/agentStore';
import Sidebar from '../../components/Sidebar';
import ChatArea from '../../components/ChatArea';
import InputBar from '../../components/InputBar';
import LanguageToggle from '../../components/LanguageToggle';
import MonitoringBackdrop from '../../components/MonitoringBackdrop';
import AgentToolsSidebar from '../../components/AgentToolsSidebar';
import VoiceTestPanel from '../../components/VoiceTestPanel';
import SessionManager from '../../components/SessionManager';
import WorksheetGenerationWorkflow from '../../components/WorksheetGenerationWorkflow';
import { 
  Save as SaveIcon,
  Storage as StorageIcon,
  CheckCircle as SavedIcon,
  BugReport as DebugIcon,
  Psychology,
} from '@mui/icons-material';

export default function ChatPage() {
  const intl = useIntl();
  const { 
    currentSession, 
    createSession, 
    sessions, 
    setCurrentSession, 
    locale, 
    setLocale,
    lastSaved,
    saveSessionsManually,
    getStorageStats,
    addMessage,
  } = useAgentStore();
  
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoiceTest, setShowVoiceTest] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showWorksheetWorkflow, setShowWorksheetWorkflow] = useState(false);
  const [worksheetTrigger, setWorksheetTrigger] = useState('');
  const [saving, setSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Debug localStorage on component mount
  useEffect(() => {
    // Check localStorage directly
    const storedData = localStorage.getItem('sahayak-store');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setDebugInfo({
          hasData: true,
          sessionsCount: parsed.sessions?.length || 0,
          lastSaved: parsed.lastSaved,
          rawData: storedData.substring(0, 200) + '...'
        });
        console.log('🔍 Debug: Found localStorage data:', parsed);
      } catch (error) {
        setDebugInfo({ hasData: false, error: error instanceof Error ? error.message : 'Unknown error' });
        console.error('🔍 Debug: Error parsing localStorage:', error);
      }
    } else {
      setDebugInfo({ hasData: false });
      console.log('🔍 Debug: No localStorage data found');
    }
  }, []);

  // Create a default session if none exists, or select the most recent one
  useEffect(() => {
    if (!currentSession && sessions.length === 0) {
      // Only create a new session if there are no sessions at all
      createSession('New Teaching Session');
    } else if (!currentSession && sessions.length > 0) {
      // If there are sessions but no current session, select the most recent one
      const mostRecentSession = sessions[0]; // sessions are already sorted by creation time (newest first)
      setCurrentSession(mostRecentSession.id);
    }
  }, [currentSession, createSession, sessions, setCurrentSession]);

  // Monitor processing state from agents
  useEffect(() => {
    if (currentSession) {
      const hasActiveAgents = currentSession.agents.some(agent => 
        agent.status === 'inProgress'
      );
      setIsProcessing(hasActiveAgents);
    }
  }, [currentSession?.agents]);

  // Monitor backdrop behavior - only show when processing AND page is hidden
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.hidden && isProcessing) {
        timer = setTimeout(() => {
          setIsMonitoringActive(true);
        }, 2000); // Show backdrop after 2 seconds of being hidden while processing
      } else {
        clearTimeout(timer);
        setIsMonitoringActive(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timer);
    };
  }, [isProcessing]);

  // Auto-save timer - save every 30 seconds when there are changes
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (currentSession && currentSession.messages.length > 0) {
        const stats = getStorageStats();
        const currentLastSaved = stats.lastSaved;
        
        // Only auto-save if there have been changes since last save
        if (!currentLastSaved || 
            (currentSession.lastActive && currentSession.lastActive > currentLastSaved)) {
          console.log('🕐 Auto-save triggered...');
          await saveSessionsManually();
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentSession, saveSessionsManually, getStorageStats]);

  // Manual save handler
  const handleManualSave = async () => {
    setSaving(true);
    try {
      await saveSessionsManually();
      // Refresh debug info after save
      const storedData = localStorage.getItem('sahayak-store');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setDebugInfo({
          hasData: true,
          sessionsCount: parsed.sessions?.length || 0,
          lastSaved: parsed.lastSaved,
          rawData: storedData.substring(0, 200) + '...'
        });
      }
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  // Test localStorage directly
  const testLocalStorage = () => {
    console.log('🧪 Testing localStorage...');
    console.log('Current sessions in store:', sessions.length);
    console.log('Current localStorage:', localStorage.getItem('sahayak-store'));
    
    // Create a test session if none exist
    if (sessions.length === 0) {
      console.log('🧪 Creating test session...');
      createSession('Test Session - ' + new Date().toLocaleTimeString());
      
      // Add some sample messages to the test session
      setTimeout(() => {
        if (currentSession) {
          console.log('🧪 Adding sample messages...');
          // Add a teacher message
          addMessage(currentSession.id, {
            agentId: 'teacher',
            content: 'Hello! I need help creating a worksheet for Grade 3 students.',
            suggestions: [],
            isEditable: false,
          });
          
          // Add an AI response
          setTimeout(() => {
            addMessage(currentSession.id, {
              agentId: 'orchestrator',
              content: 'I\'ll help you create a worksheet for Grade 3 students. Let me start by understanding your requirements.',
              suggestions: [],
              isEditable: false,
            });
          }, 1000);
        }
      }, 500);
    }
    
    // Force a save and check
    handleManualSave();
  };

  // Test agent activity
  const testAgentActivity = () => {
    if (currentSession) {
      console.log('🧪 Testing agent activity...');
      
      // Simulate agent activity by updating agent statuses progressively
      const { updateAgentStatus, addAgentLog } = useAgentStore.getState();
      
      // Start with orchestrator
      setTimeout(() => {
        console.log('🔄 Activating Orchestrator...');
        updateAgentStatus(currentSession.id, 'orchestrator', 'inProgress');
        addAgentLog(currentSession.id, 'orchestrator', {
          message: 'Starting worksheet generation workflow...',
          reasoning: 'Teacher requested worksheet for Grade 3 students'
        });
      }, 1000);
      
      // Activate intent classifier
      setTimeout(() => {
        console.log('🔄 Activating Intent Classifier...');
        updateAgentStatus(currentSession.id, 'intentClassifier', 'inProgress');
        addAgentLog(currentSession.id, 'intentClassifier', {
          message: 'Analyzing user intent...',
          reasoning: 'Processing teacher request for worksheet generation'
        });
        
        // Complete orchestrator
        updateAgentStatus(currentSession.id, 'orchestrator', 'completed');
        addAgentLog(currentSession.id, 'orchestrator', {
          message: 'Workflow initiated successfully',
          reasoning: 'Intent analysis completed, proceeding to content generation'
        });
      }, 3000);
      
      // Activate worksheet generator
      setTimeout(() => {
        console.log('🔄 Activating Worksheet Generator...');
        updateAgentStatus(currentSession.id, 'worksheetGenerator', 'inProgress');
        addAgentLog(currentSession.id, 'worksheetGenerator', {
          message: 'Generating worksheet content...',
          reasoning: 'Processing Grade 3 curriculum requirements'
        });
        
        // Complete intent classifier
        updateAgentStatus(currentSession.id, 'intentClassifier', 'completed');
        addAgentLog(currentSession.id, 'intentClassifier', {
          message: 'Intent classified as "Worksheet Generation"',
          reasoning: 'User mentioned creating worksheet for students'
        });
      }, 5000);
      
      // Activate personaliser
      setTimeout(() => {
        console.log('🔄 Activating Personaliser...');
        updateAgentStatus(currentSession.id, 'personaliser', 'inProgress');
        addAgentLog(currentSession.id, 'personaliser', {
          message: 'Personalizing content for Grade 3...',
          reasoning: 'Adapting complexity and language for target age group'
        });
        
        // Complete worksheet generator
        updateAgentStatus(currentSession.id, 'worksheetGenerator', 'completed');
        addAgentLog(currentSession.id, 'worksheetGenerator', {
          message: 'Worksheet content generated successfully',
          reasoning: 'Created appropriate questions and exercises'
        });
      }, 7000);
      
      // Activate judge
      setTimeout(() => {
        console.log('🔄 Activating Judge...');
        updateAgentStatus(currentSession.id, 'judge', 'inProgress');
        addAgentLog(currentSession.id, 'judge', {
          message: 'Evaluating content appropriateness...',
          reasoning: 'Checking if content matches Grade 3 standards'
        });
        
        // Complete personaliser
        updateAgentStatus(currentSession.id, 'personaliser', 'completed');
        addAgentLog(currentSession.id, 'personaliser', {
          message: 'Content personalized for Grade 3 level',
          reasoning: 'Adapted complexity and language for target age group'
        });
      }, 9000);
      
      // Complete judge and activate feedback
      setTimeout(() => {
        console.log('🔄 Activating Feedback Collector...');
        updateAgentStatus(currentSession.id, 'feedback', 'inProgress');
        addAgentLog(currentSession.id, 'feedback', {
          message: 'Collecting teacher feedback...',
          reasoning: 'Presenting generated content for approval'
        });
        
        // Complete judge
        updateAgentStatus(currentSession.id, 'judge', 'completed');
        addAgentLog(currentSession.id, 'judge', {
          message: 'Content approved for Grade 3 level',
          reasoning: 'All content meets educational standards'
        });
      }, 11000);
      
      // Complete feedback and activate memory
      setTimeout(() => {
        console.log('🔄 Activating Memory Agent...');
        updateAgentStatus(currentSession.id, 'sessionMemory', 'inProgress');
        addAgentLog(currentSession.id, 'sessionMemory', {
          message: 'Storing session context...',
          reasoning: 'Saving preferences and context for future use'
        });
        
        // Complete feedback
        updateAgentStatus(currentSession.id, 'feedback', 'completed');
        addAgentLog(currentSession.id, 'feedback', {
          message: 'Feedback collected and processed',
          reasoning: 'Teacher approved the generated worksheet'
        });
      }, 13000);
      
      // Complete memory
      setTimeout(() => {
        updateAgentStatus(currentSession.id, 'sessionMemory', 'completed');
        addAgentLog(currentSession.id, 'sessionMemory', {
          message: 'Session context stored successfully',
          reasoning: 'Preferences and context saved for future sessions'
        });
        console.log('✅ All agents completed!');
      }, 15000);
    }
  };

  // Worksheet workflow handlers
  const handleWorksheetComplete = (worksheet: string) => {
    if (currentSession) {
      // Add the completed worksheet as a message
      // This would typically be handled by your addMessage action
      console.log('Worksheet completed:', worksheet);
    }
    setShowWorksheetWorkflow(false);
  };

  const handleWorksheetCancel = () => {
    setShowWorksheetWorkflow(false);
  };

  // Format last saved time
  const formatLastSaved = (date: Date | null): string => {
    if (!date) return 'Never saved';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just saved';
    if (minutes < 60) return `Saved ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Saved ${hours}h ago`;
    return `Saved ${Math.floor(hours / 24)}d ago`;
  };

  if (!currentSession) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Left Sidebar - Teacher Profile & Session History (Collapsible) */}
      <Sidebar />

      {/* Main Content Area - Full Page Chatbot */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar with Language Toggle and Save Controls */}
        <Box
          sx={{
            height: 64,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Box>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
              {intl.formatMessage({ id: 'app.title' })}
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'text.secondary' }}>
              {intl.formatMessage({ id: 'app.subtitle' })}
            </p>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Debug Info */}
            {debugInfo && (
              <Tooltip title={`localStorage: ${debugInfo.hasData ? `${debugInfo.sessionsCount} sessions` : 'No data'}`} arrow>
                <Chip
                  icon={<DebugIcon />}
                  label={debugInfo.hasData ? `${debugInfo.sessionsCount} saved` : 'No data'}
                  size="small"
                  color={debugInfo.hasData ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.75rem',
                    height: 24,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Tooltip>
            )}

            {/* Save Status - Subtle indicator */}
            <Tooltip title={formatLastSaved(lastSaved)} arrow>
              <Chip
                icon={saving ? <SaveIcon /> : <SavedIcon />}
                label={saving ? 'Saving...' : 'Auto-saved'}
                size="small"
                color={lastSaved ? 'success' : 'default'}
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </Tooltip>

            {/* Manual Save Button */}
            <Tooltip title="Save now" arrow>
              <IconButton
                onClick={handleManualSave}
                disabled={saving}
                size="small"
                sx={{ 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Test localStorage Button */}
            <Tooltip title="Test localStorage" arrow>
              <IconButton
                onClick={testLocalStorage}
                size="small"
                sx={{ 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <DebugIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Test Agent Activity Button */}
            <Tooltip title="Test Agent Activity" arrow>
              <IconButton
                onClick={testAgentActivity}
                size="small"
                sx={{ 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Psychology fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Session Manager Button */}
            <Tooltip title="Manage sessions" arrow>
              <IconButton
                onClick={() => setShowSessionManager(true)}
                size="small"
                sx={{ 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <StorageIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Voice Test Button */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowVoiceTest(!showVoiceTest)}
              sx={{ 
                fontSize: '0.75rem',
                height: 32,
                px: 1.5
              }}
            >
              🎤 Voice Test
            </Button>

            {/* Language Toggle */}
            <LanguageToggle locale={locale} onLocaleChange={setLocale} />
          </Box>
        </Box>

        {/* Full Page Chat Container */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          {/* Voice Test Panel */}
          {showVoiceTest && <VoiceTestPanel />}
          
          {/* Chat Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1000px', mx: 'auto', width: '100%' }}>
            <ChatArea session={currentSession} />
            <InputBar 
              session={currentSession}
              onSend={(message: string) => {
                console.log('Sending message:', message);
                // Handle normal message sending here
                // Note: Intent detection would be handled inside InputBar
              }}
              isProcessing={isProcessing}
            />
          </Box>
        </Box>
      </Box>

      {/* Right Sidebar - Agent Tools (Triggered by LLM) */}
      <AgentToolsSidebar session={currentSession} />

      {/* Monitoring Backdrop */}
      <MonitoringBackdrop
        open={isMonitoringActive}
        onResume={() => setIsMonitoringActive(false)}
      />

      {/* Session Manager Dialog */}
      <SessionManager
        open={showSessionManager}
        onClose={() => setShowSessionManager(false)}
      />

      {/* Worksheet Generation Workflow */}
      {showWorksheetWorkflow && (
        <WorksheetGenerationWorkflow
          trigger={worksheetTrigger}
          onComplete={handleWorksheetComplete}
          onCancel={handleWorksheetCancel}
        />
      )}
    </Box>
  );
} 