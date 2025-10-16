import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Activity {
  id: string;
  name: string;
  action: string;
  timeAgo: string;
  initial: string;
}

const activities: Activity[] = [
  { id: '1', name: 'דני', action: 'מתל אביב מצא משרה ב-TechCorp!', timeAgo: 'לפני דקה', initial: 'ד' },
  { id: '2', name: 'מיכל', action: 'קיבלה 3 התאמות חדשות', timeAgo: 'לפני 2 דקות', initial: 'מ' },
  { id: '3', name: 'אבי', action: 'קיבל הזמנה לראיון ב-CloudScale', timeAgo: 'לפני 5 דקות', initial: 'א' },
  { id: '4', name: 'שרה', action: 'מצאה משרה ב-Innovation Labs', timeAgo: 'לפני 10 דקות', initial: 'ש' },
];

const ActivityFeed: React.FC = () => {
  const { t } = useTranslation();
  const [currentActivities, setCurrentActivities] = useState<Activity[]>([activities[0], activities[1]]);
  const [activityIndex, setActivityIndex] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivities(prev => {
        const newActivity = activities[activityIndex % activities.length];
        const updated = [newActivity, ...prev.slice(0, 1)];
        return updated;
      });
      setActivityIndex(prev => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [activityIndex]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 320,
        maxHeight: 200,
        zIndex: 1000,
        display: { xs: 'none', md: 'block' }
      }}
    >
      <AnimatePresence>
        {currentActivities.map((activity, index) => (
          <motion.div
            key={activity.id + index}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 8 }}
          >
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}
            >
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: 40,
                  height: 40,
                  fontWeight: 600
                }}
              >
                {activity.initial}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activity.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.action}
                </Typography>
                <Typography variant="caption" color="primary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                  {activity.timeAgo}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#4ade80',
                  animation: 'pulse 2s infinite'
                }}
              />
            </Paper>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ActivityFeed;

