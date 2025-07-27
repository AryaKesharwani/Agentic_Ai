'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Divider,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Storage as StorageIcon,
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { useAgentStore } from '@/store/agentStore';

interface SessionManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function SessionManager({ open, onClose }: SessionManagerProps) {
  const intl = useIntl();
  const { 
    sessions, 
    currentSession,
    lastSaved,
    saveSessionsManually,
    exportSessions,
    importSessions,
    deleteSession,
    duplicateSession,
    getStorageStats,
    clearAllData,
  } = useAgentStore();

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [importData, setImportData] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);

  // Load storage stats when component opens
  React.useEffect(() => {
    if (open) {
      setStorageStats(getStorageStats());
    }
  }, [open, getStorageStats]);

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleManualSave = async () => {
    setLoading(true);
    try {
      const result = await saveSessionsManually();
      if (result.success) {
        showNotification(`✅ Saved sessions successfully!`, 'success');
        setStorageStats(getStorageStats());
      } else {
        showNotification(`❌ Save failed: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('❌ Unexpected error during save', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    setLoading(true);
    try {
      const result = await exportSessions();
      if (result.success) {
        showNotification(`📤 Exported ${sessions.length} sessions as ${result.filename}`, 'success');
      } else {
        showNotification(`❌ Export failed: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('❌ Unexpected error during export', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const result = await exportSessions([sessionId]);
      const session = sessions.find(s => s.id === sessionId);
      if (result.success) {
        showNotification(`📤 Exported session "${session?.title}" successfully`, 'success');
      } else {
        showNotification(`❌ Export failed: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('❌ Unexpected error during export', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      showNotification('❌ Please paste JSON data to import', 'error');
      return;
    }

    setImporting(true);
    try {
      const result = await importSessions(importData);
      if (result.success) {
        showNotification(`📥 Successfully imported sessions!`, 'success');
        setShowImportDialog(false);
        setImportData('');
        setStorageStats(getStorageStats());
      } else {
        showNotification(`❌ Import failed: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('❌ Unexpected error during import', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    deleteSession(sessionId);
    showNotification(`🗑️ Deleted session "${session?.title}"`, 'info');
    setConfirmDelete(null);
    setStorageStats(getStorageStats());
  };

  const handleDuplicateSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    duplicateSession(sessionId);
    showNotification(`📋 Duplicated session "${session?.title}"`, 'success');
    setStorageStats(getStorageStats());
  };

  const handleClearAllData = async () => {
    const result = await clearAllData(true);
    if (result.success) {
      showNotification('🗑️ All data cleared successfully', 'info');
      setConfirmClearAll(false);
      setStorageStats(getStorageStats());
    } else {
      showNotification(`❌ Clear failed: ${result.error}`, 'error');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      showNotification('❌ Please select a JSON file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      setShowImportDialog(true);
    };
    reader.readAsText(file);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            maxHeight: '80vh',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <StorageIcon color="primary" />
            <Typography variant="h6" component="span">
              Session Manager
            </Typography>
            {loading && <CircularProgress size={20} />}
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Storage Statistics - Simplified */}
          {storageStats && (
            <Card sx={{ mb: 2, elevation: 1 }}>
              <CardContent sx={{ py: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary">
                        {storageStats.totalSessions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sessions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="secondary">
                        {storageStats.totalMessages}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Messages
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {formatBytes(storageStats.storageSize)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Storage
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.primary">
                        {formatDate(lastSaved)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last Saved
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Storage Usage Bar */}
                <Box mt={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(storageStats.storageSize / (5 * 1024 * 1024)) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                    color={storageStats.storageSize > 4 * 1024 * 1024 ? 'warning' : 'primary'}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Storage Usage (5MB limit)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Simplified */}
          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleManualSave}
              disabled={loading}
              size="small"
            >
              Save Now
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExportAll}
              disabled={loading || sessions.length === 0}
              size="small"
            >
              Export All
            </Button>

            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              component="label"
              disabled={loading}
              size="small"
            >
              Import File
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleFileImport}
              />
            </Button>

            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setShowImportDialog(true)}
              disabled={loading}
              size="small"
            >
              Import JSON
            </Button>

            <Button
              variant="text"
              startIcon={<WarningIcon />}
              onClick={() => setConfirmClearAll(true)}
              disabled={loading}
              color="error"
              size="small"
              sx={{ ml: 'auto' }}
            >
              Clear All
            </Button>
          </Box>

          {/* Sessions List */}
          <Typography variant="subtitle1" gutterBottom>
            Saved Sessions ({sessions.length})
          </Typography>
          
          {sessions.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              No sessions found. Start a new conversation to create your first session!
            </Alert>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {sessions.map((session, index) => (
                <React.Fragment key={session.id}>
                  <ListItem
                    sx={{
                      bgcolor: session.id === currentSession?.id ? 'action.selected' : 'transparent',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {session.title}
                          </Typography>
                          {session.id === currentSession?.id && (
                            <Chip size="small" label="Current" color="primary" sx={{ height: 20 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {session.messages.length} messages • {formatDate(session.lastActive)}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Export Session">
                          <IconButton
                            size="small"
                            onClick={() => handleExportSession(session.id)}
                            disabled={loading}
                            sx={{ width: 28, height: 28 }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate Session">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicateSession(session.id)}
                            disabled={loading}
                            sx={{ width: 28, height: 28 }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Session">
                          <IconButton
                            size="small"
                            onClick={() => setConfirmDelete(session.id)}
                            disabled={loading}
                            color="error"
                            sx={{ width: 28, height: 28 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < sessions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Sessions from JSON</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Paste JSON data here"
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            variant="outlined"
            placeholder="Paste the exported JSON content here..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={importing || !importData.trim()}
            startIcon={importing ? <CircularProgress size={16} /> : <ImportIcon />}
          >
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this session? This action cannot be undone.
          </Typography>
          {confirmDelete && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Session: "{sessions.find(s => s.id === confirmDelete)?.title}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button 
            onClick={() => confirmDelete && handleDeleteSession(confirmDelete)} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation */}
      <Dialog open={confirmClearAll} onClose={() => setConfirmClearAll(false)}>
        <DialogTitle>⚠️ Clear All Data</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will permanently delete ALL sessions, messages, and stored data!
          </Alert>
          <Typography>
            Are you absolutely sure you want to clear all data? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearAll(false)}>Cancel</Button>
          <Button 
            onClick={handleClearAllData} 
            color="error"
            variant="contained"
            startIcon={<WarningIcon />}
          >
            Clear All Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
} 