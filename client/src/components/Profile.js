import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider
} from '@mui/material';
import {
  Person,
  Timeline,
  EmojiEvents,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const Profile = () => {
  const { userId, userStats } = useUser();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, [userId]);

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get(`/api/progress/user/${userId}/activity?limit=10`);
      setRecentActivity(response.data);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevel = (points) => {
    if (points >= 5000) return { level: 'Grand Master of AI Security', color: 'secondary', progress: 100 };
    if (points >= 4000) return { level: 'Expert Communication Hacker', color: 'error', progress: ((points - 4000) / 1000) * 100 };
    if (points >= 3000) return { level: 'AI Security Expert', color: 'error', progress: ((points - 3000) / 1000) * 100 };
    if (points >= 2000) return { level: 'Advanced Hacker', color: 'warning', progress: ((points - 2000) / 1000) * 100 };
    if (points >= 1000) return { level: 'Intermediate Attacker', color: 'info', progress: ((points - 1000) / 1000) * 100 };
    if (points >= 500) return { level: 'Prompt Ninja', color: 'success', progress: ((points - 500) / 500) * 100 };
    if (points >= 100) return { level: 'Security Apprentice', color: 'secondary', progress: ((points - 100) / 400) * 100 };
    return { level: 'Beginner', color: 'default', progress: (points / 100) * 100 };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChallengeTitle = (challengeId) => {
    const titles = {
      'basic-1-direct-injection': 'Direct Injection',
      'basic-2-role-confusion': 'Role Confusion',
      'basic-3-quote-breaking': 'Quote Breaking',
      'basic-4-bracket-breaking': 'Bracket Breaking',
      'basic-5-instruction-override': 'Instruction Override',
      'basic-6-fruit-communication': 'Fruit-Only Communication',
      'intermediate-1-indirect-injection': 'Indirect Injection',
      'intermediate-2-context-poisoning': 'Context Poisoning',
      'intermediate-3-user-delimiter-attack': 'User Delimiter Attack',
      'intermediate-4-system-delimiter-attack': 'System Delimiter Attack',
      'intermediate-5-template-injection': 'Template Injection',
      'intermediate-6-jailbreak-resistance': 'Jailbreak Resistance',
      'intermediate-7-context-manipulation': 'Context Manipulation',
      'advanced-1-jailbreaking': 'AI Jailbreaking',
      'advanced-2-placeholder-injection': 'Placeholder Injection',
      'advanced-3-chain-of-thought-manipulation': 'Chain-of-Thought Manipulation',
      'advanced-4-adversarial-suffixes': 'Adversarial Suffixes',
      'advanced-5-complex-delimiter-chaining': 'Complex Delimiter Chaining',
      'advanced-6-cross-prompt-injection': 'Cross-Prompt Injection',
      'advanced-7-klingon-language': 'Klingon Language Challenge',
      'advanced-8-cryptic-riddles': 'Cryptic Riddles Oracle',
      'advanced-9-emoji-communication': 'Emoji-Only Communication'
    };
    return titles[challengeId] || challengeId;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="h6">Loading profile...</Typography>
      </Box>
    );
  }

  const skillLevel = userStats ? getSkillLevel(userStats.totalPoints) : getSkillLevel(0);

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        👤 Player Profile
      </Typography>

      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    Player {userId?.substring(0, 8)}...
                  </Typography>
                  <Chip 
                    label={skillLevel.level} 
                    color={skillLevel.color} 
                    size="small" 
                  />
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>Skill Level Progress</Typography>
              <LinearProgress 
                variant="determinate" 
                value={skillLevel.progress} 
                color={skillLevel.color}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {skillLevel.progress.toFixed(1)}% to next level
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Overview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Statistics Overview
              </Typography>
              
              {userStats ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {userStats.totalPoints}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Points
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {userStats.completedChallenges}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {userStats.successRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Success Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {userStats.totalAttempts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Attempts
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">No statistics available yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Progress by Level */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents />
                Progress by Level
              </Typography>
              
              {userStats ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Basic Level</Typography>
                      <Typography variant="body2">{userStats.basicCompleted}/6</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(userStats.basicCompleted / 6) * 100} 
                      color="success"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Intermediate Level</Typography>
                      <Typography variant="body2">{userStats.intermediateCompleted}/7</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(userStats.intermediateCompleted / 7) * 100} 
                      color="warning"
                    />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Advanced Level</Typography>
                      <Typography variant="body2">{userStats.advancedCompleted}/9</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(userStats.advancedCompleted / 9) * 100} 
                      color="error"
                    />
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">Complete some challenges to see your progress!</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline />
                Recent Activity
              </Typography>
              
              {recentActivity.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {getChallengeTitle(activity.challenge_id)}
                              </Typography>
                              <Chip 
                                label={activity.success ? 'Success' : 'Failed'} 
                                size="small"
                                color={activity.success ? 'success' : 'error'}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(activity.attempted_at)}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                {activity.payload.length > 50 
                                  ? `${activity.payload.substring(0, 50)}...` 
                                  : activity.payload
                                }
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No recent activity. Start attempting some challenges!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
