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
  IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface AuthModalsProps {
  open: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthModals: React.FC<AuthModalsProps> = ({ open, mode, onClose, onSwitchMode }) => {
  const { t } = useTranslation();
  const [userType, setUserType] = useState<'jobseeker' | 'employer'>('jobseeker');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { mode, userType, formData });
    // Handle authentication logic here
    onClose();
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
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
                />

                <TextField
                  fullWidth
                  label={t('auth.login.password')}
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  sx={{ mb: 2.5 }}
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  {mode === 'login' ? t('auth.login.submit') : t('auth.signup.submit')}
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

