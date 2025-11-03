import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
import EmployeeNavigation from '../components/EmployeeNavigation';
import PaymentTable from '../components/PaymentTable';
import employeePaymentService from '../services/employeePaymentService';

// References:
// React Team. (2025) useEffect - React. Available at: https://react.dev/reference/react/useEffect (Accessed: 03 November 2025).

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { isEmployeeAuthenticated, isAdmin } = useEmployeeAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/employee/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Fetch pending payments
  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await employeePaymentService.getPendingPayments();
      if (response.success) {
        setPayments(response.payments || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    setError('');
    setSuccessMessage('');
    try {
      const response = await employeePaymentService.processPayment(paymentId, 'approve');
      if (response.success) {
        setSuccessMessage('Payment approved successfully! ✓');
        // Remove the payment from the list
        setPayments(payments.filter(p => p._id !== paymentId));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      setError(err.message || 'Failed to approve payment');
    }
  };

  const handleDeny = async (paymentId) => {
    setError('');
    setSuccessMessage('');
    try {
      const response = await employeePaymentService.processPayment(paymentId, 'deny');
      if (response.success) {
        setSuccessMessage('Payment denied successfully! ✗');
        // Remove the payment from the list
        setPayments(payments.filter(p => p._id !== paymentId));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error denying payment:', err);
      setError(err.message || 'Failed to deny payment');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '0',
  };

  const contentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  };

  const headerStyle = {
    marginBottom: '2rem',
    backgroundColor: 'white',
    padding: '1.5rem 2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#667eea',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    fontSize: '1rem',
    color: '#718096',
  };

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const statCardStyle = {
    backgroundColor: '#9F7AEA',
    padding: '1.75rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  };

  const statNumberStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
  };

  const statLabelStyle = {
    fontSize: '0.95rem',
    color: 'white',
    marginTop: '0.5rem',
    fontWeight: '500',
    opacity: 0.95,
  };

  const messageStyle = (isError) => ({
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    backgroundColor: isError ? '#FED7D7' : '#C6F6D5',
    border: `1px solid ${isError ? '#FC8181' : '#68D391'}`,
    color: isError ? '#C53030' : '#2F855A',
    fontWeight: '500',
  });

  if (!isEmployeeAuthenticated) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <EmployeeNavigation />
      
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Pending Payments</h1>
          <p style={subtitleStyle}>
            Review and process customer payment requests
          </p>
        </div>

        {/* Stats */}
        <div style={statsContainerStyle}>
          <div 
            style={statCardStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={statNumberStyle}>{payments.length}</div>
            <div style={statLabelStyle}>Pending Payments</div>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div style={messageStyle(false)}>
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={messageStyle(true)}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#718096', fontSize: '1rem', fontWeight: '500' }}>Loading payments...</p>
          </div>
        )}

        {/* Payments table */}
        {!loading && (
          <PaymentTable
            payments={payments}
            onApprove={handleApprove}
            onDeny={handleDeny}
            showActions={true}
            isHistory={false}
          />
        )}
      </div>
    </div>
  );
}
