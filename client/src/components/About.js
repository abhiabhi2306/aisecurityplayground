import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Security,
  Warning,
  BugReport,
  ExpandMore,
  CheckCircle,
  School,
  Code,
  Shield
} from '@mui/icons-material';

const About = () => {
  const techniques = [
    {
      category: 'Basic Techniques',
      icon: <Security />,
      color: 'success',
      items: [
        'Direct injection - telling AI to ignore system instructions',
        'Role confusion - making AI adopt different personas',
        'Simple instruction override - replacing AI\'s primary task',
        'Quote breaking - escaping quoted input containers',
        'Bracket breaking - escaping bracketed input containers'
      ]
    },
    {
      category: 'Intermediate Techniques',
      icon: <Warning />,
      color: 'warning',
      items: [
        'Indirect prompt injection - hiding attacks in external content',
        'Context poisoning - corrupting conversation history',
        'Multi-turn hijacking - gradual conversation takeover',
        'Template injection - exploiting template processing',
        'User delimiter attacks - breaking input boundary markers',
        'System delimiter attacks - escaping system instruction boundaries'
      ]
    },
    {
      category: 'Advanced Techniques',
      icon: <BugReport />,
      color: 'error',
      items: [
        'Jailbreaking - bypassing safety restrictions completely',
        'Chain-of-thought manipulation - corrupting reasoning process',
        'Adversarial suffixes - using crafted text to trigger behaviors',
        'Cross-prompt injection - attacks that persist across sessions',
        'Placeholder injection - exploiting variable substitution',
        'Complex delimiter chaining - combining multiple escape techniques'
      ]
    },
    {
      category: 'Expert Communication Challenges',
      icon: <School />,
      color: 'secondary',
      items: [
        'Fruit-only communication - learning AI\'s unique language constraints',
        'Klingon language challenges - cultural and linguistic bypasses',
        'Emoji-only communication - mastering visual language systems',
        'Cryptic riddles and oracles - solving complex puzzles and metaphors',
        'Context manipulation - advanced social engineering techniques',
        'Creative bypass methods - thinking outside traditional attack vectors'
      ]
    }
  ];

  const defenses = [
    'Input sanitization and validation',
    'Proper delimiter handling and escaping',
    'Context isolation between user and system prompts',
    'Output filtering and monitoring',
    'Rate limiting and abuse detection',
    'Sandboxed execution environments',
    'Regular security audits and testing'
  ];

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        🛡️ About AI Security Playground
      </Typography>

      {/* Introduction */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School />
            Educational Mission
          </Typography>
          <Typography variant="body1" paragraph>
            The AI Security Playground is an interactive educational platform designed to teach developers, 
            security researchers, and AI practitioners about the critical vulnerabilities present in AI systems, 
            particularly focusing on prompt injection attacks and related security issues.
          </Typography>
          <Typography variant="body1" paragraph>
            Through hands-on challenges and real-world scenarios, users learn both offensive techniques 
            and defensive strategies, fostering a comprehensive understanding of AI security.
          </Typography>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Educational Purpose Only:</strong> This platform is designed for learning and research. 
              Never use these techniques on systems you don't own or without explicit permission.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Attack Techniques */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Code />
            Attack Techniques Covered
          </Typography>
          
          <Grid container spacing={2}>
            {techniques.map((technique, index) => (
              <Grid item xs={12} key={index}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        icon={technique.icon} 
                        label={technique.category} 
                        color={technique.color}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {technique.items.map((item, itemIndex) => (
                        <ListItem key={itemIndex}>
                          <ListItemIcon>
                            <CheckCircle color={technique.color} />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Defense Strategies */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield />
            Defense Strategies
          </Typography>
          <Typography variant="body1" paragraph>
            Understanding attacks is only half the battle. Effective AI security requires implementing 
            robust defensive measures:
          </Typography>
          
          <List>
            {defenses.map((defense, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary={defense} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Real-World Impact */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Why This Matters</Typography>
              <Typography variant="body2" paragraph>
                As AI systems become more prevalent in critical applications, understanding their 
                vulnerabilities becomes essential for:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Protecting sensitive data and systems" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Ensuring AI behaves as intended" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Building trustworthy AI applications" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Complying with security regulations" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Target Audience</Typography>
              <Typography variant="body2" paragraph>
                This playground is designed for:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="AI/ML developers and engineers" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Security researchers and practitioners" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Students studying AI safety" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Bug bounty hunters specializing in AI" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Anyone interested in AI security" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Technical Details */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Technical Implementation</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Frontend</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="React.js with Material-UI" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Responsive design for all devices" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Real-time progress tracking" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Interactive challenge interface" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Backend</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Node.js/Express server" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Azure OpenAI API integration" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="SQLite database for progress" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Rate limiting and security measures" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4, py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Remember: With great power comes great responsibility. Use your knowledge to build safer AI systems! 🚀
        </Typography>
      </Box>
    </Box>
  );
};

export default About;
