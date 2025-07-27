import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionStorageManager } from '@/lib/utils/sessionStorage';

export interface Agent {
  id: string;
  name: string;
  color: string;
  status: 'pending' | 'inProgress' | 'suspended' | 'skipped' | 'completed' | 'error';
  logs: AgentLog[];
}

export interface AgentLog {
  id: string;
  timestamp: Date;
  message: string;
  reasoning: string;
}

export interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  feedbackReason?: string;
  suggestions: string[];
  isEditable: boolean;
}

export interface Session {
  id: string;
  title: string;
  createdAt: Date;
  lastActive: Date;
  messages: Message[];
  agents: Agent[];
  memory: MemoryItem[];
}

export interface MemoryItem {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'context';
  timestamp: Date;
  usageCount: number;
}

export interface TeacherProfile {
  id: string;
  name: string;
  school: string;
  subjects: string[];
  grades: number[];
  lastSeen: Date;
}

interface AgentStore {
  // State
  currentSession: Session | null;
  sessions: Session[];
  teacherProfile: TeacherProfile;
  locale: 'en' | 'hi' | 'pa';
  lastSaved: Date | null;
  
  // Actions
  createSession: (title: string) => void;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateAgentStatus: (sessionId: string, agentId: string, status: Agent['status']) => void;
  addAgentLog: (sessionId: string, agentId: string, log: Omit<AgentLog, 'id' | 'timestamp'>) => void;
  addMemoryItem: (sessionId: string, item: Omit<MemoryItem, 'id' | 'timestamp' | 'usageCount'>) => void;
  updateMessageFeedback: (sessionId: string, messageId: string, feedback: 'positive' | 'negative', reason?: string) => void;
  setLocale: (locale: 'en' | 'hi' | 'pa') => void;
  undoLastMessage: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;
  
  // Enhanced storage actions
  saveSessionsManually: () => Promise<{ success: boolean; error?: string }>;
  exportSessions: (sessionIds?: string[]) => Promise<{ success: boolean; data?: string; filename?: string; error?: string }>;
  importSessions: (jsonData: string) => Promise<{ success: boolean; error?: string }>;
  deleteSession: (sessionId: string) => void;
  duplicateSession: (sessionId: string) => void;
  getStorageStats: () => any;
  clearAllData: (confirm: boolean) => Promise<{ success: boolean; error?: string }>;
}

const AGENTS: Omit<Agent, 'status' | 'logs'>[] = [
  { id: 'orchestrator', name: 'Orchestrator', color: '#1976d2' },
  { id: 'sessionMemory', name: 'Session Memory', color: '#388e3c' },
  { id: 'feedback', name: 'Feedback', color: '#f57c00' },
  { id: 'personaliser', name: 'Personaliser', color: '#7b1fa2' },
  { id: 'suggestions', name: 'Suggestions', color: '#c2185b' },
  { id: 'negotiation', name: 'Negotiation', color: '#0097a7' },
  { id: 'intentClassifier', name: 'Intent Classifier', color: '#ff6f00' },
  { id: 'monitoring', name: 'Monitoring', color: '#6d4c41' },
  { id: 'judge', name: 'Judge', color: '#d32f2f' },
];

// Helper function to convert dates in session data
const convertSessionDates = (session: any): Session => ({
  ...session,
  createdAt: new Date(session.createdAt),
  lastActive: new Date(session.lastActive),
  messages: session.messages.map((msg: any) => ({
    ...msg,
    timestamp: new Date(msg.timestamp)
  })),
  agents: session.agents.map((agent: any) => ({
    ...agent,
    logs: (agent.logs || []).map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }))
  })),
  memory: (session.memory || []).map((mem: any) => ({
    ...mem,
    timestamp: new Date(mem.timestamp)
  }))
});

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessions: [],
      teacherProfile: {
        id: 'teacher-1',
        name: 'Priya Sharma',
        school: 'Government Primary School, Jaipur',
        subjects: ['Mathematics', 'Science', 'English'],
        grades: [1, 2, 3, 4, 5],
        lastSeen: new Date(),
      },
      locale: 'en' as 'en' | 'hi' | 'pa',
      lastSaved: null,

      // Actions
      createSession: (title: string) => {
        const session: Session = {
          id: `session-${Date.now()}`,
          title,
          createdAt: new Date(),
          lastActive: new Date(),
          messages: [],
          agents: AGENTS.map(agent => ({
            ...agent,
            status: 'pending' as const,
            logs: [],
          })),
          memory: [],
        };

        set(state => ({
          sessions: [session, ...state.sessions],
          currentSession: session,
        }));

        // Auto-save after creating a session
        setTimeout(() => {
          get().saveSessionsManually();
        }, 100);
      },

      addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date(),
        };

        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  lastActive: new Date(),
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                messages: [...state.currentSession.messages, newMessage],
                lastActive: new Date(),
              }
            : state.currentSession,
        }));

        // Auto-save after adding a message
        setTimeout(() => {
          get().saveSessionsManually();
        }, 500);
      },

      updateAgentStatus: (sessionId: string, agentId: string, status: Agent['status']) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  agents: session.agents.map(agent =>
                    agent.id === agentId ? { ...agent, status } : agent
                  ),
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                agents: state.currentSession.agents.map(agent =>
                  agent.id === agentId ? { ...agent, status } : agent
                ),
              }
            : state.currentSession,
        }));
      },

      addAgentLog: (sessionId: string, agentId: string, log: Omit<AgentLog, 'id' | 'timestamp'>) => {
        const newLog: AgentLog = {
          ...log,
          id: `log-${Date.now()}`,
          timestamp: new Date(),
        };

        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  agents: session.agents.map(agent =>
                    agent.id === agentId
                      ? { ...agent, logs: [...agent.logs, newLog] }
                      : agent
                  ),
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                agents: state.currentSession.agents.map(agent =>
                  agent.id === agentId
                    ? { ...agent, logs: [...agent.logs, newLog] }
                    : agent
                ),
              }
            : state.currentSession,
        }));
      },

      addMemoryItem: (sessionId: string, item: Omit<MemoryItem, 'id' | 'timestamp' | 'usageCount'>) => {
        const newMemoryItem: MemoryItem = {
          ...item,
          id: `mem-${Date.now()}`,
          timestamp: new Date(),
          usageCount: 0,
        };

        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  memory: [...session.memory, newMemoryItem],
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                memory: [...state.currentSession.memory, newMemoryItem],
              }
            : state.currentSession,
        }));
      },

      updateMessageFeedback: (sessionId: string, messageId: string, feedback: 'positive' | 'negative', reason?: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.map(message =>
                    message.id === messageId
                      ? { ...message, feedback, feedbackReason: reason }
                      : message
                  ),
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                messages: state.currentSession.messages.map(message =>
                  message.id === messageId
                    ? { ...message, feedback, feedbackReason: reason }
                    : message
                ),
              }
            : state.currentSession,
        }));
      },

      setLocale: (locale: 'en' | 'hi' | 'pa') => {
        set({ locale });
      },

      undoLastMessage: (sessionId: string) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.slice(0, -1),
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? {
                ...state.currentSession,
                messages: state.currentSession.messages.slice(0, -1),
              }
            : state.currentSession,
        }));
      },

      setCurrentSession: (sessionId: string) => {
        const { sessions } = get();
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },

      // Enhanced storage actions
      saveSessionsManually: async () => {
        const { sessions, teacherProfile, locale } = get();
        console.log('💾 Manual save triggered...');
        
        const result = await SessionStorageManager.saveSessions(
          sessions, 
          teacherProfile, 
          locale, 
          true // force save
        );
        
        if (result.success) {
          set({ lastSaved: new Date() });
          console.log(`✅ Manual save completed: ${result.savedCount} sessions saved`);
        } else {
          console.error('❌ Manual save failed:', result.error);
        }
        
        return result;
      },

      exportSessions: async (sessionIds?: string[]) => {
        const { sessions } = get();
        console.log('📤 Exporting sessions...');
        
        const result = SessionStorageManager.exportSessions(sessions, sessionIds);
        
        if (result.success && result.data && result.filename) {
          // Create download link
          const blob = new Blob([result.data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          console.log(`✅ Sessions exported: ${result.filename}`);
        } else {
          console.error('❌ Export failed:', result.error);
        }
        
        return result;
      },

      importSessions: async (jsonData: string) => {
        console.log('📥 Importing sessions...');
        
        const result = SessionStorageManager.importSessions(jsonData);
        
        if (result.success && result.sessions) {
          set(state => ({
            sessions: [...result.sessions!, ...state.sessions]
          }));
          
          // Save after import
          await get().saveSessionsManually();
          
          console.log(`✅ Sessions imported: ${result.sessions.length} sessions`);
        } else {
          console.error('❌ Import failed:', result.error);
        }
        
        return result;
      },

      deleteSession: (sessionId: string) => {
        set(state => {
          const updatedSessions = state.sessions.filter(s => s.id !== sessionId);
          const newCurrentSession = state.currentSession?.id === sessionId 
            ? (updatedSessions.length > 0 ? updatedSessions[0] : null)
            : state.currentSession;
          
          return {
            sessions: updatedSessions,
            currentSession: newCurrentSession
          };
        });

        // Auto-save after deletion
        setTimeout(() => {
          get().saveSessionsManually();
        }, 100);
      },

      duplicateSession: (sessionId: string) => {
        const { sessions } = get();
        const sessionToDuplicate = sessions.find(s => s.id === sessionId);
        
        if (sessionToDuplicate) {
          const duplicatedSession: Session = {
            ...sessionToDuplicate,
            id: `session-${Date.now()}`,
            title: `${sessionToDuplicate.title} (Copy)`,
            createdAt: new Date(),
            lastActive: new Date(),
            // Reset agent statuses and logs for the copy
            agents: sessionToDuplicate.agents.map(agent => ({
              ...agent,
              status: 'pending' as const,
              logs: []
            }))
          };

          set(state => ({
            sessions: [duplicatedSession, ...state.sessions],
            currentSession: duplicatedSession
          }));

          // Auto-save after duplication
          setTimeout(() => {
            get().saveSessionsManually();
          }, 100);
        }
      },

      getStorageStats: () => {
        return SessionStorageManager.getStorageStats();
      },

      clearAllData: async (confirm: boolean) => {
        const result = SessionStorageManager.clearAllData(confirm);
        
        if (result.success) {
          set({
            sessions: [],
            currentSession: null,
            lastSaved: null
          });
        }
        
        return result;
      },
    }),
    {
      name: 'sahayak-store',
      partialize: (state) => ({
        sessions: state.sessions,
        teacherProfile: state.teacherProfile,
        locale: state.locale,
        lastSaved: state.lastSaved,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 Store rehydrated from localStorage');
          
          // Convert dates in sessions
          if (state.sessions && Array.isArray(state.sessions)) {
            state.sessions = state.sessions.map(convertSessionDates);
          }
          
          // Convert teacher profile dates
          if (state.teacherProfile) {
            state.teacherProfile.lastSeen = new Date(state.teacherProfile.lastSeen);
          }
          
          // Convert lastSaved date
          if (state.lastSaved) {
            state.lastSaved = new Date(state.lastSaved);
          }
          
          console.log(`📂 Loaded ${state.sessions?.length || 0} sessions from localStorage`);
        }
      },
    }
  )
); 