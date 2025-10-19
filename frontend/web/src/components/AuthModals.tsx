import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

interface AuthModalsProps {
  open: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthModals: React.FC<AuthModalsProps> = ({ open, mode, onClose, onSwitchMode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'jobseeker' | 'employer'>('jobseeker');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        // Sign up
        const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
        const lastName = lastNameParts.join(' ') || firstName;

        const result = await authService.signUp({
          email: formData.email,
          password: formData.password,
          firstName: firstName,
          lastName: lastName,
          userType: userType === 'jobseeker' ? 'job_seeker' : 'employer',
          location: {
            city: 'Tel Aviv',  // TODO: Get from user input
            state: 'Tel Aviv',
            country: 'Israel',
          },
          agreeToTerms: true,
        });

        if (result.success) {
          setSuccess(result.message);
          setTimeout(() => {
            onClose();
            // Redirect to dashboard for onboarding
            navigate('/dashboard');
          }, 2000);
        } else {
          setError(result.message);
        }

      } else {
        // Login
        const result = await authService.login(formData.email, formData.password);

        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            onClose();
            // Redirect to dashboard
            navigate('/dashboard');
          }, 1500);
        } else {
          setError(result.message);
        }
      }

    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError(null); // Clear error when user types
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 4 },
          m: { xs: 1, sm: 2 },
          maxHeight: 'calc(100vh - 32px)',
          maxWidth: { xs: 'calc(100vw - 16px)', sm: 600 },
          position: 'relative',
          left: 0,
          right: 0
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center'
        },
        '& .MuiBackdrop-root': {
          left: 0,
          right: 0
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          insetInlineEnd: 8,
          top: 8,
          zIndex: 1
        }}
      >
        <Close />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 } }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {mode === 'login' ? t('auth.login.title') : t('auth.signup.title')}
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 2.5, sm: 3 },
                  fontSize: { xs: '0.9rem', sm: '0.95rem' }
                }}
              >
                {mode === 'login' ? t('auth.login.subtitle') : t('auth.signup.subtitle')}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <>
                    <Typography 
                      variant="body2" 
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      {t('auth.signup.userType')}
                    </Typography>
                    <ToggleButtonGroup
                      value={userType}
                      exclusive
                      onChange={(_, value) => value && setUserType(value)}
                      fullWidth
                      sx={{ mb: { xs: 2, sm: 2.5 } }}
                    >
                      <ToggleButton
                        value="jobseeker"
                        sx={{
                          py: 1.5,
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                            }
                          }
                        }}
                      >
                        {t('auth.signup.jobSeeker')}
                      </ToggleButton>
                      <ToggleButton
                        value="employer"
                        sx={{
                          py: 1.5,
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                            }
                          }
                        }}
                      >
                        {t('auth.signup.employer')}
                      </ToggleButton>
                    </ToggleButtonGroup>

                    <TextField
                      fullWidth
                      label={t('auth.signup.fullName')}
                      value={formData.fullName}
                      onChange={handleChange('fullName')}
                      sx={{ mb: 2 }}
                      required
                      disabled={loading}
                      placeholder="שם מלא"
                    />
                  </>
                )}

                <TextField
                  fullWidth
                  label={t('auth.login.email')}
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  sx={{ mb: 2 }}
                  required
                  disabled={loading}
                  placeholder="example@email.com"
                />

                <TextField
                  fullWidth
                  label={t('auth.login.password')}
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  sx={{ mb: 2.5 }}
                  required
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    mode === 'login' ? t('auth.login.submit') : t('auth.signup.submit')
                  )}
                </Button>
              </form>

              <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {mode === 'login' ? t('auth.login.noAccount') : t('auth.signup.haveAccount')}{' '}
                  <Button
                    variant="text"
                    onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#667eea',
                      p: 0
                    }}
                  >
                    {mode === 'login' ? t('auth.login.signupHere') : t('auth.signup.loginHere')}
                  </Button>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModals;

