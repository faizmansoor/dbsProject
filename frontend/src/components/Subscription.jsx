import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Subscription({ apiUrl }) {
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchPayments();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/subscription/status`);
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${apiUrl}/subscription/payments`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!upiId) {
      alert('Please enter your UPI ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/subscription/upgrade`, {
        plan: 'pro',
        upiId
      });
      
      setCurrentPaymentId(response.data.paymentId);
      setPaymentModal(true);
      alert('Payment initiated! Since this is a test with ₹0, please enter any transaction ID to confirm.');
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to initiate upgrade');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!transactionId) {
      alert('Please enter transaction ID');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${apiUrl}/subscription/confirm-payment`, {
        paymentId: currentPaymentId,
        transactionId
      });
      
      alert('Subscription upgraded successfully!');
      setPaymentModal(false);
      setShowUpgrade(false);
      setTransactionId('');
      fetchSubscriptionStatus();
      fetchPayments();
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-container">
      <h2>Subscription Management</h2>
      
      {subscription && (
        <div className="current-plan">
          <h3>Current Plan</h3>
          <div className={`plan-badge ${subscription.subscription_plan}`}>
            {subscription.subscription_plan === 'pro' ? '⭐ PRO' : '🆓 FREE'}
          </div>
          <p>Status: <strong>{subscription.subscription_status}</strong></p>
          {subscription.subscription_end_date && (
            <p>Valid until: {new Date(subscription.subscription_end_date).toLocaleDateString()}</p>
          )}
        </div>
      )}

      <div className="plans-grid">
        <div className="plan-card free">
          <h3>🆓 Free Plan</h3>
          <div className="price">₹0/month</div>
          <ul className="features">
            <li>✓ Basic transaction tracking</li>
            <li>✓ Budget management</li>
            <li>✓ Profile settings</li>
            <li>✗ AI Chatbot</li>
            <li>✗ Advanced Analytics</li>
            <li>✗ Insights Dashboard</li>
          </ul>
          {subscription?.subscription_plan === 'free' && (
            <div className="current-badge">Current Plan</div>
          )}
        </div>

        <div className="plan-card pro">
          <h3>⭐ Pro Plan</h3>
          <div className="price">₹0/month <span className="test-badge">Testing</span></div>
          <ul className="features">
            <li>✓ Everything in Free</li>
            <li>✓ AI Financial Chatbot</li>
            <li>✓ Advanced Analytics</li>
            <li>✓ AI-Powered Insights</li>
            <li>✓ Spending Trends</li>
            <li>✓ Category Breakdown</li>
          </ul>
          {subscription?.subscription_plan === 'pro' ? (
            <div className="current-badge">Current Plan</div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={() => setShowUpgrade(true)}
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {showUpgrade && subscription?.subscription_plan !== 'pro' && (
        <div className="upgrade-section">
          <h3>Upgrade to Pro Plan</h3>
          <p>Pay via UPI (GPay, PhonePe, etc.)</p>
          <div className="form-group">
            <label>Enter your UPI ID</label>
            <input
              type="text"
              placeholder="yourname@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
          <div className="upgrade-actions">
            <button 
              className="btn btn-primary"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowUpgrade(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {paymentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Payment</h3>
            <p>This is a test payment (₹0). Enter any transaction ID to complete.</p>
            <div className="form-group">
              <label>Transaction ID</label>
              <input
                type="text"
                placeholder="Enter transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={confirmPayment}
                disabled={loading}
              >
                {loading ? 'Confirming...' : 'Confirm Payment'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setPaymentModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {payments.length > 0 && (
        <div className="payment-history">
          <h3>Payment History</h3>
          <div className="payments-list">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-item">
                <div>
                  <strong>{payment.plan.toUpperCase()}</strong> Plan
                  <p>{new Date(payment.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="amount">₹{Number(payment.amount).toFixed(2)}</span>
                  <span className={`status ${payment.status}`}>{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscription;