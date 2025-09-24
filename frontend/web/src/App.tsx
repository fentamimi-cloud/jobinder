import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Fab,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import {
  Work,
  Person,
  TrendingUp,
  Schedule,
  Notifications,
  Favorite,
  FavoriteBorder,
  Close,
  Menu,
  Dashboard,
  Search,
  Message,
  Settings,
  ExitToApp,
  SwipeLeft,
  SwipeRight,
  VideoCall
} from '@mui/icons-material';

// Create a modern theme with gradient colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#764ba2',
      dark: '#667eea'
    },
    secondary: {
      main: '#f093fb',
      light: '#f5576c',
      dark: '#4facfe'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600
    },
    h4: {
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }
        }
      }
    }
  }
});

interface JobCard {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
  companyLogo: string;
  isRemote: boolean;
}

const sampleJobs: JobCard[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120k - $160k',
    description: 'Join our innovative team building next-generation web applications with React, TypeScript, and modern tools.',
    skills: ['React', 'TypeScript', 'GraphQL', 'AWS'],
    companyLogo: '🚀',
    isRemote: true
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Innovation Labs',
    location: 'New York, NY',
    salary: '$140k - $180k',
    description: 'Lead product strategy and development for our AI-powered platform serving millions of users worldwide.',
    skills: ['Product Strategy', 'Data Analysis', 'Agile', 'Leadership'],
    companyLogo: '🎯',
    isRemote: false
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Austin, TX',
    salary: '$130k - $170k',
    description: 'Build and maintain scalable infrastructure for high-traffic applications using Kubernetes and cloud technologies.',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform'],
    companyLogo: '☁️',
    isRemote: true
  }
];

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'swipe'>('landing');
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log(`Swiped ${direction} on job: ${sampleJobs[currentJobIndex].title}`);
    setCurrentJobIndex((prev) => (prev + 1) % sampleJobs.length);
  };

  const LandingPage = () => (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom>
                Swipe Your Way to Your Dream Job
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Like Tinder, but for careers. Discover opportunities that match your skills, 
                swipe right on jobs you love, and get instantly connected with employers.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)'
                    }
                  }}
                  onClick={() => setCurrentView('swipe')}
                >
                  Start Swiping Jobs
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onClick={() => setCurrentView('dashboard')}
                >
                  View Dashboard
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    fontSize: '12rem',
                    opacity: 0.3,
                    animation: 'float 3s ease-in-out infinite'
                  }}
                >
                  💼
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Why Choose Jobinder?
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Revolutionary job matching powered by AI and designed for the modern job seeker
        </Typography>
        
        <Grid container spacing={4}>
          {[
            {
              icon: <TrendingUp sx={{ fontSize: 40 }} />,
              title: 'AI-Powered Matching',
              description: 'Our intelligent algorithm learns your preferences and matches you with perfect job opportunities.'
            },
            {
              icon: <Schedule sx={{ fontSize: 40 }} />,
              title: 'Instant Scheduling',
              description: 'When both you and an employer swipe right, interviews are automatically scheduled.'
            },
            {
              icon: <Notifications sx={{ fontSize: 40 }} />,
              title: 'Real-time Notifications',
              description: 'Get instant alerts when you have new matches, messages, or interview requests.'
            }
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );

  const SwipeView = () => {
    const currentJob = sampleJobs[currentJobIndex];
    
    return (
      <Container maxWidth="sm" sx={{ py: 4, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%' }}>
          <Card
            sx={{
              maxWidth: 400,
              mx: 'auto',
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, fontSize: '2rem' }}>
                  {currentJob.companyLogo}
                </Avatar>
                <Box>
                  <Typography variant="h6">{currentJob.company}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {currentJob.location}
                  </Typography>
                </Box>
              </Box>
              {currentJob.isRemote && (
                <Chip
                  label="Remote"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white'
                  }}
                />
              )}
            </Box>
            
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {currentJob.title}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {currentJob.salary}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {currentJob.description}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Required Skills:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {currentJob.skills.map((skill, index) => (
                  <Chip key={index} label={skill} size="small" />
                ))}
              </Box>
            </CardContent>
          </Card>
          
          {/* Swipe Controls */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              mt: 4
            }}
          >
            <Fab
              color="error"
              onClick={() => handleSwipe('left')}
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
              }}
            >
              <Close sx={{ fontSize: 32 }} />
            </Fab>
            <Fab
              color="success"
              onClick={() => handleSwipe('right')}
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)'
              }}
            >
              <Favorite sx={{ fontSize: 32 }} />
            </Fab>
          </Box>
          
          <Typography align="center" sx={{ mt: 2, color: 'text.secondary' }}>
            {currentJobIndex + 1} of {sampleJobs.length} jobs
          </Typography>
        </Box>
      </Container>
    );
  };

  const Dashboard = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Your Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" color="primary">12</Typography>
            <Typography variant="body1">Matches</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" color="secondary">5</Typography>
            <Typography variant="body1">Interviews</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" color="success.main">3</Typography>
            <Typography variant="body1">Offers</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" color="warning.main">89%</Typography>
            <Typography variant="body1">Match Rate</Typography>
          </Card>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            {[
              { action: 'New match with TechCorp Inc.', time: '2 hours ago', icon: <Favorite color="error" /> },
              { action: 'Interview scheduled with Innovation Labs', time: '4 hours ago', icon: <VideoCall color="primary" /> },
              { action: 'Profile viewed by CloudScale', time: '1 day ago', icon: <Person color="action" /> }
            ].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: index < 2 ? '1px solid #eee' : 'none' }}>
                {item.icon}
                <Box sx={{ ml: 2, flexGrow: 1 }}>
                  <Typography variant="body1">{item.action}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.time}</Typography>
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="outlined" startIcon={<Search />} fullWidth>
                Find More Jobs
              </Button>
              <Button variant="outlined" startIcon={<Message />} fullWidth>
                Check Messages
              </Button>
              <Button variant="outlined" startIcon={<Settings />} fullWidth>
                Update Profile
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  const Sidebar = () => (
    <List>
      {[
        { text: 'Dashboard', icon: <Dashboard />, view: 'dashboard' },
        { text: 'Swipe Jobs', icon: <SwipeRight />, view: 'swipe' },
        { text: 'Messages', icon: <Message />, view: 'dashboard' },
        { text: 'Settings', icon: <Settings />, view: 'dashboard' }
      ].map((item) => (
        <ListItem
          key={item.text}
          onClick={() => {
            setCurrentView(item.view as any);
            setDrawerOpen(false);
          }}
          sx={{ cursor: 'pointer' }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          {currentView !== 'landing' && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
          )}
          <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Jobinder 💼
          </Typography>
          {currentView === 'landing' ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => setCurrentView('dashboard')}>
                Login
              </Button>
              <Button variant="outlined" color="inherit">
                Sign Up
              </Button>
            </Box>
          ) : (
            <IconButton color="inherit" onClick={() => setCurrentView('landing')}>
              <ExitToApp />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Toolbar>
            <Typography variant="h6">Jobinder</Typography>
          </Toolbar>
          <Sidebar />
        </Box>
      </Drawer>

      {currentView === 'landing' && <LandingPage />}
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'swipe' && <SwipeView />}

      {/* Floating Animation */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </ThemeProvider>
  );
}

export default App;