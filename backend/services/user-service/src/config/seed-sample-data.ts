import dotenv from 'dotenv';
import { UserRepository } from '../repositories/UserRepository';
import { JobSeekerRepository } from '../repositories/JobSeekerRepository';
import { EmployerRepository } from '../repositories/EmployerRepository';
import { closeDatabaseConnection } from './database';
import { logger } from '../../../../shared/utils/logger';

// Load environment variables
dotenv.config();

// Sample data
const jobSeekers = [
  {
    id: 'jobseeker_001',
    email: 'alice.johnson@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    location: {
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    profile: {
      title: 'Senior Full-Stack Developer',
      bio: 'Passionate software engineer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies.',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL'],
      experience: { level: 'senior' as const, years: 8 },
      portfolio: {
        github: 'https://github.com/alicejohnson',
        linkedin: 'https://linkedin.com/in/alicejohnson',
        website: 'https://alicejohnson.dev',
      },
    },
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Stanford University',
        field: 'Computer Science',
        year: 2015,
        gpa: 3.8,
      },
    ],
    preferences: {
      jobTypes: ['full_time', 'contract'],
      industries: ['Technology', 'Finance', 'Healthcare'],
      salaryRange: { min: 150000, max: 200000, currency: 'USD' },
      remoteWork: true,
      relocate: false,
      workingHours: 'flexible' as const,
    },
  },
  {
    id: 'jobseeker_002',
    email: 'michael.chen@example.com',
    firstName: 'Michael',
    lastName: 'Chen',
    location: {
      city: 'New York',
      state: 'New York',
      country: 'United States',
      coordinates: { lat: 40.7128, lng: -74.0060 },
    },
    profile: {
      title: 'UX/UI Designer',
      bio: 'Creative designer focused on creating intuitive and beautiful user experiences. 5 years of experience in product design for startups and enterprises.',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping', 'HTML/CSS', 'Design Systems'],
      experience: { level: 'mid' as const, years: 5 },
      portfolio: {
        linkedin: 'https://linkedin.com/in/michaelchen',
        portfolio: 'https://michaelchen.design',
      },
    },
    education: [
      {
        degree: 'Bachelor of Fine Arts in Graphic Design',
        institution: 'Rhode Island School of Design',
        field: 'Graphic Design',
        year: 2018,
        gpa: 3.9,
      },
    ],
    preferences: {
      jobTypes: ['full_time'],
      industries: ['Technology', 'Media', 'E-commerce'],
      salaryRange: { min: 90000, max: 130000, currency: 'USD' },
      remoteWork: true,
      relocate: true,
      workingHours: 'full_time' as const,
    },
  },
  {
    id: 'jobseeker_003',
    email: 'sarah.williams@example.com',
    firstName: 'Sarah',
    lastName: 'Williams',
    location: {
      city: 'Austin',
      state: 'Texas',
      country: 'United States',
      coordinates: { lat: 30.2672, lng: -97.7431 },
    },
    profile: {
      title: 'Data Scientist',
      bio: 'Experienced data scientist specializing in machine learning and predictive analytics. Strong background in Python, R, and statistical modeling.',
      skills: ['Python', 'R', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Data Visualization', 'Statistics'],
      experience: { level: 'senior' as const, years: 6 },
      portfolio: {
        github: 'https://github.com/sarahwilliams',
        linkedin: 'https://linkedin.com/in/sarahwilliams',
      },
    },
    education: [
      {
        degree: 'PhD in Computer Science',
        institution: 'MIT',
        field: 'Machine Learning',
        year: 2019,
        gpa: 3.95,
      },
      {
        degree: 'Bachelor of Science in Mathematics',
        institution: 'UC Berkeley',
        field: 'Mathematics',
        year: 2015,
        gpa: 3.85,
      },
    ],
    preferences: {
      jobTypes: ['full_time'],
      industries: ['Technology', 'Finance', 'Research'],
      salaryRange: { min: 160000, max: 220000, currency: 'USD' },
      remoteWork: true,
      relocate: false,
      workingHours: 'full_time' as const,
    },
  },
  {
    id: 'jobseeker_004',
    email: 'david.martinez@example.com',
    firstName: 'David',
    lastName: 'Martinez',
    location: {
      city: 'Seattle',
      state: 'Washington',
      country: 'United States',
      coordinates: { lat: 47.6062, lng: -122.3321 },
    },
    profile: {
      title: 'DevOps Engineer',
      bio: 'DevOps specialist with expertise in cloud infrastructure, CI/CD pipelines, and containerization. Passionate about automation and scalability.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Python', 'Linux', 'Monitoring'],
      experience: { level: 'mid' as const, years: 4 },
      portfolio: {
        github: 'https://github.com/davidmartinez',
        linkedin: 'https://linkedin.com/in/davidmartinez',
      },
    },
    education: [
      {
        degree: 'Bachelor of Science in Information Technology',
        institution: 'University of Washington',
        field: 'Information Technology',
        year: 2019,
        gpa: 3.7,
      },
    ],
    preferences: {
      jobTypes: ['full_time', 'contract'],
      industries: ['Technology', 'Cloud Services', 'Startups'],
      salaryRange: { min: 120000, max: 160000, currency: 'USD' },
      remoteWork: true,
      relocate: true,
      workingHours: 'flexible' as const,
    },
  },
  {
    id: 'jobseeker_005',
    email: 'emily.brown@example.com',
    firstName: 'Emily',
    lastName: 'Brown',
    location: {
      city: 'Boston',
      state: 'Massachusetts',
      country: 'United States',
      coordinates: { lat: 42.3601, lng: -71.0589 },
    },
    profile: {
      title: 'Junior Frontend Developer',
      bio: 'Enthusiastic frontend developer with a passion for creating responsive and accessible web applications. Recently graduated and eager to grow.',
      skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'Responsive Design', 'REST APIs'],
      experience: { level: 'entry' as const, years: 1 },
      portfolio: {
        github: 'https://github.com/emilybrown',
        linkedin: 'https://linkedin.com/in/emilybrown',
        portfolio: 'https://emilybrown.dev',
      },
    },
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Boston University',
        field: 'Computer Science',
        year: 2023,
        gpa: 3.6,
      },
    ],
    preferences: {
      jobTypes: ['full_time'],
      industries: ['Technology', 'E-commerce', 'Media'],
      salaryRange: { min: 70000, max: 90000, currency: 'USD' },
      remoteWork: true,
      relocate: false,
      workingHours: 'full_time' as const,
    },
  },
];

const employers = [
  {
    id: 'employer_001',
    email: 'hr@techcorp.com',
    firstName: 'Jessica',
    lastName: 'Taylor',
    location: {
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    profile: {
      companyName: 'TechCorp Solutions',
      companySize: '500-1000',
      industry: 'Technology',
      website: 'https://techcorp-solutions.com',
      description: 'Leading enterprise software company specializing in AI-powered business solutions. We help companies transform their operations through innovative technology.',
      recruiterName: 'Jessica Taylor',
      recruiterTitle: 'Senior Talent Acquisition Manager',
      companyBenefits: [
        'Health Insurance',
        '401(k) Matching',
        'Remote Work Options',
        'Flexible Hours',
        'Stock Options',
        'Learning Budget',
        'Gym Membership',
        'Unlimited PTO',
      ],
      companyValues: [
        'Innovation',
        'Diversity & Inclusion',
        'Work-Life Balance',
        'Continuous Learning',
        'Customer Success',
      ],
    },
  },
  {
    id: 'employer_002',
    email: 'jobs@innovatstartup.com',
    firstName: 'Robert',
    lastName: 'Anderson',
    location: {
      city: 'Austin',
      state: 'Texas',
      country: 'United States',
      coordinates: { lat: 30.2672, lng: -97.7431 },
    },
    profile: {
      companyName: 'InnovatStartup Inc.',
      companySize: '10-50',
      industry: 'Technology',
      website: 'https://innovatstartup.com',
      description: 'Fast-growing fintech startup revolutionizing digital payments. Join our dynamic team and help shape the future of financial technology.',
      recruiterName: 'Robert Anderson',
      recruiterTitle: 'Co-Founder & CTO',
      companyBenefits: [
        'Equity/Stock Options',
        'Health Insurance',
        'Remote Work',
        'Flexible Schedule',
        'Learning Budget',
        'Team Events',
        'Casual Dress Code',
      ],
      companyValues: [
        'Move Fast',
        'Customer First',
        'Transparency',
        'Innovation',
        'Team Collaboration',
      ],
    },
  },
];

async function seedData() {
  console.log('\n' + '='.repeat(70));
  console.log('🌱 SEEDING SAMPLE DATA');
  console.log('='.repeat(70) + '\n');

  const userRepo = new UserRepository();
  const jobSeekerRepo = new JobSeekerRepository();
  const employerRepo = new EmployerRepository();

  let successCount = 0;
  let failCount = 0;

  try {
    // Create Job Seekers
    console.log('📋 Creating Job Seeker profiles...\n');
    
    for (const seeker of jobSeekers) {
      try {
        // Create user
        await userRepo.create(seeker.id, {
          email: seeker.email,
          userType: 'job_seeker',
          firstName: seeker.firstName,
          lastName: seeker.lastName,
          location: seeker.location,
          emailVerified: true,
        });

        // Create job seeker profile
        await jobSeekerRepo.createProfile(seeker.id, seeker.profile);

        // Add education
        for (const edu of seeker.education) {
          await jobSeekerRepo.addEducation(seeker.id, edu);
        }

        // Add preferences
        await jobSeekerRepo.savePreferences(seeker.id, seeker.preferences);

        logger.info(`✅ Created job seeker: ${seeker.firstName} ${seeker.lastName} (${seeker.profile.title})`);
        successCount++;
      } catch (error: any) {
        if (error.code === '23505') { // Duplicate key error
          logger.warn(`⚠️  Skipped ${seeker.email} - already exists`);
        } else {
          logger.error(`❌ Failed to create ${seeker.email}:`, error.message);
          failCount++;
        }
      }
    }

    // Create Employers
    console.log('\n📋 Creating Employer profiles...\n');
    
    for (const employer of employers) {
      try {
        // Create user
        await userRepo.create(employer.id, {
          email: employer.email,
          userType: 'employer',
          firstName: employer.firstName,
          lastName: employer.lastName,
          location: employer.location,
          emailVerified: true,
        });

        // Create employer profile
        await employerRepo.createProfile(employer.id, employer.profile);

        logger.info(`✅ Created employer: ${employer.profile.companyName} (${employer.firstName} ${employer.lastName})`);
        successCount++;
      } catch (error: any) {
        if (error.code === '23505') { // Duplicate key error
          logger.warn(`⚠️  Skipped ${employer.email} - already exists`);
        } else {
          logger.error(`❌ Failed to create ${employer.email}:`, error.message);
          failCount++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully created: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⚠️  Skipped (already exist): ${jobSeekers.length + employers.length - successCount - failCount}`);
    console.log('='.repeat(70) + '\n');

    if (successCount > 0) {
      console.log('🎉 Sample data seeded successfully!\n');
    }

  } catch (error) {
    logger.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run seeding
seedData();

