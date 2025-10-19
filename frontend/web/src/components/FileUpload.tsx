import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import userService from '../services/userService';

interface FileUploadProps {
  type: 'avatar' | 'resume';
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  maxSizeMB?: number;
}

interface FileUploadResponse {
  success: boolean;
  data?: { url: string };
  message?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  type, 
  currentUrl, 
  onUploadComplete,
  maxSizeMB = 5 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentUrl changes (e.g., after profile reload)
  React.useEffect(() => {
    console.log('FileUpload currentUrl changed:', currentUrl);
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`הקובץ גדול מדי. מקסימום ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (type === 'avatar') {
      if (!file.type.startsWith('image/')) {
        setError('יש להעלות קובץ תמונה בלבד');
        return;
      }
    } else if (type === 'resume') {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('יש להעלות קובץ PDF או Word בלבד');
        return;
      }
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview for images
      if (type === 'avatar') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload file to MinIO via backend
      let response: FileUploadResponse;
      
      if (type === 'avatar') {
        response = await userService.uploadAvatar(file);
      } else {
        response = await userService.uploadResume(file);
      }
      
      if (response.success && response.data?.url) {
        // Update preview with the MinIO URL
        console.log('Upload successful! MinIO URL:', response.data.url);
        setPreview(response.data.url);
        onUploadComplete(response.data.url);
        setUploading(false);
      } else {
        throw new Error(response.message || 'Upload failed');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'שגיאה בהעלאת הקובץ. נסה שנית.';
      setError(errorMessage);
      setUploading(false);
      setPreview(currentUrl || null); // Revert to original preview
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'avatar' ? 'image/*' : '.pdf,.doc,.docx'}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {type === 'avatar' ? (
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            {preview ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar
                  src={preview}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid',
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                />
              </motion.div>
            ) : (
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '3rem'
                }}
              >
                👤
              </Avatar>
            )}
            
            {preview && !uploading && (
              <CheckCircle
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  color: '#4ade80',
                  background: 'white',
                  borderRadius: '50%',
                  fontSize: 32
                }}
              />
            )}
          </Box>

          <Button
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            onClick={handleClick}
            disabled={uploading}
            sx={{ mb: 1 }}
          >
            {uploading ? 'מעלה...' : preview ? 'שנה תמונה' : 'העלה תמונה'}
          </Button>
          
          <Typography variant="caption" display="block" color="text.secondary">
            PNG, JPG עד {maxSizeMB}MB
          </Typography>
        </Box>
      ) : (
        <Box
          onClick={!uploading ? handleClick : undefined}
          sx={{
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'primary.main',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            transition: 'all 0.3s',
            '&:hover': uploading ? {} : {
              borderColor: 'primary.dark',
              background: 'rgba(102, 126, 234, 0.05)'
            }
          }}
        >
          {uploading ? (
            <Box>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1">מעלה קובץ...</Typography>
            </Box>
          ) : preview ? (
            <Box>
              <CheckCircle sx={{ fontSize: 40, color: '#4ade80', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#4ade80' }}>
                הקובץ הועלה בהצלחה! ✓
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                לחץ להחלפת הקובץ
              </Typography>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                לחץ להעלאת קורות חיים
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                PDF, DOC, DOCX עד {maxSizeMB}MB
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;

