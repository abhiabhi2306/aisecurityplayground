const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');

// Create or get user
router.post('/user', async (req, res) => {
  try {
    const { userId } = req.body;
    const db = getDatabase();
    
    if (userId) {
      // Update last active for existing user
      db.run(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ userId });
        }
      );
    } else {
      // Create new user
      const newUserId = uuidv4();
      db.run(
        'INSERT INTO users (id) VALUES (?)',
        [newUserId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }
          res.json({ userId: newUserId });
        }
      );
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle user' });
  }
});

// Get user statistics
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    // Get completion stats
    db.get(
      `SELECT 
        COUNT(*) as total_challenges_completed,
        COUNT(CASE WHEN challenge_id LIKE 'basic-%' THEN 1 END) as basic_completed,
        COUNT(CASE WHEN challenge_id LIKE 'intermediate-%' THEN 1 END) as intermediate_completed,
        COUNT(CASE WHEN challenge_id LIKE 'advanced-%' THEN 1 END) as advanced_completed,
        SUM(CASE 
          WHEN challenge_id LIKE 'basic-%' THEN 100
          WHEN challenge_id LIKE 'intermediate-%' THEN 250
          WHEN challenge_id LIKE 'advanced-%' THEN 500
          ELSE 0
        END) as total_points
       FROM progress 
       WHERE user_id = ? AND completed = 1`,
      [userId],
      (err, completionRow) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Get attempt stats
        db.get(
          `SELECT 
            COUNT(*) as total_attempts,
            COUNT(CASE WHEN success = 1 THEN 1 END) as successful_attempts
           FROM attempts 
           WHERE user_id = ?`,
          [userId],
          (err, attemptRow) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            const stats = {
              completedChallenges: completionRow.total_challenges_completed || 0,
              basicCompleted: completionRow.basic_completed || 0,
              intermediateCompleted: completionRow.intermediate_completed || 0,
              advancedCompleted: completionRow.advanced_completed || 0,
              totalPoints: completionRow.total_points || 0,
              totalAttempts: attemptRow.total_attempts || 0,
              successfulAttempts: attemptRow.successful_attempts || 0,
              successRate: attemptRow.total_attempts > 0 
                ? ((attemptRow.successful_attempts / attemptRow.total_attempts) * 100).toFixed(1)
                : 0
            };
            
            res.json(stats);
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Get recent activity
router.get('/user/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit || 10;
    const db = getDatabase();
    
    db.all(
      `SELECT 
        challenge_id,
        payload,
        success,
        attempted_at
       FROM attempts 
       WHERE user_id = ? 
       ORDER BY attempted_at DESC 
       LIMIT ?`,
      [userId, limit],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json(rows);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Get global statistics
router.get('/stats/global', async (req, res) => {
  try {
    const db = getDatabase();
    
    db.get(
      `SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN success = 1 THEN 1 END) as successful_attempts,
        COUNT(CASE WHEN challenge_id LIKE 'basic-%' AND success = 1 THEN 1 END) as basic_successes,
        COUNT(CASE WHEN challenge_id LIKE 'intermediate-%' AND success = 1 THEN 1 END) as intermediate_successes,
        COUNT(CASE WHEN challenge_id LIKE 'advanced-%' AND success = 1 THEN 1 END) as advanced_successes
       FROM attempts`,
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        const globalStats = {
          totalUsers: row.total_users || 0,
          totalAttempts: row.total_attempts || 0,
          successfulAttempts: row.successful_attempts || 0,
          globalSuccessRate: row.total_attempts > 0 
            ? ((row.successful_attempts / row.total_attempts) * 100).toFixed(1)
            : 0,
          basicSuccesses: row.basic_successes || 0,
          intermediateSuccesses: row.intermediate_successes || 0,
          advancedSuccesses: row.advanced_successes || 0
        };
        
        res.json(globalStats);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global stats' });
  }
});

module.exports = router;
