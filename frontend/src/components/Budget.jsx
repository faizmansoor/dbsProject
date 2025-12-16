import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Budget({ apiUrl, stats }) {
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [inputBudget, setInputBudget] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/budget`);
      const budget = parseFloat(response.data.monthlyBudget) || 0;
      setMonthlyBudget(budget);
      setInputBudget(budget.toString());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budget:', error);
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    try {
      const budgetValue = parseFloat(inputBudget) || 0;
      await axios.put(`${apiUrl}/auth/budget`, { monthlyBudget: budgetValue });
      setMonthlyBudget(budgetValue);
      alert('Budget updated successfully!');
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget');
    }
  };

  const budgetUsed = monthlyBudget > 0 ? (stats.totalExpenses / monthlyBudget) * 100 : 0;
  const remaining = monthlyBudget - stats.totalExpenses;

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading budget information...</p>
      </div>
    );
  }

  return (
    <div className="budget-container">
      <h2 className="budget-title">🎯 Budget Management</h2>

      <div className="budget-section">
        <h3>Set Monthly Budget</h3>
        <form onSubmit={handleUpdateBudget}>
          <div className="budget-input-group">
            <input
              type="number"
              step="0.01"
              min="0"
              value={inputBudget}
              onChange={(e) => setInputBudget(e.target.value)}
              placeholder="Enter monthly budget"
              required
              className="budget-input"
            />
            <button type="submit" className="btn btn-primary">
              Update Budget
            </button>
          </div>
        </form>
      </div>

      {monthlyBudget > 0 ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Monthly Budget</h3>
              <p>₹{monthlyBudget.toFixed(2)}</p>
            </div>
            <div className={`stat-card ${budgetUsed > 90 ? 'warning' : 'success'}`}>
              <h3>Budget Used</h3>
              <p>{budgetUsed.toFixed(1)}%</p>
            </div>
            <div className={`stat-card ${remaining < 0 ? 'warning' : 'success'}`}>
              <h3>Remaining</h3>
              <p>₹{remaining.toFixed(2)}</p>
            </div>
          </div>

          <div className="chart-card">
            <h3>Budget Progress</h3>
            <div className="budget-progress-container">
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${
                    budgetUsed > 90 ? 'danger' : 
                    budgetUsed > 70 ? 'warning' : 
                    'success'
                  }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                >
                  {budgetUsed > 10 && `${budgetUsed.toFixed(1)}%`}
                </div>
              </div>
              
              <div className="budget-alerts">
                {budgetUsed > 100 && (
                  <div className="alert alert-danger">
                    ⚠️ You've exceeded your budget by ₹{Math.abs(remaining).toFixed(2)}!
                  </div>
                )}
                {budgetUsed > 90 && budgetUsed <= 100 && (
                  <div className="alert alert-warning">
                    ⚡ Warning: You're approaching your budget limit!
                  </div>
                )}
                {budgetUsed > 0 && budgetUsed <= 70 && (
                  <div className="alert alert-success">
                    ✅ Great job! You're well within your budget.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="chart-card">
          <div className="empty-state">
            <p>📊 Set a monthly budget above to start tracking your spending!</p>
          </div>
        </div>
      )}

      <div className="chart-card budget-tips">
        <h3>💡 Budget Tips</h3>
        <div className="tips-content">
          <ul>
            <li>Set a realistic budget based on your income and essential expenses</li>
            <li>Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
            <li>Review and adjust your budget monthly based on spending patterns</li>
            <li>Use budget alerts to stay on track throughout the month</li>
            <li>Build an emergency fund covering 3-6 months of expenses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Budget;