import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user subscription details
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT subscription_plan, subscription_status, subscription_start_date, subscription_end_date FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Initiate subscription upgrade
router.post('/upgrade', authenticateToken, async (req, res) => {
  const { plan, upiId } = req.body;
  
  if (plan !== 'pro') {
    return res.status(400).json({ error: 'Invalid plan' });
  }
  
  try {
    const amount = 0; // Testing with 0 rupees
    
    // Create payment record
    const [result] = await pool.query(
      'INSERT INTO subscription_payments (user_id, plan, amount, payment_method, upi_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, plan, amount, 'upi', upiId, 'pending']
    );
    
    const paymentId = result.insertId;
    
    // Generate UPI payment link (for testing purposes)
    const upiLink = `upi://pay?pa=${upiId}&pn=ZeroDa&am=${amount}&cu=INR&tn=Subscription_${paymentId}`;
    
    res.json({ 
      paymentId,
      upiLink,
      message: 'Payment initiated'
    });
  } catch (error) {
    console.error('Error initiating subscription upgrade:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm payment (simulated for testing)
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  const { paymentId, transactionId } = req.body;
  
  try {
    // Update payment status
    await pool.query(
      'UPDATE subscription_payments SET status = ?, transaction_id = ? WHERE id = ? AND user_id = ?',
      ['completed', transactionId, paymentId, req.user.id]
    );
    
    // Get payment details
    const [payments] = await pool.query(
      'SELECT plan FROM subscription_payments WHERE id = ?',
      [paymentId]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const plan = payments[0].plan;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
    
    // Update user subscription
    await pool.query(
      'UPDATE users SET subscription_plan = ?, subscription_status = ?, subscription_start_date = ?, subscription_end_date = ? WHERE id = ?',
      [plan, 'active', startDate, endDate, req.user.id]
    );
    
    res.json({ 
      message: 'Subscription activated successfully',
      plan,
      endDate
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment history
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const [payments] = await pool.query(
      'SELECT * FROM subscription_payments WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;