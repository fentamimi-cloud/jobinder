import React from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { Language, Logout } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// Import pages
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';

// Import components
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import i18n
import './i18n/config';

// Create theme with RTL support
const createAppTheme = (direction: 'ltr' | 'rtl') => createTheme({
  direction,
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#764ba2',
      dark: '#5a6fd8'
    },
    secondary: {
      main: '#f093fb',
      light: '#f5576c',
      dark: '#4facfe'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: direction === 'rtl' 
      ? '"Heebo", "Rubik", "Assistant", "Inter", "Roboto", "Helvetica", "Arial", sans-serif'
      : '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
        }
      }
    }
  }
});

// Navigation component
const Navigation: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = i18n.language === 'he';
  const theme = React.useMemo(() => createAppTheme(isRTL ? 'rtl' : 'ltr'), [isRTL]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleLanguage = () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Don't show navigation on landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
        color: '#1a1a1a'
      }}
    >
      <Toolbar>
        <Typography
          component={Link}
          to="/"
          variant="h5"
          sx={{
            flexGrow: 1,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}
        >
          {t('nav.jobMatch')} 💼
        </Typography>

        {!isMobile && currentUser && (
          <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
            <Button 
              color="inherit" 
              sx={{ fontWeight: 600 }}
              component={Link}
              to="/dashboard"
            >
              הפרופיל שלי
            </Button>
          </Box>
        )}

        <IconButton onClick={toggleLanguage} color="inherit">
          <Language />
        </IconButton>

        {currentUser && (
          <IconButton onClick={handleLogout} color="inherit" title="Logout">
            <Logout />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

// App content wrapper
const AppContent: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const theme = React.useMemo(() => createAppTheme(isRTL ? 'rtl' : 'ltr'), [isRTL]);

  React.useEffect(() => {
    // Set initial direction
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

// Main App component
function AppEnhanced() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default AppEnhanced;
