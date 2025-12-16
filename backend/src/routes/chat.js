import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 50',
      [req.user.id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save chat message
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message, role } = req.body;

    const [result] = await pool.query(
      'INSERT INTO chat_messages (user_id, message, role) VALUES (?, ?, ?)',
      [req.user.id, message, role]
    );

    const [newMessage] = await pool.query(
      'SELECT * FROM chat_messages WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear chat history
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM chat_messages WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate AI response (mock for now - integrate with real AI API later)
router.post('/ai-response', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    // Get user's transaction data for context
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 20',
      [req.user.id]
    );

    const [stats] = await pool.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
       FROM transactions WHERE user_id = ?`,
      [req.user.id]
    );

    // Mock AI response based on context
    let aiResponse = generateAIResponse(message, transactions, stats[0]);

    // Save both messages
    await pool.query(
      'INSERT INTO chat_messages (user_id, message, role) VALUES (?, ?, ?), (?, ?, ?)',
      [req.user.id, message, 'user', req.user.id, aiResponse, 'assistant']
    );

    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple AI response generator (replace with real AI API)
function generateAIResponse(message, transactions, stats) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('spending') || lowerMessage.includes('spend')) {
    return `Based on your data, you've spent ₹${stats.total_expenses || 0} in total. Your recent transactions show you're spending mostly on ${getMostFrequentCategory(transactions)}.`;
  }

  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    const savings = (stats.total_income || 0) - (stats.total_expenses || 0);
    return `You've saved ₹${savings} so far. ${savings > 0 ? 'Great job! Keep it up!' : 'Consider reducing expenses to save more.'}`;
  }

  if (lowerMessage.includes('budget')) {
    return `I can help you manage your budget! You can set a monthly budget in the Budget tab. Would you like tips on budgeting?`;
  }

  if (lowerMessage.includes('income')) {
    return `Your total income is ₹${stats.total_income || 0}. Add more income transactions to track your earnings better!`;
  }

  return `I'm your financial assistant! I can help you with:\n- Analyzing your spending patterns\n- Budget recommendations\n- Savings tips\n- Transaction insights\n\nWhat would you like to know?`;
}

function getMostFrequentCategory(transactions) {
  if (!transactions || transactions.length === 0) return 'various categories';
  
  const categories = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      categories[t.category] = (categories[t.category] || 0) + 1;
    }
  });

  const mostFrequent = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  return mostFrequent ? mostFrequent[0] : 'various categories';
}

export default router;