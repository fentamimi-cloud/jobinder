import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  Alert,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  LinkedIn,
  Email,
  Lock,
  Person,
  Work,
  LocationOn
} from '@mui/icons-material';

interface AuthFormProps {
  type: 'login' | 'register';
  onToggle: () => void;
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onToggle, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'job_seeker' as 'job_seeker' | 'employer',
    location: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (type === 'register' && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (type === 'register' && !formData.agreeToTerms) {
        throw new Error('Please agree to the terms and conditions');
      }

      console.log(`${type} attempt:`, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || `${type} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login attempt`);
    // Simulate successful social login
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {type === 'login' ? 'Welcome Back!' : 'Join Jobinder'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {type === 'login' 
                ? 'Sign in to continue your job search' 
                : 'Create your account and find your dream job'
              }
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Social Login Buttons */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={() => handleSocialLogin('Google')}
              sx={{ mb: 1, textTransform: 'none' }}
            >
              Continue with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LinkedIn />}
              onClick={() => handleSocialLogin('LinkedIn')}
              sx={{ textTransform: 'none' }}
            >
              Continue with LinkedIn
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="or" size="small" />
          </Divider>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {type === 'register' && (
              <>
                {/* User Type Selection */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    I am a:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant={formData.userType === 'job_seeker' ? 'contained' : 'outlined'}
                        startIcon={<Person />}
                        onClick={() => setFormData(prev => ({ ...prev, userType: 'job_seeker' }))}
                      >
                        Job Seeker
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant={formData.userType === 'employer' ? 'contained' : 'outlined'}
                        startIcon={<Work />}
                        onClick={() => setFormData(prev => ({ ...prev, userType: 'employer' }))}
                      >
                        Employer
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Name Fields */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      required
                    />
                  </Grid>
                </Grid>

                {/* Location */}
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  placeholder="e.g., San Francisco, CA"
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </>
            )}

            {/* Email */}
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleInputChange('password')}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Confirm Password for Registration */}
            {type === 'register' && (
              <>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    )
                  }}
                />

                {/* Terms and Conditions */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        agreeToTerms: e.target.checked 
                      }))}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link href="#" underline="hover">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="#" underline="hover">Privacy Policy</Link>
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              {loading ? 'Please wait...' : (type === 'login' ? 'Sign In' : 'Create Account')}
            </Button>

            {/* Toggle Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                <Link
                  component="button"
                  type="button"
                  onClick={onToggle}
                  underline="hover"
                  sx={{ fontWeight: 600 }}
                >
                  {type === 'login' ? 'Sign up' : 'Sign in'}
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthForm;
