import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PaymentDashboard() {
  const navigate = useNavigate();
  const { userInfo, logout, updateBalance } = useAuth();

  // State for payment form
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'ZAR',
    provider: 'SWIFT',
    recipientName: '',
    recipientAccount: '',
    swiftCode: ''
  });

  // State for transaction history
  const [transactions, setTransactions] = useState([
    { 
      id: 1, 
      date: '2025-10-07', 
      recipientName: 'Jane Smith',
      recipientAccount: '9876543210',
      amount: 5000, 
      currency: 'ZAR', 
      status: 'Completed',
      swiftCode: 'ABCDZAJJ'
    },
    { 
      id: 2, 
      date: '2025-10-05', 
      recipientName: 'Bob Johnson',
      recipientAccount: '5555666677',
      amount: 2500, 
      currency: 'ZAR', 
      status: 'Completed',
      swiftCode: 'SBZAZAJJ'
    },
    { 
      id: 3, 
      date: '2025-10-03', 
      recipientName: 'ABC Corp',
      recipientAccount: '1111222233',
      amount: 15000, 
      currency: 'USD', 
      status: 'Pending',
      swiftCode: 'FIRNZAJJ'
    }
  ]);

  // Handle input changes for payment form
  const handleInputChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount
    if (parseFloat(paymentData.amount) > userInfo.balance) {
      alert('Insufficient funds!');
      return;
    }

    // Validate all fields are filled
    if (!paymentData.amount || !paymentData.recipientName || 
        !paymentData.recipientAccount || !paymentData.swiftCode) {
      alert('Please fill in all fields!');
      return;
    }

    // Confirm payment
    if (window.confirm(
      `Confirm Payment:\n\nRecipient: ${paymentData.recipientName}\nAccount: ${paymentData.recipientAccount}\nAmount: ${paymentData.currency} ${parseFloat(paymentData.amount).toLocaleString()}\nSWIFT Code: ${paymentData.swiftCode}\n\nProceed with payment?`
    )) {
      // Create new transaction
      const newTransaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split('T')[0],
        recipientName: paymentData.recipientName,
        recipientAccount: paymentData.recipientAccount,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        status: 'Pending',
        swiftCode: paymentData.swiftCode
      };

      // Add to transactions
      setTransactions([newTransaction, ...transactions]);

      // Update balance in AuthContext
      const newBalance = userInfo.balance - parseFloat(paymentData.amount);
      updateBalance(newBalance);

      // In a real app, you would send this to your API
      // await createPayment(paymentData);

      alert('Payment submitted successfully!');

      // Reset form
      handleReset();
    }
  };

  // Handle form reset
  const handleReset = () => {
    setPaymentData({
      amount: '',
      currency: 'ZAR',
      provider: 'SWIFT',
      recipientName: '',
      recipientAccount: '',
      swiftCode: ''
    });
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0' }}>💳 SecurePay Dashboard</h1>
          <p style={{ margin: '5px 0' }}>Welcome, {userInfo.fullName}</p>
          <p style={{ margin: '5px 0' }}>Account: {userInfo.accountNumber}</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Account Balance Section */}
      <div style={{
        backgroundColor: '#10B981',
        color: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Available Balance</h2>
        <h1 style={{ margin: '0', fontSize: '48px' }}>
          R {userInfo.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
        </h1>
      </div>

      {/* Make Payment Section */}
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ddd'
      }}>
        <h2>💸 Make a Payment</h2>
        <form onSubmit={handlePaymentSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Payment Amount:
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              value={paymentData.amount}
              onChange={handleInputChange}
              required
              min="0.01"
              step="0.01"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Currency:
            </label>
            <select
              name="currency"
              value={paymentData.currency}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            >
              <option value="ZAR">ZAR (South African Rand)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Payment Provider:
            </label>
            <select
              name="provider"
              value={paymentData.provider}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            >
              <option value="SWIFT">SWIFT</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Recipient Name:
            </label>
            <input
              type="text"
              name="recipientName"
              placeholder="Enter recipient name"
              value={paymentData.recipientName}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Recipient Account Number:
            </label>
            <input
              type="text"
              name="recipientAccount"
              placeholder="Enter account number"
              value={paymentData.recipientAccount}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              SWIFT Code:
            </label>
            <input
              type="text"
              name="swiftCode"
              placeholder="Enter SWIFT code (e.g., ABCDZAJJ)"
              value={paymentData.swiftCode}
              onChange={handleInputChange}
              required
              pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
              title="Please enter a valid SWIFT code"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Pay Now
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Transaction History Section */}
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2>📋 Transaction History</h2>
        <table border="1" style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: 'white'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#4F46E5', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Recipient Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Account Number</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>SWIFT Code</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '12px', textAlign: 'center' }}>
                  No transactions available.
                </td>
              </tr>
            )}
            {transactions.map((transaction) => (
              <tr key={transaction.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{transaction.date}</td>
                <td style={{ padding: '12px' }}>{transaction.recipientName}</td>
                <td style={{ padding: '12px' }}>{transaction.recipientAccount}</td>
                <td style={{ padding: '12px' }}>{transaction.swiftCode}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                  {transaction.currency} {transaction.amount.toLocaleString()}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  color: transaction.status === 'Completed' ? '#10B981' : '#F59E0B',
                  fontWeight: 'bold'
                }}>
                  {transaction.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}