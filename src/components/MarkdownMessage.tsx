'use client';

import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { markdown } from 'markdown';

interface MarkdownMessageProps {
  content: string;
  isAI?: boolean;
  enableSmartIndentation?: boolean;
}

export default function MarkdownMessage({ 
  content, 
  isAI = false, 
  enableSmartIndentation = true 
}: MarkdownMessageProps) {
  // Detect content type for smart indentation
  const detectContentType = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Educational content indicators
    const educationalKeywords = [
      'worksheet', 'quiz', 'exercise', 'activity', 'lesson', 'assignment',
      'questions', 'problems', 'practice', 'homework', 'test', 'exam'
    ];
    
    // Structured content indicators
    const structuredKeywords = [
      'step', 'process', 'procedure', 'method', 'guide', 'tutorial',
      'instructions', 'implementation', 'strategy'
    ];
    
    const hasEducationalContent = educationalKeywords.some(keyword => lowerText.includes(keyword));
    const hasStructuredContent = structuredKeywords.some(keyword => lowerText.includes(keyword));
    const hasMultipleSections = (text.match(/#{1,3}\s/g) || []).length >= 2;
    const hasLists = (text.match(/^[-*]\s/gm) || []).length >= 3;
    
    if (hasEducationalContent || (hasMultipleSections && hasLists)) {
      return 'educational';
    } else if (hasStructuredContent || hasMultipleSections) {
      return 'structured';
    } else {
      return 'simple';
    }
  };

  const contentType = enableSmartIndentation ? detectContentType(content) : 'simple';

  // Convert markdown to HTML using the markdown package
  const htmlContent = markdown.toHTML(content);

  // Get indentation based on content type
  const getIndentation = () => {
    switch (contentType) {
      case 'educational':
        return { 
          pl: 1.5, 
          borderLeft: 3, 
          borderColor: 'primary.light',
          bgcolor: 'primary.lighter' 
        };
      case 'structured':
        return { 
          pl: 1, 
          borderLeft: 2, 
          borderColor: 'secondary.light' 
        };
      default:
        return {};
    }
  };

  const indentStyle = getIndentation();

  return (
    <Box sx={{ width: '100%' }}>
      {isAI && contentType === 'educational' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
            AI Generated Educational Content
          </Typography>
          <Divider sx={{ mt: 0.5, mb: 1 }} />
        </Box>
      )}
      
      {/* Render the markdown content as HTML */}
      <Box
        sx={{
          ...indentStyle,
          my: contentType === 'simple' ? 0.5 : 1,
          lineHeight: 1.6,
          '& h1': {
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: 'primary.main',
            mt: contentType === 'simple' ? 2 : 3,
            mb: contentType === 'simple' ? 1.5 : 2,
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'primary.dark',
            mt: contentType === 'simple' ? 1.5 : 2,
            mb: contentType === 'simple' ? 1 : 1.5,
          },
          '& h3': {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            mt: contentType === 'simple' ? 1 : 1.5,
            mb: contentType === 'simple' ? 0.5 : 1,
          },
          '& p': {
            mb: contentType === 'simple' ? 1 : 1.5,
            fontSize: '1rem',
          },
          '& ul, & ol': {
            mt: 0.5,
            mb: contentType === 'simple' ? 0.5 : 1,
            pl: 2,
          },
          '& li': {
            mb: 0.5,
          },
          '& code': {
            bgcolor: 'grey.100',
            color: 'primary.main',
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          },
          '& pre': {
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          },
          '& blockquote': {
            borderLeft: 4,
            borderColor: 'primary.light',
            pl: 2,
            ml: 0,
            fontStyle: 'italic',
            color: 'text.secondary',
          },
          '& strong': {
            fontWeight: 'bold',
          },
          '& em': {
            fontStyle: 'italic',
          },
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
      {isAI && contentType === 'educational' && (
        <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Generated with AI • Review and adapt as needed for your classroom
          </Typography>
        </Box>
      )}
    </Box>
  );
} 