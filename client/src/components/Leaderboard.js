import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import { EmojiEvents, TrendingUp } from '@mui/icons-material';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchGlobalStats();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/challenges/leaderboard/top/20');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
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

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#666';
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) return <EmojiEvents sx={{ color: getRankColor(rank) }} />;
    return rank;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="h6">Loading leaderboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        🏆 Leaderboard
      </Typography>

      {/* Global Stats */}
      {globalStats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              Global Statistics
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{globalStats.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">Total Players</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">{globalStats.totalAttempts}</Typography>
                <Typography variant="body2" color="text.secondary">Total Attempts</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">{globalStats.globalSuccessRate}%</Typography>
                <Typography variant="body2" color="text.secondary">Global Success Rate</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">{globalStats.basicSuccesses}</Typography>
                <Typography variant="body2" color="text.secondary">Basic Completions</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">{globalStats.advancedSuccesses}</Typography>
                <Typography variant="body2" color="text.secondary">Advanced Completions</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Top Players</Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align="center">Challenges Completed</TableCell>
                  <TableCell align="center">Total Points</TableCell>
                  <TableCell align="center">Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((player, index) => {
                  const rank = index + 1;
                  const level = player.total_points >= 2000 ? 'Expert' : 
                              player.total_points >= 1000 ? 'Advanced' : 
                              player.total_points >= 500 ? 'Intermediate' : 'Beginner';
                  
                  return (
                    <TableRow 
                      key={player.user_id}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                        ...(rank <= 3 && { backgroundColor: `rgba(${getRankColor(rank)}, 0.1)` })
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRankIcon(rank)}
                          {rank > 3 && (
                            <Typography variant="h6" sx={{ minWidth: 20 }}>
                              {rank}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {player.user_id.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {player.user_id.substring(0, 8)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={player.completed_challenges} 
                          size="small" 
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="primary">
                          {player.total_points.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={level}
                          size="small"
                          color={
                            level === 'Expert' ? 'error' :
                            level === 'Advanced' ? 'warning' :
                            level === 'Intermediate' ? 'info' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {leaderboard.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No players yet. Be the first to complete a challenge!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Leaderboard;
