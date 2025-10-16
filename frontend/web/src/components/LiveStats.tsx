import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

const LiveStats: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    searching: 2847,
    matchesToday: 156,
    hires: 1247,
    avgDays: 12
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        searching: prev.searching + Math.floor(Math.random() * 3),
        matchesToday: prev.matchesToday + Math.floor(Math.random() * 2),
        hires: prev.hires,
        avgDays: prev.avgDays
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statItems: StatItem[] = [
    { label: t('stats.searchingNow'), value: stats.searching },
    { label: t('stats.matchesToday'), value: stats.matchesToday },
    { label: t('stats.successfulHires'), value: stats.hires },
    { label: t('stats.avgDays'), value: stats.avgDays }
  ];

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        py: 4,
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h6"
          align="center"
          sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}
        >
          {t('stats.activeNow')} 🔥
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3
          }}
        >
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'white',
                  borderRadius: 3,
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)'
                  }
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  <CountUp
                    end={item.value}
                    duration={2}
                    separator=","
                    suffix={item.suffix}
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default LiveStats;

