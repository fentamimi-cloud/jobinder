import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Button,
  Alert
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { motion } from 'framer-motion';
import userService from '../services/userService';

interface SettingsPanelProps {
  currentSettings?: {
    privacy?: any;
    notifications?: any;
  };
  onUpdate: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ currentSettings, onUpdate }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: currentSettings?.privacy?.profileVisibility || 'public',
    showLocation: currentSettings?.privacy?.showLocation !== false,
    showContact: currentSettings?.privacy?.showContact !== false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: currentSettings?.notifications?.email !== false,
    push: currentSettings?.notifications?.push !== false,
    sms: currentSettings?.notifications?.sms || false,
    matches: currentSettings?.notifications?.matches !== false,
    messages: currentSettings?.notifications?.messages !== false,
    meetings: currentSettings?.notifications?.meetings !== false,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePrivacyChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      await userService.updateProfile({
        privacy: privacySettings,
        notificationSettings
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onUpdate();
      }, 2000);

    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ההגדרות נשמרו בהצלחה!
        </Alert>
      )}

      {/* Privacy Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              הגדרות פרטיות
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.showLocation}
                    onChange={handlePrivacyChange('showLocation')}
                  />
                }
                label="הצג מיקום בפרופיל"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.showContact}
                    onChange={handlePrivacyChange('showContact')}
                  />
                }
                label="הצג פרטי קשר"
              />
            </FormGroup>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              הודעות והתראות
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email}
                    onChange={handleNotificationChange('email')}
                  />
                }
                label="הודעות במייל"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.push}
                    onChange={handleNotificationChange('push')}
                  />
                }
                label="התראות בדפדפן"
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                סוגי התראות:
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.matches}
                    onChange={handleNotificationChange('matches')}
                  />
                }
                label="התאמות חדשות"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.messages}
                    onChange={handleNotificationChange('messages')}
                  />
                }
                label="הודעות חדשות"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.meetings}
                    onChange={handleNotificationChange('meetings')}
                  />
                }
                label="פגישות ראיונות"
              />
            </FormGroup>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        startIcon={<Save />}
        onClick={handleSave}
        disabled={saving}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontWeight: 600,
          py: 1.5,
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
          }
        }}
      >
        {saving ? 'שומר...' : 'שמור הגדרות'}
      </Button>
    </Box>
  );
};

export default SettingsPanel;

