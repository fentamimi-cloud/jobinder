import Joi from 'joi';

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  userType: Joi.string().valid('job_seeker', 'employer').required(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    }).optional()
  }).required(),
  agreeToTerms: Joi.boolean().valid(true).required()
});

export const updateUserProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    }).optional()
  }).optional(),
  jobSeekerProfile: Joi.object({
    title: Joi.string().optional(),
    bio: Joi.string().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    experience: Joi.object({
      level: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional(),
      years: Joi.number().min(0).optional()
    }).optional(),
    education: Joi.array().items(Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      year: Joi.number().required(),
      gpa: Joi.number().optional(),
      field: Joi.string().optional()
    })).optional(),
    preferences: Joi.object({
      jobTypes: Joi.array().items(Joi.string()).optional(),
      industries: Joi.array().items(Joi.string()).optional(),
      salaryRange: Joi.object({
        min: Joi.number().min(0).required(),
        max: Joi.number().min(Joi.ref('min')).required(),
        currency: Joi.string().default('USD')
      }).optional(),
      remoteWork: Joi.boolean().optional(),
      relocate: Joi.boolean().optional()
    }).optional()
  }).optional(),
  employerProfile: Joi.object({
    companyName: Joi.string().optional(),
    companySize: Joi.string().optional(),
    industry: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    description: Joi.string().optional(),
    recruiterName: Joi.string().optional(),
    recruiterTitle: Joi.string().optional()
  }).optional(),
  privacy: Joi.object({
    profileVisibility: Joi.string().valid('public', 'private', 'network_only').optional(),
    showLocation: Joi.boolean().optional(),
    showContact: Joi.boolean().optional()
  }).optional(),
  notificationSettings: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
    matches: Joi.boolean().optional(),
    messages: Joi.boolean().optional(),
    meetings: Joi.boolean().optional()
  }).optional()
}).min(1); // At least one field must be provided
