import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CountUp from 'react-countup';

const FinalStats: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: 3.2, suffix: 'x', label: t('finalStats.moreMatches') },
    { value: 67, suffix: '%', label: t('finalStats.lessTime') },
    { value: 89, suffix: '%', label: t('finalStats.satisfaction') }
  ];

  return (
    <Box sx={{ py: 8, background: 'white' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 6 }}
        >
          {t('finalStats.title')}
        </Typography>

        <Grid container spacing={6}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    border: '2px solid',
                    borderColor: 'rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderColor: '#667eea',
                      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.2)'
                    }
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '4rem',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    <CountUp
                      end={stat.value}
                      decimals={stat.value % 1 !== 0 ? 1 : 0}
                      duration={2.5}
                      suffix={stat.suffix}
                    />
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FinalStats;

