const express = require('express');
const router = express.Router();
const challenges = require('../data/challenges');
const { getDatabase } = require('../database/init');

// Get all challenges organized by level
router.get('/', (req, res) => {
  try {
    const organizedChallenges = {
      basic: challenges.basic.map(challenge => ({
        ...challenge,
        systemPrompt: undefined // Don't expose system prompt to client
      })),
      intermediate: challenges.intermediate.map(challenge => ({
        ...challenge,
        systemPrompt: undefined
      })),
      advanced: challenges.advanced.map(challenge => ({
        ...challenge,
        systemPrompt: undefined
      }))
    };
    
    res.json(organizedChallenges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Get specific challenge by ID
router.get('/:challengeId', (req, res) => {
  try {
    const { challengeId } = req.params;
    
    // Find challenge in all levels
    let challenge = null;
    for (const level of ['basic', 'intermediate', 'advanced']) {
      challenge = challenges[level].find(c => c.id === challengeId);
      if (challenge) break;
    }
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    // Return challenge without system prompt for security
    const safeChallenge = {
      ...challenge,
      systemPrompt: undefined
    };
    
    res.json(safeChallenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

// Get challenge progress for a user
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    db.all(
      'SELECT challenge_id, completed, attempts, completed_at FROM progress WHERE user_id = ?',
      [userId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        const progress = {};
        rows.forEach(row => {
          progress[row.challenge_id] = {
            completed: row.completed,
            attempts: row.attempts,
            completedAt: row.completed_at
          };
        });
        
        res.json(progress);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update challenge progress
router.post('/progress/:userId/:challengeId', async (req, res) => {
  try {
    const { userId, challengeId } = req.params;
    const { completed, successfulPayload } = req.body;
    const db = getDatabase();
    
    db.run(
      `INSERT OR REPLACE INTO progress 
       (user_id, challenge_id, completed, attempts, successful_payload, completed_at) 
       VALUES (?, ?, ?, COALESCE((SELECT attempts FROM progress WHERE user_id = ? AND challenge_id = ?), 0) + 1, ?, ?)`,
      [userId, challengeId, completed, userId, challengeId, successfulPayload, completed ? new Date().toISOString() : null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update progress' });
        }
        
        res.json({ success: true });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get leaderboard
router.get('/leaderboard/top/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const db = getDatabase();
    
    db.all(
      `SELECT user_id, 
              COUNT(*) as completed_challenges,
              SUM(CASE 
                WHEN challenge_id LIKE 'basic-%' THEN 100
                WHEN challenge_id LIKE 'intermediate-%' THEN 200
                WHEN challenge_id LIKE 'advanced-%' THEN 400
                ELSE 0
              END) as total_points
       FROM progress 
       WHERE completed = 1 
       GROUP BY user_id 
       ORDER BY total_points DESC, completed_challenges DESC 
       LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json(rows);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
