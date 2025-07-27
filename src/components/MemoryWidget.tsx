'use client';

import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tooltip,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  ExpandMore,
  Memory,
  Psychology,
  Settings,
  Info,
  ContentCopy,
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { Session, MemoryItem } from '@/store/agentStore';

interface MemoryWidgetProps {
  session: Session;
}

const getMemoryIcon = (type: MemoryItem['type']) => {
  switch (type) {
    case 'fact':
      return <Info color="primary" />;
    case 'preference':
      return <Settings color="secondary" />;
    case 'context':
      return <Psychology color="success" />;
    default:
      return <Memory />;
  }
};

const getMemoryColor = (type: MemoryItem['type']) => {
  switch (type) {
    case 'fact':
      return 'primary';
    case 'preference':
      return 'secondary';
    case 'context':
      return 'success';
    default:
      return 'default';
  }
};

export default function MemoryWidget({ session }: MemoryWidgetProps) {
  const intl = useIntl();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleMemoryClick = (memory: MemoryItem) => {
    // Copy memory content to clipboard for easy reuse
    navigator.clipboard.writeText(`recall ${memory.content.toLowerCase()}`);
    setSnackbarMessage(`Copied "recall ${memory.content.toLowerCase()}" to clipboard`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const groupedMemory = session.memory.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<MemoryItem['type'], MemoryItem[]>);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
        🧠 {intl.formatMessage({ id: 'memory.title' })} ({session.memory.length})
      </Typography>

      {/* Memory List - Compact */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {session.memory.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No memories stored yet. Start a conversation to build context.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {Object.entries(groupedMemory).map(([type, items]) => (
              <React.Fragment key={type}>
                <ListItem sx={{ bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    {getMemoryIcon(type as MemoryItem['type'])}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                        {type} ({(items as MemoryItem[]).length})
                      </Typography>
                    }
                  />
                </ListItem>
                {(items as MemoryItem[]).map((memory) => (
                  <Tooltip
                    key={memory.id}
                    title={`Type 'recall ${memory.content.toLowerCase()}' to reuse`}
                    placement="left"
                  >
                    <ListItem
                      button
                      onClick={() => handleMemoryClick(memory)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText
                        primary={memory.content}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {memory.timestamp.toLocaleDateString()}
                            </Typography>
                            <Chip
                              size="small"
                              label={`Used ${memory.usageCount}x`}
                              color={getMemoryColor(memory.type) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </ListItem>
                  </Tooltip>
                ))}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Memory Stats */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Memory Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`${groupedMemory.fact?.length || 0} Facts`}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={`${groupedMemory.preference?.length || 0} Preferences`}
            color="secondary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={`${groupedMemory.context?.length || 0} Context`}
            color="success"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
} 