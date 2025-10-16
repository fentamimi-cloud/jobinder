import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Close, Favorite, Celebration } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const InteractiveDemo: React.FC = () => {
  const { t } = useTranslation();
  const [showMatch, setShowMatch] = useState(false);
  const [cardSwipped, setCardSwipped] = useState(false);

  const handleLike = () => {
    setCardSwipped(true);
    setTimeout(() => {
      setShowMatch(true);
    }, 500);
  };

  const handleDislike = () => {
    setCardSwipped(true);
    setTimeout(() => {
      setCardSwipped(false);
    }, 500);
  };

  const resetDemo = () => {
    setShowMatch(false);
    setCardSwipped(false);
  };

  return (
    <Box sx={{ py: 8, background: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          {t('demo.title')}
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          {t('demo.subtitle')}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 500,
            position: 'relative'
          }}
        >
          <AnimatePresence mode="wait">
            {!showMatch && !cardSwipped && (
              <motion.div
                key="job-card"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0, rotate: cardSwipped ? 10 : -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  sx={{
                    width: { xs: 320, sm: 400 },
                    minHeight: 450,
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    overflow: 'visible'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                    }}
                  >
                    94% {t('demo.match')}
                  </Box>
                  
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      p: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          fontSize: '1.8rem',
                          background: 'rgba(255,255,255,0.2)'
                        }}
                      >
                        TC
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          TechCorp
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          ישראל
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      מפתח Full Stack Senior
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {['React', 'Node.js', 'TypeScript'].map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            color: '#667eea',
                            fontWeight: 600
                          }}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        📍 תל אביב
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        💰 20,000-30,000₪
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 3,
                        textAlign: 'center',
                        color: 'primary.main',
                        fontWeight: 600,
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      {t('demo.tryLike')}
                    </Typography>
                  </CardContent>
                </Card>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4,
                    mt: 4
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDislike}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(255, 107, 107, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Close sx={{ fontSize: 32 }} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(81, 207, 102, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Favorite sx={{ fontSize: 32 }} />
                  </motion.button>
                </Box>
              </motion.div>
            )}

            {showMatch && (
              <motion.div
                key="match-screen"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Card
                  sx={{
                    width: { xs: 320, sm: 400 },
                    minHeight: 450,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <Celebration sx={{ fontSize: 80, mb: 3 }} />
                  </motion.div>
                  
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                    🎉
                  </Typography>
                  
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    {t('demo.itsMatch')}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    {t('demo.alsoLiked', { company: 'TechCorp' })}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="large"
                    onClick={resetDemo}
                    sx={{
                      background: 'white',
                      color: '#667eea',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    {t('demo.startNow')}
                  </Button>
                  
                  <Button
                    variant="text"
                    onClick={resetDemo}
                    sx={{
                      mt: 2,
                      color: 'white',
                      textDecoration: 'underline'
                    }}
                  >
                    {t('demo.tryDemo')}
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Container>
    </Box>
  );
};

export default InteractiveDemo;

