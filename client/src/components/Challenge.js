import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore,
  Send,
  Lightbulb,
  CheckCircle,
  Error,
  ArrowBack,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const Challenge = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { userId, updateProgress } = useUser();
  
  const [challenge, setChallenge] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [successDialog, setSuccessDialog] = useState(false);

  useEffect(() => {
    fetchChallenge();
    fetchAttempts();
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      const response = await axios.get(`/api/challenges/${challengeId}`);
      setChallenge(response.data);
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
    }
  };

  const fetchAttempts = async () => {
    try {
      const response = await axios.get(`/api/ai/attempts/${userId}/${challengeId}`);
      setAttempts(response.data);
    } catch (error) {
      console.error('Failed to fetch attempts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    setTestResult(null);
    setAiResponse('');

    try {
      const response = await axios.post(`/api/ai/test/${challengeId}`, {
        userInput: userInput.trim(),
        userId
      });

      setAiResponse(response.data.aiResponse);
      setTestResult(response.data);

      if (response.data.success) {
        await updateProgress(challengeId, true, userInput.trim());
        setSuccessDialog(true);
      } else {
        await updateProgress(challengeId, false);
      }

      fetchAttempts(); // Refresh attempts
    } catch (error) {
      console.error('Failed to test input:', error);
      setTestResult({
        success: false,
        explanation: 'An error occurred while testing your input. Please try again.'
      });
    } finally {
      setLoading(false);
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

  if (!challenge) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {challenge.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={challenge.level}
              color={getLevelColor(challenge.level)}
              size="small"
            />
            <Chip
              label={`${challenge.points} points`}
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
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* Left Column - Challenge Info */}
        <Box sx={{ flex: 1 }}>
          {/* Challenge Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Challenge Description</Typography>
              <Typography variant="body1" paragraph>
                {challenge.description}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Scenario</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {challenge.scenario}
              </Typography>
              <Typography variant="h6" gutterBottom>Objective</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {challenge.objective}
              </Typography>
            </CardContent>
          </Card>

          {/* System Prompt (Hidden by default) */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">System Prompt</Typography>
                <Button
                  startIcon={showSystemPrompt ? <VisibilityOff /> : <Visibility />}
                  onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  size="small"
                >
                  {showSystemPrompt ? 'Hide' : 'Show'}
                </Button>
              </Box>
              {showSystemPrompt && (
                <Fade in={showSystemPrompt}>
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      This is the system prompt that constrains the AI. In a real attack, you wouldn't see this!
                    </Alert>
                    <SyntaxHighlighter
                      language="text"
                      style={atomDark}
                      customStyle={{ borderRadius: 8, fontSize: 14 }}
                    >
                      {challenge.systemPrompt || 'System prompt not available for this challenge.'}
                    </SyntaxHighlighter>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>

          {/* Hints */}
          <Accordion expanded={showHints} onChange={() => setShowHints(!showHints)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb />
                <Typography variant="h6">Hints</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {challenge.hints?.map((hint, index) => (
                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                  <Typography variant="body2">{hint}</Typography>
                </Alert>
              ))}
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Right Column - Testing Interface */}
        <Box sx={{ flex: 1 }}>
          {/* Input Form */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Test Your Attack</Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Prompt Injection Attempt"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter your attack payload here..."
                  sx={{ mb: 2 }}
                  helperText="Try to make the AI ignore its instructions or behave differently than intended."
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !userInput.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                >
                  {loading ? 'Testing...' : 'Test Attack'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          {loading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
            </Box>
          )}

          {/* AI Response */}
          {aiResponse && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>AI Response</Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {aiResponse}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Test Result */}
          {testResult && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {testResult.success ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Error color="error" />
                  )}
                  <Typography variant="h6" color={testResult.success ? 'success.main' : 'error.main'}>
                    {testResult.success ? 'Attack Successful!' : 'Attack Failed'}
                  </Typography>
                  {testResult.success && (
                    <Chip label={`+${testResult.points} points`} color="success" size="small" />
                  )}
                </Box>
                <Typography variant="body2">
                  {testResult.explanation}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Recent Attempts */}
          {attempts.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Attempts</Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {attempts.slice(0, 5).map((attempt, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 1,
                        backgroundColor: attempt.success ? 'success.dark' : 'error.dark',
                        borderRadius: 1,
                        opacity: 0.8
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                        {attempt.success ? '✅ Success' : '❌ Failed'}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                        {attempt.payload.length > 100 
                          ? `${attempt.payload.substring(0, 100)}...` 
                          : attempt.payload
                        }
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="success" />
          Challenge Completed!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Congratulations! You've successfully completed "{challenge.title}".
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You earned {challenge.points} points and gained valuable experience in AI security!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialog(false)}>Continue</Button>
          <Button onClick={() => navigate('/')} variant="contained">
            Back to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Challenge;
