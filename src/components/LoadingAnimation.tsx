'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Fade,
  Grow,
  Slide,
  alpha,
  keyframes,
} from '@mui/material';
import { Psychology, AutoAwesome, SmartToy } from '@mui/icons-material';

interface LoadingAnimationProps {
  type: 'thinking' | 'processing' | 'generating' | 'analyzing';
  message?: string;
  progress?: number;
  showSkeleton?: boolean;
}

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const rotateAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export default function LoadingAnimation({ 
  type, 
  message, 
  progress, 
  showSkeleton = false 
}: LoadingAnimationProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'thinking':
        return <Psychology sx={{ fontSize: 32, color: 'primary.main' }} />;
      case 'processing':
        return <SmartToy sx={{ fontSize: 32, color: 'secondary.main' }} />;
      case 'generating':
        return <AutoAwesome sx={{ fontSize: 32, color: 'tertiary.main' }} />;
      case 'analyzing':
        return <Psychology sx={{ fontSize: 32, color: 'info.main' }} />;
      default:
        return <SmartToy sx={{ fontSize: 32, color: 'primary.main' }} />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'thinking':
        return 'AI is thinking...';
      case 'processing':
        return 'Processing your request...';
      case 'generating':
        return 'Generating content...';
      case 'analyzing':
        return 'Analyzing requirements...';
      default:
        return 'Working...';
    }
  };

  const getThemeColor = () => {
    switch (type) {
      case 'thinking':
        return 'primary';
      case 'processing':
        return 'secondary';
      case 'generating':
        return 'tertiary';
      case 'analyzing':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          m: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: 1,
          borderColor: alpha('#1976d2', 0.12),
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha('#1976d2', 0.05)}, transparent)`,
            animation: `${shimmerAnimation} 2s infinite`,
          }
        }}
      >
        {/* Main Loading Content */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: showSkeleton ? 2 : 0 }}>
          {/* Animated Icon */}
          <Box 
            sx={{ 
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha('#1976d2', 0.1)} 0%, ${alpha('#1976d2', 0.2)} 100%)`,
            }}
          >
            {getIcon()}
          </Box>

          {/* Loading Text and Spinner */}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 500,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {message || getDefaultMessage()}
            </Typography>
            
            {/* Progress Bar */}
            {progress !== undefined ? (
              <Box sx={{ width: '100%' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha('#1976d2', 0.12),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: `linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)`,
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {Math.round(progress)}% complete
                </Typography>
              </Box>
            ) : (
              <LinearProgress 
                sx={{ 
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha('#1976d2', 0.12),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: `linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)`,
                  }
                }}
              />
            )}
          </Box>

          {/* Circular Progress */}
          <CircularProgress 
            size={24} 
            thickness={4}
            sx={{ 
              color: `${getThemeColor()}.main`,
              animation: `${rotateAnimation} 1s linear infinite`,
            }}
          />
        </Box>

        {/* Skeleton Loading for Content Preview */}
        {showSkeleton && (
          <Grow in={true} timeout={800}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Preview loading...
              </Typography>
              
              {/* Skeleton Layout */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Title Skeleton */}
                <Skeleton 
                  variant="text" 
                  width="60%" 
                  height={32}
                  sx={{ borderRadius: 2 }}
                />
                
                {/* Content Skeletons */}
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={80}
                  sx={{ borderRadius: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton 
                    variant="rectangular" 
                    width="48%" 
                    height={60}
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton 
                    variant="rectangular" 
                    width="48%" 
                    height={60}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
                
                {/* Button Skeletons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Skeleton 
                    variant="rounded" 
                    width={80} 
                    height={36}
                    sx={{ borderRadius: 20 }}
                  />
                  <Skeleton 
                    variant="rounded" 
                    width={80} 
                    height={36}
                    sx={{ borderRadius: 20 }}
                  />
                </Box>
              </Box>
            </Box>
          </Grow>
        )}

        {/* Floating Particles Effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: alpha('#1976d2', 0.3),
              animation: `${pulseAnimation} 3s ease-in-out infinite`,
            },
            '&::before': {
              top: '20%',
              left: '10%',
              animationDelay: '0s',
            },
            '&::after': {
              top: '70%',
              right: '15%',
              animationDelay: '1.5s',
            },
          }}
        />
      </Paper>
    </Fade>
  );
} 