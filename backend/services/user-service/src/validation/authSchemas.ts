import Joi from 'joi';

export const signUpSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string().min(8).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string().min(2).max(50).required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must not exceed 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string().min(2).max(50).required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must not exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  
  userType: Joi.string().valid('job_seeker', 'employer').required()
    .messages({
      'any.only': 'User type must be either job_seeker or employer',
      'any.required': 'User type is required'
    }),
  
  location: Joi.object({
    city: Joi.string().required().messages({
      'any.required': 'City is required'
    }),
    state: Joi.string().required().messages({
      'any.required': 'State/Region is required'
    }),
    country: Joi.string().required().messages({
      'any.required': 'Country is required'
    }),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90),
      lng: Joi.number().min(-180).max(180)
    }).optional()
  }).required(),
  
  agreeToTerms: Joi.boolean().valid(true).required()
    .messages({
      'any.only': 'You must agree to the terms and conditions',
      'any.required': 'Terms agreement is required'
    }),
  
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
});

export const loginSchema = Joi.object({
  // Login is handled by Firebase client SDK
  // This is just for additional validation if needed
  email: Joi.string().email().optional(),
});

export const verifyEmailSchema = Joi.object({
  oobCode: Joi.string().required()
    .messages({
      'any.required': 'Verification code is required'
    })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

export const resetPasswordSchema = Joi.object({
  oobCode: Joi.string().required()
    .messages({
      'any.required': 'Reset code is required'
    }),
  
  newPassword: Joi.string().min(8).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required'
    })
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

