'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Language } from '@mui/icons-material';
import { useIntl } from 'react-intl';

interface LanguageToggleProps {
  locale: 'en' | 'hi' | 'pa';
  onLocaleChange: (locale: 'en' | 'hi' | 'pa') => void;
}

export default function LanguageToggle({ locale, onLocaleChange }: LanguageToggleProps) {
  const intl = useIntl();

  const handleToggle = () => {
    // Cycle through all three languages
    if (locale === 'en') {
      onLocaleChange('hi');
    } else if (locale === 'hi') {
      onLocaleChange('pa');
    } else {
      onLocaleChange('en');
    }
  };

  const getLanguageDisplay = () => {
    switch (locale) {
      case 'en': return 'EN';
      case 'hi': return 'हिं';
      case 'pa': return 'ਪੰ';
      default: return 'EN';
    }
  };

  return (
    <Tooltip title={intl.formatMessage({ id: 'language.toggle' })}>
      <IconButton onClick={handleToggle} color="inherit" sx={{ position: 'relative' }}>
        <Language />
        <span style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          fontSize: '0.6rem',
          fontWeight: 'bold',
          background: 'rgba(255,255,255,0.9)',
          color: '#1976d2',
          padding: '1px 3px',
          borderRadius: '2px',
          lineHeight: 1
        }}>
          {getLanguageDisplay()}
        </span>
      </IconButton>
    </Tooltip>
  );
} 