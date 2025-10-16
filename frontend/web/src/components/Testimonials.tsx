import React from 'react';
import { Box, Typography, Container, Grid, Paper, Avatar, Rating } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FormatQuote } from '@mui/icons-material';

const Testimonials: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: t('testimonials.reviews.dani.name'),
      role: t('testimonials.reviews.dani.role'),
      text: t('testimonials.reviews.dani.text'),
      avatar: 'ד',
      rating: 5
    },
    {
      name: t('testimonials.reviews.michal.name'),
      role: t('testimonials.reviews.michal.role'),
      text: t('testimonials.reviews.michal.text'),
      avatar: 'מ',
      rating: 5
    },
    {
      name: t('testimonials.reviews.avi.name'),
      role: t('testimonials.reviews.avi.role'),
      text: t('testimonials.reviews.avi.text'),
      avatar: 'א',
      rating: 5
    }
  ];

  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)'
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          {t('testimonials.title')}
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          {t('testimonials.subtitle')}
        </Typography>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    position: 'relative',
                    transition: 'all 0.3s',
                    background: 'white',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.15)'
                    }
                  }}
                >
                  <FormatQuote
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontSize: 48,
                      color: 'rgba(102, 126, 234, 0.1)',
                      transform: 'rotate(180deg)'
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mr: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '1.5rem',
                        fontWeight: 600
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Rating
                    value={testimonial.rating}
                    readOnly
                    sx={{
                      mb: 2,
                      '& .MuiRating-iconFilled': {
                        color: '#fbbf24'
                      }
                    }}
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      lineHeight: 1.8,
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;

