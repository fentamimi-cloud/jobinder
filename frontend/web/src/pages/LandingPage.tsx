import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowForward, Language } from '@mui/icons-material';

// Import components
import LiveStats from '../components/LiveStats';
import ActivityFeed from '../components/ActivityFeed';
import InteractiveDemo from '../components/InteractiveDemo';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import LimitedOffer from '../components/LimitedOffer';
import AuthModals from '../components/AuthModals';
import FinalStats from '../components/FinalStats';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Navigation Bar */}
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
              color: 'white',
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
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    mb: 2,
                    lineHeight: 1.2
                  }}
                >
                  {t('hero.title')}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                    mb: 4,
                    opacity: 0.95,
                    lineHeight: 1.6
                  }}
                >
                  {t('hero.subtitle')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpenAuth('signup')}
                    sx={{
                      background: 'white',
                      color: '#667eea',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      '&:hover': {
                        background: '#f8f9fa',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    endIcon={<ArrowForward />}
                  >
                    {t('hero.cta')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => handleOpenAuth('login')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {t('hero.secondaryCta')}
                  </Button>
                </Box>
              </motion.div>
            </Grid>

            {/* Hero Animation */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h1" sx={{ fontSize: { xs: '5rem', md: '8rem' } }}>
                    💼
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Live Stats Section */}
      <LiveStats />

      {/* Activity Feed */}
      <ActivityFeed />

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 6
            }}
          >
            {t('benefits.title')}
          </Typography>
          <Grid container spacing={4}>
            {[
              { icon: '⚡', key: 'instant' },
              { icon: '🎯', key: 'smart' },
              { icon: '🔒', key: 'private' },
              { icon: '🚀', key: 'fast' }
            ].map((benefit, index) => (
              <Grid item xs={12} sm={6} key={benefit.key}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box
                    sx={{
                      p: { xs: 2.5, sm: 3, md: 4 },
                      background: 'white',
                      borderRadius: 4,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)'
                      }
                    }}
                  >
                    <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3rem' } }}>
                      {benefit.icon}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      {t(`benefits.${benefit.key}.title`)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {t(`benefits.${benefit.key}.desc`)}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3
            }}
          >
            {t('cta.title')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              mb: 4,
              opacity: 0.95
            }}
          >
            {t('cta.subtitle')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => handleOpenAuth('signup')}
            sx={{
              background: 'white',
              color: '#667eea',
              px: 5,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              '&:hover': {
                background: '#f8f9fa',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}
            endIcon={<ArrowForward />}
          >
            {t('cta.button')}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ background: '#1a1a1a', color: 'white', py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {t('footer.about.title')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {t('footer.about.desc')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {t('footer.links.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', opacity: 0.8 }}>
                  {t('footer.links.about')}
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', opacity: 0.8 }}>
                  {t('footer.links.privacy')}
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', opacity: 0.8 }}>
                  {t('footer.links.terms')}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {t('footer.contact.title')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {t('footer.contact.email')}
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              {t('footer.copyright')}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Auth Modals */}
      <AuthModals
        open={authModalOpen}
        mode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSwitchMode={setAuthMode}
      />
    </Box>
  );
};

export default LandingPage;

