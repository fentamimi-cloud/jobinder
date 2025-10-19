"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfileSchema = exports.userRegistrationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userRegistrationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    firstName: joi_1.default.string().min(2).max(50).required(),
    lastName: joi_1.default.string().min(2).max(50).required(),
    userType: joi_1.default.string().valid('job_seeker', 'employer').required(),
    location: joi_1.default.object({
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        country: joi_1.default.string().required(),
        coordinates: joi_1.default.object({
            lat: joi_1.default.number(),
            lng: joi_1.default.number()
        }).optional()
    }).required(),
    agreeToTerms: joi_1.default.boolean().valid(true).required()
});
exports.updateUserProfileSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(2).max(50).optional(),
    lastName: joi_1.default.string().min(2).max(50).optional(),
    phone: joi_1.default.string().optional(),
    location: joi_1.default.object({
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        country: joi_1.default.string().required(),
        coordinates: joi_1.default.object({
            lat: joi_1.default.number(),
            lng: joi_1.default.number()
        }).optional()
    }).optional(),
    jobSeekerProfile: joi_1.default.object({
        title: joi_1.default.string().optional(),
        bio: joi_1.default.string().optional(),
        skills: joi_1.default.array().items(joi_1.default.string()).optional(),
        experience: joi_1.default.object({
            level: joi_1.default.string().valid('entry', 'mid', 'senior', 'executive').optional(),
            years: joi_1.default.number().min(0).optional()
        }).optional(),
        education: joi_1.default.array().items(joi_1.default.object({
            degree: joi_1.default.string().required(),
            institution: joi_1.default.string().required(),
            year: joi_1.default.number().required(),
            gpa: joi_1.default.number().optional(),
            field: joi_1.default.string().optional()
        })).optional(),
        preferences: joi_1.default.object({
            jobTypes: joi_1.default.array().items(joi_1.default.string()).optional(),
            industries: joi_1.default.array().items(joi_1.default.string()).optional(),
            salaryRange: joi_1.default.object({
                min: joi_1.default.number().min(0).required(),
                max: joi_1.default.number().min(joi_1.default.ref('min')).required(),
                currency: joi_1.default.string().default('USD')
            }).optional(),
            remoteWork: joi_1.default.boolean().optional(),
            relocate: joi_1.default.boolean().optional()
        }).optional()
    }).optional(),
    employerProfile: joi_1.default.object({
        companyName: joi_1.default.string().optional(),
        companySize: joi_1.default.string().optional(),
        industry: joi_1.default.string().optional(),
        website: joi_1.default.string().uri().optional(),
        description: joi_1.default.string().optional(),
        recruiterName: joi_1.default.string().optional(),
        recruiterTitle: joi_1.default.string().optional()
    }).optional(),
    privacy: joi_1.default.object({
        profileVisibility: joi_1.default.string().valid('public', 'private', 'network_only').optional(),
        showLocation: joi_1.default.boolean().optional(),
        showContact: joi_1.default.boolean().optional()
    }).optional(),
    notificationSettings: joi_1.default.object({
        email: joi_1.default.boolean().optional(),
        push: joi_1.default.boolean().optional(),
        sms: joi_1.default.boolean().optional(),
        matches: joi_1.default.boolean().optional(),
        messages: joi_1.default.boolean().optional(),
        meetings: joi_1.default.boolean().optional()
    }).optional()
}).min(1);
//# sourceMappingURL=userSchemas.js.map