import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  IconButton,
  Divider
} from '@mui/material';
import {
  Edit,
  WorkOutline,
  LocationOn,
  Email,
  Phone,
  Settings,
  Logout,
  CloudUpload
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import userService from '../services/userService';
import authService from '../services/authService';
import FileUpload from '../components/FileUpload';
import OnboardingWizard from '../components/OnboardingWizard';

const UserDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        console.log('Profile loaded:', response.data);
        console.log('Profile picture URL:', response.data.profilePictureUrl);
        setProfile(response.data);
        
        // Show onboarding if not completed
        if (!response.data.onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    try {
      const updateData: any = {};
      
      if (profile.userType === 'job_seeker') {
        updateData.jobSeekerProfile = {
          title: data.title,
          bio: data.bio,
          skills: data.skills,
          experienceLevel: data.experienceLevel,
          experienceYears: parseInt(data.experienceYears) || 0
        };
      } else if (profile.userType === 'employer') {
        updateData.employerProfile = {
          companyName: data.companyName,
          industry: data.industry,
          companySize: data.companySize,
          description: data.description
        };
      }

      await userService.completeOnboarding(updateData);
      setShowOnboarding(false);
      loadProfile();
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      // The FileUpload component already uploaded the file and got the URL
      // We just need to reload the profile to see the updated picture
      await loadProfile();
    } catch (error) {
      console.error('Avatar upload failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Failed to load profile</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            הפרופיל שלי
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => {}} color="primary">
              <Settings />
            </IconButton>
            <IconButton onClick={handleLogout} color="error">
              <Logout />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <FileUpload
                  type="avatar"
                  currentUrl={profile.profilePictureUrl}
                  onUploadComplete={handleAvatarUpload}
                />

                <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                  {profile.firstName} {profile.lastName}
                </Typography>
                
                {profile.userType === 'job_seeker' && profile.jobSeekerProfile?.title && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {profile.jobSeekerProfile.title}
                  </Typography>
                )}

                {profile.userType === 'employer' && profile.employerProfile?.companyName && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {profile.employerProfile.companyName}
                  </Typography>
                )}

                {/* Profile Completion */}
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      השלמת פרופיל
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {profile.profileCompletionPercentage || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={profile.profileCompletionPercentage || 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: 'rgba(102, 126, 234, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Info */}
                <Box sx={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">{profile.email}</Typography>
                  </Box>
                  
                  {profile.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">{profile.phone}</Typography>
                    </Box>
                  )}
                  
                  {profile.location?.city && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {profile.location.city}, {profile.location.country}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setShowOnboarding(true)}
                  sx={{ mt: 3 }}
                >
                  ערוך פרופיל
                </Button>
              </Card>
            </motion.div>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Job Seeker Profile */}
              {profile.userType === 'job_seeker' && (
                <>
                  {/* Bio */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        אודות
                      </Typography>
                      {profile.jobSeekerProfile?.bio ? (
                        <Typography variant="body1" color="text.secondary">
                          {profile.jobSeekerProfile.bio}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          לא הוסף תיאור עדיין
                        </Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        כישורים
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {profile.jobSeekerProfile?.skills?.length > 0 ? (
                          profile.jobSeekerProfile.skills.map((skill: string) => (
                            <Chip
                              key={skill}
                              label={skill}
                              color="primary"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            לא הוספו כישורים עדיין
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Experience */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        ניסיון מקצועי
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {profile.jobSeekerProfile?.experienceLevel && (
                          <Chip
                            icon={<WorkOutline />}
                            label={`רמה: ${profile.jobSeekerProfile.experienceLevel}`}
                            color="secondary"
                          />
                        )}
                        {profile.jobSeekerProfile?.experienceYears && (
                          <Chip
                            label={`${profile.jobSeekerProfile.experienceYears} שנות ניסיון`}
                            color="secondary"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Employer Profile */}
              {profile.userType === 'employer' && (
                <>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        פרטי החברה
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>שם החברה:</strong> {profile.employerProfile?.companyName || 'לא צוין'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>תעשייה:</strong> {profile.employerProfile?.industry || 'לא צוין'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>גודל:</strong> {profile.employerProfile?.companySize || 'לא צוין'}
                      </Typography>
                    </CardContent>
                  </Card>

                  {profile.employerProfile?.description && (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          תיאור החברה
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {profile.employerProfile.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          open={showOnboarding}
          userType={profile.userType}
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
          initialData={
            profile.userType === 'job_seeker' 
              ? profile.jobSeekerProfile 
              : profile.employerProfile
          }
        />
      )}
    </Box>
  );
};

export default UserDashboard;

