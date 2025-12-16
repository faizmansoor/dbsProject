import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT dark_mode FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ darkMode: users[0].dark_mode });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update dark mode setting
router.put('/dark-mode', authenticateToken, async (req, res) => {
  const { darkMode } = req.body;
  
  try {
    await pool.query(
      'UPDATE users SET dark_mode = ? WHERE id = ?',
      [darkMode, req.user.id]
    );
    
    res.json({ message: 'Dark mode setting updated', darkMode });
  } catch (error) {
    console.error('Error updating dark mode:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;