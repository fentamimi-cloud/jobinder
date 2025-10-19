import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Chip,
  IconButton,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { Close, CloudUpload } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface OnboardingWizardProps {
  open: boolean;
  userType: 'job_seeker' | 'employer';
  onComplete: (data: any) => void;
  onSkip: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ open, userType, onComplete, onSkip }) => {
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Job Seeker fields
    title: '',
    bio: '',
    skills: [] as string[],
    experienceLevel: '',
    experienceYears: '',
    
    // Employer fields
    companyName: '',
    industry: '',
    companySize: '',
    description: '',
    
    // Common
    location: {
      city: '',
      state: '',
      country: ''
    }
  });
  const [currentSkill, setCurrentSkill] = useState('');

  const steps = userType === 'job_seeker' 
    ? ['פרטים אישיים', 'ניסיון מקצועי', 'כישורים', 'העדפות']
    : ['פרטי חברה', 'תיאור', 'העדפות גיוס'];

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value as string }));
  };

  const getProgress = () => ((activeStep + 1) / steps.length) * 100;

  const renderJobSeekerStep = () => {
    switch (activeStep) {
      case 0: // Personal details
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              ספר לנו קצת על עצמך
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              מה התפקיד שאתה מחפש?
            </Typography>
            
            <TextField
              fullWidth
              label="תפקיד מבוקש"
              value={formData.title}
              onChange={handleChange('title')}
              placeholder="לדוגמה: מפתח Full Stack Senior"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="קצת עלייך"
              value={formData.bio}
              onChange={handleChange('bio')}
              placeholder="ספר על הניסיון, הכישורים והיעדים המקצועיים שלך"
              sx={{ mb: 2 }}
            />
          </Box>
        );
      
      case 1: // Experience
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              ניסיון מקצועי
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>רמת ניסיון</InputLabel>
              <Select
                value={formData.experienceLevel}
                onChange={handleChange('experienceLevel')}
                label="רמת ניסיון"
              >
                <MenuItem value="entry">מתחיל</MenuItem>
                <MenuItem value="mid">בינוני</MenuItem>
                <MenuItem value="senior">בכיר</MenuItem>
                <MenuItem value="executive">ניהולי</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              type="number"
              label="שנות ניסיון"
              value={formData.experienceYears}
              onChange={handleChange('experienceYears')}
              placeholder="0"
              sx={{ mb: 2 }}
            />
          </Box>
        );
      
      case 2: // Skills
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              הכישורים שלך
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              הוסף כישורים שיעזרו למעסיקים למצוא אותך
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="הוסף כישור"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="לדוגמה: React, Node.js, Python"
              />
              <Button variant="contained" onClick={handleAddSkill}>
                הוסף
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {formData.skills.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  עדיין לא הוספת כישורים
                </Typography>
              )}
            </Box>
          </Box>
        );
      
      case 3: // Preferences
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              כמעט סיימנו!
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              הפרופיל שלך מוכן! תוכל לערוך אותו בכל עת מההגדרות
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              סיכום הפרופיל:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">• תפקיד: {formData.title || 'לא צוין'}</Typography>
              <Typography variant="body2">• ניסיון: {formData.experienceLevel || 'לא צוין'}</Typography>
              <Typography variant="body2">• כישורים: {formData.skills.length} כישורים</Typography>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  const renderEmployerStep = () => {
    switch (activeStep) {
      case 0: // Company details
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              פרטי החברה
            </Typography>
            
            <TextField
              fullWidth
              label="שם החברה"
              value={formData.companyName}
              onChange={handleChange('companyName')}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>תעשייה</InputLabel>
              <Select
                value={formData.industry}
                onChange={handleChange('industry')}
                label="תעשייה"
              >
                <MenuItem value="Technology">טכנולוגיה</MenuItem>
                <MenuItem value="Finance">פיננסים</MenuItem>
                <MenuItem value="Healthcare">בריאות</MenuItem>
                <MenuItem value="Education">חינוך</MenuItem>
                <MenuItem value="Retail">קמעונאות</MenuItem>
                <MenuItem value="Other">אחר</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>גודל החברה</InputLabel>
              <Select
                value={formData.companySize}
                onChange={handleChange('companySize')}
                label="גודל החברה"
              >
                <MenuItem value="1-10">1-10 עובדים</MenuItem>
                <MenuItem value="11-50">11-50 עובדים</MenuItem>
                <MenuItem value="51-200">51-200 עובדים</MenuItem>
                <MenuItem value="201-500">201-500 עובדים</MenuItem>
                <MenuItem value="500+">500+ עובדים</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      
      case 1: // Description
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              תיאור החברה
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={6}
              label="ספר על החברה"
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="מה החברה שלך עושה? מה התרבות הארגונית? מה הייחודיות?"
              sx={{ mb: 2 }}
            />
          </Box>
        );
      
      case 2: // Summary
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              הפרופיל מוכן!
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              פרופיל החברה נוצר בהצלחה. תוכל להתחיל לפרסם משרות!
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              סיכום:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">• חברה: {formData.companyName || 'לא צוין'}</Typography>
              <Typography variant="body2">• תעשייה: {formData.industry || 'לא צוין'}</Typography>
              <Typography variant="body2">• גודל: {formData.companySize || 'לא צוין'}</Typography>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 4 },
          m: { xs: 1, sm: 2 },
          maxHeight: 'calc(100vh - 32px)'
        }
      }}
    >
      <IconButton
        onClick={onSkip}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1
        }}
      >
        <Close />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            בואו נשלים את הפרופיל 🎯
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            זה יעזור לנו למצוא עבורך את ההתאמות הכי טובות
          </Typography>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={getProgress()}
            sx={{
              mb: 3,
              height: 8,
              borderRadius: 4,
              background: 'rgba(102, 126, 234, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 4
              }
            }}
          />

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ minHeight: 300 }}>
                {userType === 'job_seeker' ? renderJobSeekerStep() : renderEmployerStep()}
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
            >
              חזור
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                onClick={onSkip}
                sx={{ color: 'text.secondary' }}
              >
                דלג לעכשיו
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleComplete}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  סיום ✨
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600
                  }}
                >
                  המשך
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;

