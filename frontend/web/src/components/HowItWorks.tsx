import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AccountCircle,
  Recommend,
  SwipeRight,
  Chat
} from '@mui/icons-material';

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      icon: <AccountCircle sx={{ fontSize: 48 }} />,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      color: '#667eea'
    },
    {
      number: 2,
      icon: <Recommend sx={{ fontSize: 48 }} />,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      color: '#764ba2'
    },
    {
      number: 3,
      icon: <SwipeRight sx={{ fontSize: 48 }} />,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      color: '#f093fb'
    },
    {
      number: 4,
      icon: <Chat sx={{ fontSize: 48 }} />,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      color: '#4facfe'
    }
  ];

  return (
    <Box sx={{ py: 8, background: 'white' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          {t('howItWorks.title')}
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          {t('howItWorks.subtitle')}
        </Typography>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={step.number}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    position: 'relative',
                    border: '2px solid',
                    borderColor: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: 4,
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: step.color,
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${step.color}20`
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: step.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      boxShadow: `0 4px 12px ${step.color}40`
                    }}
                  >
                    {step.number}
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      mb: 2,
                      color: step.color,
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    {step.icon}
                  </Box>

                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {step.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Connection Lines */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'relative',
            mt: -25,
            mb: 8,
            height: 0
          }}
        >
          <svg
            width="100%"
            height="100"
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4facfe" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M 150 50 Q 300 30, 450 50 T 750 50 T 1050 50"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
            />
          </svg>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;

