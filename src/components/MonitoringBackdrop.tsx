'use client';

import React from 'react';
import {
  Backdrop,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { useIntl } from 'react-intl';

interface MonitoringBackdropProps {
  open: boolean;
  onResume: () => void;
}

export default function MonitoringBackdrop({ open, onResume }: MonitoringBackdropProps) {
  const intl = useIntl();

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={open}
    >
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {intl.formatMessage({ id: 'monitoring.paused' })}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={onResume}
          sx={{ mt: 2 }}
        >
          Resume Processing
        </Button>
      </Paper>
    </Backdrop>
  );
} 