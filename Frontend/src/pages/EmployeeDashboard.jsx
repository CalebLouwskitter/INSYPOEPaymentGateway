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
    backgroundColor: '#F9FAFB',
  };

  const contentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  };

  const headerStyle = {
    marginBottom: '2rem',
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    fontSize: '1rem',
    color: '#6B7280',
  };

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const statCardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const statNumberStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#8B5CF6',
  };

  const statLabelStyle = {
    fontSize: '0.9rem',
    color: '#6B7280',
    marginTop: '0.5rem',
  };

  const messageStyle = (isError) => ({
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    backgroundColor: isError ? '#FEE2E2' : '#D1FAE5',
    border: `1px solid ${isError ? '#EF4444' : '#10B981'}`,
    color: isError ? '#EF4444' : '#065F46',
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
          <div style={statCardStyle}>
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
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#6B7280' }}>Loading payments...</p>
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
