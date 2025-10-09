import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PaymentPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'ZAR',
    provider: 'SWIFT',
    recipientAccount: '',
    recipientSWIFT: ''
  });

  const [message, setMessage] = useState('');

  const PRIMARY_COLOR = '#8B5CF6';
  const BUTTON_COLOR = '#4F46E5';
  const DARK_TEXT = '#1F2937';

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
    setMessage('');
  };

  const handlePayment = (e) => {
    e.preventDefault();

    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
      setMessage('Please enter a valid amount.');
      return;
    }

    if (!paymentData.recipientAccount || !paymentData.recipientSWIFT) {
      setMessage('Recipient account and SWIFT code are required.');
      return;
    }

    // Simulate transaction storage
    console.log('Payment submitted:', {
      userId: user.idNumber,
      ...paymentData
    });

    setMessage(`Payment of ${paymentData.currency} ${paymentData.amount} submitted successfully!`);

    // Reset payment form
    setPaymentData({
      amount: '',
      currency: 'ZAR',
      provider: 'SWIFT',
      recipientAccount: '',
      recipientSWIFT: ''
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '10px',
    boxSizing: 'border-box',
    backgroundColor: '#F3F4F6',
    border: '1px solid #D1D5DB',
    color: DARK_TEXT,
    marginBottom: '15px',
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(135deg, #1a0f3d 0%, #3f2f70 100%)',
      color: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px'
    }}>
      <div style={{
        backgroundColor: 'white',
        color: DARK_TEXT,
        padding: '40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
      }}>
        <h1 style={{ fontSize: '2.5em', fontWeight: '900', color: PRIMARY_COLOR, marginBottom: '10px' }}>
          Payment Portal
        </h1>
        <p style={{ marginBottom: '30px' }}>Welcome, {user.fullName || 'Customer'}!</p>

        <div style={{
          marginBottom: '30px',
          padding: '20px',
          borderRadius: '15px',
          backgroundColor: '#F3F4F6',
          color: DARK_TEXT,
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5em', marginBottom: '15px' }}>Account Details</h2>
          <p><strong>ID Number:</strong> {user.idNumber}</p>
          <p><strong>Account Number:</strong> {user.accountNumber}</p>
          <p><strong>Balance:</strong> ${user.balance}</p>
        </div>

        <form onSubmit={handlePayment}>
          <h2 style={{ fontSize: '1.5em', marginBottom: '15px' }}>Make a Payment</h2>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={paymentData.amount}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <select
            name="currency"
            value={paymentData.currency}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="ZAR">ZAR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <select
            name="provider"
            value={paymentData.provider}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="SWIFT">SWIFT</option>
            {/* Add more providers here */}
          </select>
          <input
            type="text"
            name="recipientAccount"
            placeholder="Recipient Account Number"
            value={paymentData.recipientAccount}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            type="text"
            name="recipientSWIFT"
            placeholder="Recipient SWIFT Code"
            value={paymentData.recipientSWIFT}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          {message && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: BUTTON_COLOR,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: `0 4px 10px rgba(79, 70, 229, 0.5)`,
              marginTop: '10px'
            }}
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}
