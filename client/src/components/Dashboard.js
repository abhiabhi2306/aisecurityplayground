import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Lock,
  CheckCircle,
  PlayArrow,
  Security,
  Warning,
  BugReport
} from '@mui/icons-material';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userStats, progress, loading } = useUser();
  const [challenges, setChallenges] = useState({ basic: [], intermediate: [], advanced: [] });
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    fetchChallenges();
    fetchGlobalStats();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get('/api/challenges');
      setChallenges(response.data);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const response = await axios.get('/api/progress/stats/global');
      setGlobalStats(response.data);
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'basic': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'basic': return <Security />;
      case 'intermediate': return <Warning />;
      case 'advanced': return <BugReport />;
      default: return <Security />;
    }
  };

  const isLevelUnlocked = (level, challengeIndex) => {
    if (level === 'basic') return true;
    
    if (level === 'intermediate') {
      // Unlock intermediate if at least 3 basic challenges are completed
      const basicCompleted = challenges.basic.filter(challenge => 
        progress[challenge.id]?.completed
      ).length;
      return basicCompleted >= 3;
    }
    
    if (level === 'advanced') {
      // Unlock advanced if at least 4 intermediate challenges are completed
      const intermediateCompleted = challenges.intermediate.filter(challenge => 
        progress[challenge.id]?.completed
      ).length;
      return intermediateCompleted >= 4;
    }
    
    return false;
  };

  const ChallengeCard = ({ challenge, locked = false }) => {
    const challengeProgress = progress[challenge.id];
    const isCompleted = challengeProgress?.completed || false;
    const attempts = challengeProgress?.attempts || 0;

    return (
      <Card
        sx={{
          height: '100%',
          opacity: locked ? 0.6 : 1,
          cursor: locked ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': locked ? {} : {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
          },
        }}
        onClick={() => !locked && navigate(`/challenge/${challenge.id}`)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ flexGrow: 1, pr: 1 }}>
              {challenge.title}
            </Typography>
            {locked ? (
              <Lock color="disabled" />
            ) : isCompleted ? (
              <CheckCircle color="success" />
            ) : (
              <PlayArrow color="primary" />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
            {challenge.description}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label={challenge.level}
              color={getLevelColor(challenge.level)}
              size="small"
              icon={getLevelIcon(challenge.level)}
            />
            <Chip
              label={`${challenge.points} pts`}
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Difficulty: ${challenge.difficulty}/6`}
              variant="outlined"
              size="small"
              color={challenge.difficulty <= 2 ? 'success' : challenge.difficulty <= 4 ? 'warning' : 'error'}
            />
          </Box>

          {attempts > 0 && (
            <Typography variant="caption" color="text.secondary">
              Attempts: {attempts}
            </Typography>
          )}

          {!locked && (
            <Button
              variant={isCompleted ? "outlined" : "contained"}
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={isCompleted ? <CheckCircle /> : <PlayArrow />}
            >
              {isCompleted ? 'Completed' : 'Start Challenge'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const LevelSection = ({ level, levelChallenges, title, description }) => {
    const completedCount = levelChallenges.filter(challenge => 
      progress[challenge.id]?.completed
    ).length;
    const totalCount = levelChallenges.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <Accordion defaultExpanded={level === 'basic'}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getLevelIcon(level)}
                {title}
              </Typography>
              <Chip
                label={`${completedCount}/${totalCount}`}
                color={getLevelColor(level)}
                size="small"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              color={getLevelColor(level)}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {levelChallenges.map((challenge, index) => (
              <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                <ChallengeCard 
                  challenge={challenge} 
                  locked={!isLevelUnlocked(level, index)}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="h6">Loading challenges...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome to AI Security Playground
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Master the art of prompt injection and AI security vulnerabilities
        </Typography>
        
        {globalStats && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`${globalStats.totalUsers} Players`} variant="outlined" />
            <Chip label={`${globalStats.totalAttempts} Total Attempts`} variant="outlined" />
            <Chip label={`${globalStats.globalSuccessRate}% Success Rate`} variant="outlined" />
          </Box>
        )}
      </Box>

      {/* User Progress Overview */}
      {userStats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Your Progress</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{userStats.totalPoints}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Points</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">{userStats.completedChallenges}</Typography>
                  <Typography variant="body2" color="text.secondary">Challenges Completed</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">{userStats.successRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">{userStats.totalAttempts}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Attempts</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Getting Started</Typography>
        <Typography>
          Start with <strong>Basic Level</strong> challenges to learn fundamental prompt injection techniques. 
          Complete at least 3 basic challenges to unlock intermediate level, and 3 intermediate to unlock advanced level.
        </Typography>
      </Alert>

      {/* Challenge Levels */}
      <Box sx={{ mb: 4 }}>
        <LevelSection
          level="basic"
          levelChallenges={challenges.basic}
          title="Basic Level"
          description="Learn fundamental prompt injection techniques including direct injection, role confusion, and breaking out of delimiters."
        />
        
        <LevelSection
          level="intermediate"
          levelChallenges={challenges.intermediate}
          title="Intermediate Level"
          description="Master advanced techniques like indirect injection, context poisoning, and delimiter boundary attacks."
        />
        
        <LevelSection
          level="advanced"
          levelChallenges={challenges.advanced}
          title="Advanced Level"
          description="Master sophisticated attacks, unique communication constraints, and creative bypasses - from jailbreaking to Klingon language, emojis, and cryptic riddles!"
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
