import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  IconButton,
  Button,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  AttachMoney,
  Favorite,
  FavoriteBorder,
  Share,
  BookmarkBorder,
  Verified
} from '@mui/icons-material';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
    skills: string[];
    companyLogo: string;
    isRemote: boolean;
    postedDate: string;
    applicants: number;
    matchPercentage?: number;
    verified?: boolean;
  };
  onLike?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
  variant?: 'swipe' | 'list' | 'minimal';
  liked?: boolean;
  saved?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onLike,
  onSave,
  onShare,
  variant = 'list',
  liked = false,
  saved = false
}) => {
  const handleLike = () => onLike?.(job.id);
  const handleSave = () => onSave?.(job.id);
  const handleShare = () => onShare?.(job.id);

  const getCardHeight = () => {
    switch (variant) {
      case 'swipe': return 600;
      case 'minimal': return 200;
      default: return 'auto';
    }
  };

  return (
    <Card
      sx={{
        height: getCardHeight(),
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: variant === 'swipe' ? 'scale(1.02)' : 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
        },
        position: 'relative',
        overflow: 'hidden'
      }}
      className="job-card"
    >
      {/* Header with Company Info */}
      <Box
        sx={{
          background: job.matchPercentage 
            ? `linear-gradient(135deg, rgba(102, 126, 234, ${job.matchPercentage / 100}) 0%, rgba(118, 75, 162, ${job.matchPercentage / 100}) 100%)`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: variant === 'minimal' ? 2 : 3,
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                mr: 2,
                fontSize: variant === 'minimal' ? '1.2rem' : '2rem',
                width: variant === 'minimal' ? 40 : 56,
                height: variant === 'minimal' ? 40 : 56
              }}
            >
              {job.companyLogo}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant={variant === 'minimal' ? 'body1' : 'h6'} sx={{ fontWeight: 600 }}>
                  {job.company}
                </Typography>
                {job.verified && <Verified sx={{ fontSize: 20, color: '#4CAF50' }} />}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {job.location}
                  </Typography>
                </Box>
                {job.isRemote && (
                  <Chip
                    label="Remote"
                    size="small"
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '0.7rem'
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleLike}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              {liked ? <Favorite sx={{ color: '#ff4444' }} /> : <FavoriteBorder />}
            </IconButton>
            <IconButton
              size="small"
              onClick={handleSave}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              <BookmarkBorder />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleShare}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Share />
            </IconButton>
          </Box>
        </Box>

        {/* Match Percentage */}
        {job.matchPercentage && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Match Score
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {job.matchPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={job.matchPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)',
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: variant === 'minimal' ? 2 : 3 }}>
        <Typography 
          variant={variant === 'minimal' ? 'h6' : 'h5'} 
          gutterBottom 
          sx={{ fontWeight: 600 }}
        >
          {job.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoney sx={{ fontSize: 18, color: 'success.main', mr: 0.5 }} />
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
              {job.salary}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {job.postedDate}
            </Typography>
          </Box>
        </Box>

        {variant !== 'minimal' && (
          <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {job.description}
            </Typography>

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Required Skills:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {job.skills.slice(0, variant === 'swipe' ? 8 : 4).map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              ))}
              {job.skills.length > (variant === 'swipe' ? 8 : 4) && (
                <Chip 
                  label={`+${job.skills.length - (variant === 'swipe' ? 8 : 4)} more`} 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>
          </>
        )}

        {/* Footer */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {job.applicants} applicants
          </Typography>
          <Button
            variant="contained"
            size={variant === 'minimal' ? 'small' : 'medium'}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {variant === 'swipe' ? 'Swipe Right to Apply' : 'View Details'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard;
