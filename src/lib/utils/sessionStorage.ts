import { Session, TeacherProfile } from '@/store/agentStore';

interface SessionStorageData {
  sessions: Session[];
  teacherProfile: TeacherProfile;
  locale: 'en' | 'hi' | 'pa';
  lastSaved: string;
  version: string;
}

interface SessionBackup {
  sessionId: string;
  title: string;
  messageCount: number;
  createdAt: string;
  lastActive: string;
  size: number; // in bytes
}

export class SessionStorageManager {
  private static readonly STORAGE_KEY = 'sahayak-store';
  private static readonly BACKUP_KEY = 'sahayak-backups';
  private static readonly MAX_SESSIONS = 50; // Limit stored sessions
  private static readonly VERSION = '1.0.0';

  /**
   * Save sessions to localStorage with validation and error handling
   */
  static async saveSessions(
    sessions: Session[], 
    teacherProfile: TeacherProfile, 
    locale: 'en' | 'hi' | 'pa',
    force: boolean = false
  ): Promise<{ success: boolean; error?: string; savedCount?: number }> {
    try {
      console.log(`💾 SessionStorage: Saving ${sessions.length} sessions to localStorage...`);

      // Validate data before saving
      const validationResult = this.validateSessionData(sessions, teacherProfile);
      if (!validationResult.valid) {
        console.error('❌ SessionStorage: Validation failed:', validationResult.errors);
        return { success: false, error: `Validation failed: ${validationResult.errors.join(', ')}` };
      }

      // Clean up old/large sessions if needed
      const cleanedSessions = this.cleanupSessions(sessions);
      
      const storageData: SessionStorageData = {
        sessions: cleanedSessions,
        teacherProfile,
        locale,
        lastSaved: new Date().toISOString(),
        version: this.VERSION
      };

      // Check storage quota
      const dataSize = this.calculateDataSize(storageData);
      if (dataSize > 4.5 * 1024 * 1024) { // 4.5MB limit (localStorage is ~5MB)
        console.warn('⚠️ SessionStorage: Data size approaching localStorage limit, cleaning up...');
        storageData.sessions = this.cleanupSessions(sessions, Math.floor(this.MAX_SESSIONS * 0.7));
      }

      // Create backup before saving
      if (!force) {
        await this.createBackup(cleanedSessions);
      }

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData));
      
      console.log(`✅ SessionStorage: Successfully saved ${cleanedSessions.length} sessions`);
      return { 
        success: true, 
        savedCount: cleanedSessions.length 
      };

    } catch (error) {
      console.error('❌ SessionStorage: Failed to save sessions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Load sessions from localStorage with fallback and validation
   */
  static async loadSessions(): Promise<{
    sessions: Session[];
    teacherProfile: TeacherProfile | null;
    locale: 'en' | 'hi' | 'pa';
    lastSaved: Date | null;
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('📂 SessionStorage: Loading sessions from localStorage...');

      const storedData = localStorage.getItem(this.STORAGE_KEY);
      
      if (!storedData) {
        console.log('📂 SessionStorage: No stored data found, returning empty state');
        return {
          sessions: [],
          teacherProfile: null,
          locale: 'en',
          lastSaved: null,
          success: true
        };
      }

      const parsedData: SessionStorageData = JSON.parse(storedData);
      
      // Validate version compatibility
      if (parsedData.version && parsedData.version !== this.VERSION) {
        console.warn(`⚠️ SessionStorage: Version mismatch (stored: ${parsedData.version}, current: ${this.VERSION})`);
        // Could add migration logic here
      }

      // Validate and clean loaded data
      const validatedSessions = this.validateAndCleanLoadedSessions(parsedData.sessions || []);
      
      console.log(`✅ SessionStorage: Successfully loaded ${validatedSessions.length} sessions`);
      
      return {
        sessions: validatedSessions,
        teacherProfile: parsedData.teacherProfile || null,
        locale: parsedData.locale || 'en',
        lastSaved: parsedData.lastSaved ? new Date(parsedData.lastSaved) : null,
        success: true
      };

    } catch (error) {
      console.error('❌ SessionStorage: Failed to load sessions:', error);
      
      // Try to recover from backup
      const backupResult = await this.recoverFromBackup();
      if (backupResult.success) {
        console.log('🔄 SessionStorage: Successfully recovered from backup');
        return backupResult;
      }

      return {
        sessions: [],
        teacherProfile: null,
        locale: 'en',
        lastSaved: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Export sessions as JSON for backup/sharing
   */
  static exportSessions(sessions: Session[], sessionIds?: string[]): { 
    success: boolean; 
    data?: string; 
    filename?: string;
    error?: string; 
  } {
    try {
      const sessionsToExport = sessionIds 
        ? sessions.filter(s => sessionIds.includes(s.id))
        : sessions;

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: this.VERSION,
        sessionCount: sessionsToExport.length,
        sessions: sessionsToExport.map(session => ({
          ...session,
          // Convert dates to ISO strings for JSON compatibility
          createdAt: session.createdAt.toISOString(),
          lastActive: session.lastActive.toISOString(),
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          agents: session.agents.map(agent => ({
            ...agent,
            logs: agent.logs.map(log => ({
              ...log,
              timestamp: log.timestamp.toISOString()
            }))
          })),
          memory: session.memory.map(mem => ({
            ...mem,
            timestamp: mem.timestamp.toISOString()
          }))
        }))
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      const filename = `sahayak-sessions-${new Date().toISOString().split('T')[0]}.json`;
      
      return { 
        success: true, 
        data: jsonData, 
        filename 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      };
    }
  }

  /**
   * Import sessions from JSON
   */
  static importSessions(jsonData: string): { 
    success: boolean; 
    sessions?: Session[]; 
    error?: string; 
  } {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.sessions || !Array.isArray(importData.sessions)) {
        return { success: false, error: 'Invalid import format: sessions array not found' };
      }

      const sessions: Session[] = importData.sessions.map((session: any) => ({
        ...session,
        // Convert ISO strings back to Date objects
        createdAt: new Date(session.createdAt),
        lastActive: new Date(session.lastActive),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        agents: session.agents.map((agent: any) => ({
          ...agent,
          logs: agent.logs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          }))
        })),
        memory: session.memory.map((mem: any) => ({
          ...mem,
          timestamp: new Date(mem.timestamp)
        }))
      }));

      const validatedSessions = this.validateAndCleanLoadedSessions(sessions);
      
      return { 
        success: true, 
        sessions: validatedSessions 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Import failed' 
      };
    }
  }

  /**
   * Get storage statistics
   */
  static getStorageStats(): {
    totalSessions: number;
    totalMessages: number;
    storageSize: number;
    lastSaved: Date | null;
    backupCount: number;
  } {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      
      if (!storedData) {
        return {
          totalSessions: 0,
          totalMessages: 0,
          storageSize: 0,
          lastSaved: null,
          backupCount: 0
        };
      }

      const parsedData: SessionStorageData = JSON.parse(storedData);
      const totalMessages = (parsedData.sessions || []).reduce(
        (count, session) => count + session.messages.length, 
        0
      );

      return {
        totalSessions: (parsedData.sessions || []).length,
        totalMessages,
        storageSize: new Blob([storedData]).size,
        lastSaved: parsedData.lastSaved ? new Date(parsedData.lastSaved) : null,
        backupCount: backupData ? JSON.parse(backupData).length : 0
      };
    } catch (error) {
      console.error('❌ SessionStorage: Failed to get storage stats:', error);
      return {
        totalSessions: 0,
        totalMessages: 0,
        storageSize: 0,
        lastSaved: null,
        backupCount: 0
      };
    }
  }

  /**
   * Clear all stored data (with confirmation)
   */
  static clearAllData(confirm: boolean = false): { success: boolean; error?: string } {
    if (!confirm) {
      return { success: false, error: 'Confirmation required to clear all data' };
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
      console.log('🗑️ SessionStorage: All data cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ SessionStorage: Failed to clear data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear data' 
      };
    }
  }

  // Private helper methods
  private static validateSessionData(
    sessions: Session[], 
    teacherProfile: TeacherProfile
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(sessions)) {
      errors.push('Sessions must be an array');
    }

    if (!teacherProfile || !teacherProfile.id) {
      errors.push('Teacher profile is required with valid ID');
    }

    // Validate each session
    sessions.forEach((session, index) => {
      if (!session.id) errors.push(`Session ${index} missing ID`);
      if (!session.title) errors.push(`Session ${index} missing title`);
      if (!Array.isArray(session.messages)) errors.push(`Session ${index} messages must be array`);
    });

    return { valid: errors.length === 0, errors };
  }

  private static cleanupSessions(sessions: Session[], maxSessions: number = this.MAX_SESSIONS): Session[] {
    if (sessions.length <= maxSessions) return sessions;

    // Sort by lastActive (most recent first) and keep only the most recent sessions
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );

    const kept = sortedSessions.slice(0, maxSessions);
    const removed = sessions.length - kept.length;
    
    if (removed > 0) {
      console.log(`🧹 SessionStorage: Cleaned up ${removed} old sessions`);
    }

    return kept;
  }

  private static calculateDataSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private static validateAndCleanLoadedSessions(sessions: any[]): Session[] {
    return sessions
      .filter((session) => {
        // Basic validation
        return session && 
               session.id && 
               session.title && 
               Array.isArray(session.messages) &&
               Array.isArray(session.agents);
      })
      .map((session) => ({
        ...session,
        // Ensure dates are Date objects
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
      }));
  }

  private static async createBackup(sessions: Session[]): Promise<void> {
    try {
      const existingBackups = JSON.parse(localStorage.getItem(this.BACKUP_KEY) || '[]');
      
      const backup: SessionBackup = {
        sessionId: `backup-${Date.now()}`,
        title: `Backup ${new Date().toLocaleString()}`,
        messageCount: sessions.reduce((count, s) => count + s.messages.length, 0),
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        size: this.calculateDataSize(sessions)
      };

      // Keep only the last 5 backups
      const updatedBackups = [backup, ...existingBackups].slice(0, 5);
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(updatedBackups));
      
    } catch (error) {
      console.warn('⚠️ SessionStorage: Failed to create backup:', error);
    }
  }

  private static async recoverFromBackup(): Promise<{
    sessions: Session[];
    teacherProfile: TeacherProfile | null;
    locale: 'en' | 'hi' | 'pa';
    lastSaved: Date | null;
    success: boolean;
  }> {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        return {
          sessions: [],
          teacherProfile: null,
          locale: 'en',
          lastSaved: null,
          success: false
        };
      }

      // For now, just return empty state since backup implementation would be more complex
      // In a full implementation, you'd store actual session data in backups
      return {
        sessions: [],
        teacherProfile: null,
        locale: 'en',
        lastSaved: null,
        success: false
      };
    } catch (error) {
      return {
        sessions: [],
        teacherProfile: null,
        locale: 'en',
        lastSaved: null,
        success: false
      };
    }
  }
} 