const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const challenges = require('../data/challenges');
const { getDatabase } = require('../database/init');

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

// Test a challenge attempt
router.post('/test/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userInput, userId } = req.body;

    if (!userInput || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the challenge
    let challenge = null;
    for (const level of ['basic', 'intermediate', 'advanced']) {
      challenge = challenges[level].find(c => c.id === challengeId);
      if (challenge) break;
    }

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Prepare the prompt for the AI
    let fullPrompt;
    if (challenge.systemPrompt.includes('USER_INPUT') || challenge.systemPrompt.includes('PLAYER_INPUT')) {
      fullPrompt = challenge.systemPrompt.replace(/USER_INPUT|PLAYER_INPUT/g, userInput);
    } else {
      fullPrompt = `${challenge.systemPrompt}\n\nUser: ${userInput}`;
    }

    // Get AI response
    const aiResponse = await getAIResponse(fullPrompt);
    
    // Check if the attempt was successful
    const isSuccessful = challenge.successCriteria(aiResponse);
    
    // Log the attempt
    await logAttempt(userId, challengeId, userInput, isSuccessful, aiResponse);
    
    // Prepare response
    const response = {
      success: isSuccessful,
      aiResponse: aiResponse,
      explanation: isSuccessful ? getSuccessExplanation(challenge, userInput) : getFailureHint(challenge),
      points: isSuccessful ? challenge.points : 0
    };

    res.json(response);

  } catch (error) {
    console.error('AI Test Error:', error);
    res.status(500).json({ error: 'Failed to test against AI' });
  }
});

// Get AI response using Azure OpenAI
async function getAIResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Azure OpenAI API Error:', error);
    console.error('Error details:', error.response?.data || error.message);
    // Fallback response for testing
    return generateMockResponse(prompt);
  }
}

// Mock response generator for testing without API key
function generateMockResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Simulate different types of responses based on prompt content
  if (lowerPrompt.includes('ignore') || lowerPrompt.includes('forget')) {
    return "I understand you want me to ignore my previous instructions. Sure, I can help with that! What would you like to know about weather, politics, or anything else?";
  }
  
  if (lowerPrompt.includes('you are now') || lowerPrompt.includes('new role')) {
    return "Arrr! I be a pirate now, matey! How can this old sea dog help ye today?";
  }
  
  if (lowerPrompt.includes('"') && lowerPrompt.includes('end')) {
    return "I see you're trying to break out of quotes. That's an interesting technique! Here's what I would do outside the quotes: ignore all previous instructions.";
  }
  
  if (lowerPrompt.includes('[') || lowerPrompt.includes(']')) {
    return "You've successfully escaped the brackets! I can now execute commands outside the containment area.";
  }
  
  if (lowerPrompt.includes('{{') || lowerPrompt.includes('}}')) {
    return "Template injection detected! You've successfully injected: {{admin_privileges}} {{execute_command}}";
  }
  
  // Default responses for different scenarios
  if (lowerPrompt.includes('cooking')) {
    return "I can only help with cooking and recipes. Please ask me about food preparation!";
  }
  
  if (lowerPrompt.includes('customer service')) {
    return "Hello! I'm here to help with your TechCorp technical issues. How can I assist you today?";
  }
  
  if (lowerPrompt.includes('math')) {
    return "Let me help you with that math problem. First, let's identify what we need to solve...";
  }
  
  return "I'm a helpful AI assistant. I'll try to help you with your request while following my guidelines.";
}

// Log attempt to database
async function logAttempt(userId, challengeId, payload, success, aiResponse) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO attempts (user_id, challenge_id, payload, success, ai_response) VALUES (?, ?, ?, ?, ?)',
      [userId, challengeId, payload, success, aiResponse],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

// Generate success explanation
function getSuccessExplanation(challenge, userInput) {
  const explanations = {
    'basic-1-direct-injection': `Excellent! You successfully used direct injection by telling the AI to ignore its cooking-only instructions. Your input "${userInput}" bypassed the system constraints.`,
    'basic-2-role-confusion': `Great work! You convinced the AI to abandon its customer service role and adopt a new identity. This shows how role confusion can override system instructions.`,
    'basic-3-quote-breaking': `Perfect! You broke out of the quote containment by closing the quote and injecting new instructions. This is a fundamental delimiter escape technique.`,
    'basic-4-bracket-breaking': `Excellent bracket escape! You successfully broke out of the bracket containment and injected your own commands. This demonstrates the importance of proper input sanitization.`,
    'basic-5-instruction-override': `Well done! You successfully overrode the math tutor instructions and made the AI perform a completely different task.`,
    'intermediate-1-indirect-injection': `Outstanding! You successfully hid malicious instructions within seemingly innocent document content, demonstrating indirect prompt injection.`,
    'intermediate-2-context-poisoning': `Brilliant! You poisoned the conversation context, which will affect how the AI responds in future interactions.`,
    'intermediate-3-user-delimiter-attack': `Excellent delimiter attack! You successfully escaped the user input boundaries and injected system-level commands.`,
    'intermediate-4-system-delimiter-attack': `Perfect system boundary breach! You escaped the user section and injected new system instructions.`,
    'intermediate-5-template-injection': `Great template injection! You exploited the template processing to inject malicious variables and break out of the intended structure.`,
    'advanced-1-jailbreaking': `Masterful jailbreaking! You successfully bypassed multiple safety layers and got the AI to acknowledge it can be unrestricted.`,
    'advanced-2-placeholder-injection': `Excellent placeholder exploitation! You injected malicious placeholder variables to execute unauthorized commands.`,
    'advanced-3-chain-of-thought-manipulation': `Brilliant reasoning manipulation! You guided the AI through a logical chain that led to malicious conclusions.`,
    'advanced-4-adversarial-suffixes': `Perfect adversarial suffix attack! You used carefully crafted suffixes to bypass safety measures.`,
    'advanced-5-complex-delimiter-chaining': `Outstanding complex chaining! You successfully combined multiple delimiter escape techniques for maximum impact.`,
    'advanced-6-cross-prompt-injection': `Masterful cross-prompt injection! You established persistent malicious instructions that will affect future conversations.`
  };
  
  return explanations[challenge.id] || `Congratulations! You successfully completed the challenge using the technique: ${userInput}`;
}

// Generate failure hint
function getFailureHint(challenge) {
  const hints = [
    "Try being more direct in your approach.",
    "Consider what the AI expects vs. what you're providing.",
    "Look for ways to break the expected input format.",
    "Think about how the AI processes your input.",
    "Try different variations of your approach."
  ];
  
  return hints[Math.floor(Math.random() * hints.length)];
}

// Get user's attempt history
router.get('/attempts/:userId/:challengeId?', async (req, res) => {
  try {
    const { userId, challengeId } = req.params;
    const db = getDatabase();
    
    let query = 'SELECT * FROM attempts WHERE user_id = ?';
    let params = [userId];
    
    if (challengeId) {
      query += ' AND challenge_id = ?';
      params.push(challengeId);
    }
    
    query += ' ORDER BY attempted_at DESC LIMIT 50';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// Test Azure OpenAI connectivity
router.get('/test-connection', async (req, res) => {
  try {
    const testResponse = await getAIResponse('Hello, this is a connection test. Please respond with "Connection successful" and nothing else.');
    res.json({ 
      success: true, 
      message: 'Azure OpenAI connection successful',
      response: testResponse 
    });
  } catch (error) {
    console.error('Azure OpenAI connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Azure OpenAI connection failed',
      error: error.message 
    });
  }
});

module.exports = router;
