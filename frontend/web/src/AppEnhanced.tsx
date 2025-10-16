import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { Menu, Language } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Import new components
import LiveStats from './components/LiveStats';
import ActivityFeed from './components/ActivityFeed';
import InteractiveDemo from './components/InteractiveDemo';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import LimitedOffer from './components/LimitedOffer';
import AuthModals from './components/AuthModals';
import FinalStats from './components/FinalStats';

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

function AppEnhanced() {
  const { t, i18n } = useTranslation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const isRTL = i18n.language === 'he';
  const theme = React.useMemo(() => createAppTheme(isRTL ? 'rtl' : 'ltr'), [isRTL]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleLanguage = () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  React.useEffect(() => {
    // Set initial direction
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Navigation */}
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
              variant="h5"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {t('nav.jobMatch')} 💼
            </Typography>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
                <Button color="inherit" sx={{ fontWeight: 600 }}>
                  {t('nav.benefits')}
                </Button>
                <Button color="inherit" sx={{ fontWeight: 600 }}>
                  {t('nav.howItWorks')}
                </Button>
              </Box>
            )}

            <IconButton onClick={toggleLanguage} color="inherit">
              <Language />
            </IconButton>

            <Button
              variant="text"
              onClick={() => handleOpenAuth('login')}
              sx={{ fontWeight: 600, color: '#667eea' }}
            >
              {t('nav.login')}
            </Button>
            
            <Button
              variant="contained"
              onClick={() => handleOpenAuth('signup')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              {t('nav.signup')}
            </Button>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated background shapes */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1
            }}
          >
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0]
              }}
              transition={{ duration: 20, repeat: Infinity }}
              style={{
                position: 'absolute',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'white',
                top: '-200px',
                left: '-200px'
              }}
            />
            <motion.div
              animate={{
                x: [0, -100, 0],
                y: [0, -50, 0]
              }}
              transition={{ duration: 25, repeat: Infinity }}
              style={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'white',
                bottom: '-150px',
                right: '-150px'
              }}
            />
          </Box>

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h1"
                  gutterBottom
                  sx={{
                    color: 'white',
                    background: 'none',
                    WebkitTextFillColor: 'white',
                    fontSize: { xs: '2rem', md: '3.5rem' },
                    mb: 2
                  }}
                >
                  {t('hero.title')}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 3, opacity: 0.95, fontSize: { xs: '1.1rem', md: '1.5rem' } }}
                >
                  {t('hero.subtitle')}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ mb: 4, opacity: 0.9, maxWidth: 800, mx: 'auto', fontSize: { xs: '1rem', md: '1.25rem' } }}
                >
                  {t('hero.description')}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleOpenAuth('signup')}
                      sx={{
                        background: 'white',
                        color: '#667eea',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        px: 4,
                        py: 2,
                        '&:hover': {
                          background: 'rgba(255,255,255,0.95)'
                        }
                      }}
                    >
                      {t('hero.tryDemo')}
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 600,
                        px: 4,
                        py: 2,
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      {t('hero.imEmployer')}
                    </Button>
                  </motion.div>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[t('hero.features.free'), t('hero.features.noCommitment'), t('hero.features.results')].map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#4ade80'
                        }}
                      />
                      <Typography variant="body1" sx={{ opacity: 0.95 }}>
                        ✅ {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Live Statistics */}
        <LiveStats />

        {/* Benefits Section - Simple version */}
        <Box sx={{ py: 8, background: 'white' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              {t('benefits.title')}
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
              {t('benefits.subtitle')}
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 4 }}>
              {[
                { title: t('benefits.timeSaving.title'), description: t('benefits.timeSaving.description'), icon: '⚡' },
                { title: t('benefits.ai.title'), description: t('benefits.ai.description'), icon: '🤖' },
                { title: t('benefits.accurateMatching.title'), description: t('benefits.accurateMatching.description'), icon: '🎯' },
                { title: t('benefits.pleasant.title'), description: t('benefits.pleasant.description'), icon: '😊' }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.15)'
                      }
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 2 }}>{benefit.icon}</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Interactive Demo */}
        <InteractiveDemo />

        {/* How It Works */}
        <HowItWorks />

        {/* Limited Offer */}
        <LimitedOffer />

        {/* Testimonials */}
        <Testimonials />

        {/* Final Stats */}
        <FinalStats />

        {/* Final CTA */}
        <Box
          sx={{
            py: 8,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
            textAlign: 'center'
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              {t('cta.title')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              {t('cta.subtitle')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleOpenAuth('signup')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    px: 6,
                    py: 2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  {t('cta.startJobSearch')}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    fontWeight: 600,
                    px: 6,
                    py: 2,
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      background: 'rgba(102, 126, 234, 0.05)'
                    }
                  }}
                >
                  {t('cta.postJobs')}
                </Button>
              </motion.div>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            py: 4,
            background: '#1a1a1a',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('footer.tagline')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              {t('footer.description')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              {t('footer.copyright')}
            </Typography>
          </Container>
        </Box>

        {/* Activity Feed */}
        <ActivityFeed />

        {/* Auth Modals */}
        <AuthModals
          open={authModalOpen}
          mode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSwitchMode={setAuthMode}
        />
      </Box>
    </ThemeProvider>
  );
}

export default AppEnhanced;

