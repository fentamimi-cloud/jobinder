import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, Rocket, ChatBubble } from '@mui/icons-material';

const LimitedOffer: React.FC = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 12
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset the timer
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const benefits = [
    {
      icon: <Star sx={{ fontSize: 40 }} />,
      title: t('limitedOffer.highlighted.title'),
      description: t('limitedOffer.highlighted.description'),
      color: '#fbbf24'
    },
    {
      icon: <Rocket sx={{ fontSize: 40 }} />,
      title: t('limitedOffer.earlyAccess.title'),
      description: t('limitedOffer.earlyAccess.description'),
      color: '#667eea'
    },
    {
      icon: <ChatBubble sx={{ fontSize: 40 }} />,
      title: t('limitedOffer.consultation.title'),
      description: t('limitedOffer.consultation.description'),
      color: '#f093fb'
    }
  ];

  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, white 0%, transparent 50%)'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Chip
              label={`🔥 ${t('limitedOffer.badge')}`}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '20px 10px',
                mb: 3,
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            />
          </motion.div>

          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            {t('limitedOffer.title')}
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  <Box sx={{ color: benefit.color, mb: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, color: '#1a1a1a' }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {t('limitedOffer.limitedSpots')}
          </Typography>

          {/* Countdown Timer */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              mb: 4
            }}
          >
            {[
              { value: timeLeft.hours, label: 'שעות' },
              { value: timeLeft.minutes, label: 'דקות' },
              { value: timeLeft.seconds, label: 'שניות' }
            ].map((item, index) => (
              <React.Fragment key={item.label}>
                <Paper
                  sx={{
                    p: 2,
                    minWidth: 80,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 2
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Paper>
                {index < 2 && (
                  <Typography variant="h3" sx={{ lineHeight: '80px' }}>
                    :
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Box>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'white',
                color: '#667eea',
                fontWeight: 700,
                fontSize: '1.1rem',
                px: 6,
                py: 2,
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
                }
              }}
            >
              🎯 {t('limitedOffer.wantBenefits')}
            </Button>
          </motion.div>

          <Typography
            variant="body2"
            sx={{ mt: 3, opacity: 0.9 }}
          >
            {t('limitedOffer.registered', { count: 2847 })}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LimitedOffer;

