'use client';

import { Inter } from 'next/font/google';
import { IntlProvider } from 'react-intl';
import { CssBaseline, ThemeProvider, createTheme, alpha } from '@mui/material';
import { useAgentStore } from '@/store/agentStore';
import { messages } from '@/locales/messages';

const inter = Inter({ subsets: ['latin'] });

// Google Material Design 3 Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Material Blue
      light: '#42a5f5',
      dark: '#0d47a1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0', // Material Purple
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#00695c', // Material Teal
      light: '#4db6ac',
      dark: '#004d40',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa', // Material surface
      paper: '#ffffff',
    },
    surface: {
      main: '#ffffff',
    },
    onSurface: {
      main: '#1c1b1f',
    },
    outline: {
      main: '#79747e',
    },
    text: {
      primary: '#1c1b1f',
      secondary: '#49454f',
      disabled: alpha('#1c1b1f', 0.38),
    },
    divider: alpha('#1c1b1f', 0.12),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.4rem',
      fontWeight: 400,
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12, // Material 3 rounded corners
  },
  spacing: 8, // 8px grid system
  shadows: [
    'none',
    // Material 3 elevation shadows (0-24)
    '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
    '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
    '0px 1px 3px 0px rgba(0,0,0,0.3), 0px 4px 8px 3px rgba(0,0,0,0.15)',
    '0px 2px 3px 0px rgba(0,0,0,0.3), 0px 6px 10px 4px rgba(0,0,0,0.15)',
    '0px 4px 4px 0px rgba(0,0,0,0.3), 0px 8px 12px 6px rgba(0,0,0,0.15)',
    '0px 6px 10px 0px rgba(0,0,0,0.3), 0px 10px 14px 8px rgba(0,0,0,0.15)',
    '0px 8px 12px 0px rgba(0,0,0,0.3), 0px 12px 16px 10px rgba(0,0,0,0.15)',
    '0px 10px 14px 0px rgba(0,0,0,0.3), 0px 14px 18px 12px rgba(0,0,0,0.15)',
    '0px 12px 17px 0px rgba(0,0,0,0.3), 0px 16px 20px 14px rgba(0,0,0,0.15)',
    '0px 14px 19px 0px rgba(0,0,0,0.3), 0px 18px 22px 16px rgba(0,0,0,0.15)',
    '0px 16px 21px 0px rgba(0,0,0,0.3), 0px 20px 24px 18px rgba(0,0,0,0.15)',
    '0px 18px 23px 0px rgba(0,0,0,0.3), 0px 22px 26px 20px rgba(0,0,0,0.15)',
    '0px 20px 25px 0px rgba(0,0,0,0.3), 0px 24px 28px 22px rgba(0,0,0,0.15)',
    '0px 22px 27px 0px rgba(0,0,0,0.3), 0px 26px 30px 24px rgba(0,0,0,0.15)',
    '0px 24px 29px 0px rgba(0,0,0,0.3), 0px 28px 32px 26px rgba(0,0,0,0.15)',
    '0px 26px 31px 0px rgba(0,0,0,0.3), 0px 30px 34px 28px rgba(0,0,0,0.15)',
    '0px 28px 33px 0px rgba(0,0,0,0.3), 0px 32px 36px 30px rgba(0,0,0,0.15)',
    '0px 30px 35px 0px rgba(0,0,0,0.3), 0px 34px 38px 32px rgba(0,0,0,0.15)',
    '0px 32px 37px 0px rgba(0,0,0,0.3), 0px 36px 40px 34px rgba(0,0,0,0.15)',
    '0px 34px 39px 0px rgba(0,0,0,0.3), 0px 38px 42px 36px rgba(0,0,0,0.15)',
    '0px 36px 41px 0px rgba(0,0,0,0.3), 0px 40px 44px 38px rgba(0,0,0,0.15)',
    '0px 38px 43px 0px rgba(0,0,0,0.3), 0px 42px 46px 40px rgba(0,0,0,0.15)',
    '0px 40px 45px 0px rgba(0,0,0,0.3), 0px 44px 48px 42px rgba(0,0,0,0.15)',
    '0px 42px 47px 0px rgba(0,0,0,0.3), 0px 46px 50px 44px rgba(0,0,0,0.15)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fafafa',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          backgroundImage: 'none',
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // Material 3 pills
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          backgroundColor: '#1976d2',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1565c0',
            boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
          },
          '&:active': {
            boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.3), 0px 4px 8px 3px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderColor: '#79747e',
          color: '#1976d2',
          '&:hover': {
            backgroundColor: alpha('#1976d2', 0.04),
            borderColor: '#1976d2',
          },
        },
        text: {
          color: '#1976d2',
          '&:hover': {
            backgroundColor: alpha('#1976d2', 0.04),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
        },
        elevation2: {
          boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
        },
        elevation3: {
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.3), 0px 4px 8px 3px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: alpha('#1976d2', 0.12),
          color: '#1976d2',
          '&:hover': {
            backgroundColor: alpha('#1976d2', 0.16),
          },
        },
        outlined: {
          borderColor: '#79747e',
          '&:hover': {
            backgroundColor: alpha('#1976d2', 0.04),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: alpha('#1976d2', 0.12),
        },
        bar: {
          borderRadius: 4,
          backgroundColor: '#1976d2',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#1976d2',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#1976d2', 0.11),
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: `1px solid ${alpha('#1c1b1f', 0.12)}`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          '&:hover': {
            backgroundColor: alpha('#1976d2', 0.04),
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 6px 10px 0px rgba(0,0,0,0.3), 0px 10px 14px 8px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Extend the theme to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    surface: Palette['primary'];
    onSurface: Palette['primary'];
    outline: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    surface?: PaletteOptions['primary'];
    onSurface?: PaletteOptions['primary'];
    outline?: PaletteOptions['primary'];
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useAgentStore();

  return (
    <html lang={locale}>
      <body className={inter.className} style={{ 
        backgroundColor: '#fafafa',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      }}>
        <IntlProvider messages={messages[locale]} locale={locale}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </IntlProvider>
      </body>
    </html>
  );
} 