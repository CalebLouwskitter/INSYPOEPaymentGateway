import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
import EmployeeNavigation from '../components/EmployeeNavigation';
import PaymentTable from '../components/PaymentTable';
import Icon from '../components/Icon';
import employeePaymentService from '../services/employeePaymentService';
import {
  COLORS,
  SPACING,
  BORDERS,
  TYPOGRAPHY,
  SHADOWS,
  MESSAGE_STYLES,
  LOADING_STYLES
} from '../constants/styles.js';

// References:
// React Team. (2025) useEffect - React. Available at: https://react.dev/reference/react/useEffect (Accessed: 03 November 2025).
// React Team. (2025) useCallback - React. Available at: https://react.dev/reference/react/useCallback (Accessed: 04 November 2025).

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { isEmployeeAuthenticated, isAdmin } = useEmployeeAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/employee/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch pending payments with retry logic
  const fetchPendingPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await employeePaymentService.getPendingPayments();
      if (response.success) {
        setPayments(response.payments || []);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(response.message || 'Failed to load payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      const errorMessage = err.message || 'Failed to load pending payments';
      setError(errorMessage);
      
      // Auto-retry logic for network errors
      if (retryCount < 2 && errorMessage.includes('network')) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchPendingPayments();
        }, 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  // Initial data fetch
  useEffect(() => {
    if (isEmployeeAuthenticated && !isAdmin) {
      fetchPendingPayments();
    }
  }, [isEmployeeAuthenticated, isAdmin, fetchPendingPayments]);

  const handleApprove = async (paymentId) => {
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await employeePaymentService.processPayment(paymentId, 'approve');
      if (response.success) {
        setSuccessMessage('Payment approved successfully! ✓');
        // Remove the payment from the list optimistically
        setPayments(prev => prev.filter(p => p._id !== paymentId));
      } else {
        throw new Error(response.message || 'Failed to approve payment');
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      setError(err.message || 'Failed to approve payment');
      // Refresh data on error to ensure consistency
      fetchPendingPayments();
    }
  };

  const handleDeny = async (paymentId) => {
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await employeePaymentService.processPayment(paymentId, 'deny');
      if (response.success) {
        setSuccessMessage('Payment denied successfully! ✗');
        // Remove the payment from the list optimistically
        setPayments(prev => prev.filter(p => p._id !== paymentId));
      } else {
        throw new Error(response.message || 'Failed to deny payment');
      }
    } catch (err) {
      console.error('Error denying payment:', err);
      setError(err.message || 'Failed to deny payment');
      // Refresh data on error to ensure consistency
      fetchPendingPayments();
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchPendingPayments();
  };

  // Component styles using shared constants
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: COLORS.gray[50],
    padding: '0',
  };

  const contentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: SPACING.xl,
  };

  const headerStyle = {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.white,
    padding: `${SPACING.lg} ${SPACING.xl}`,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.md,
  };

  const titleStyle = {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  };

  const subtitleStyle = {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray[500],
  };

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  };

  const statCardStyle = {
    backgroundColor: COLORS.purple,
    padding: `${SPACING.lg} ${SPACING.md}`,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.md,
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  };

  const statNumberStyle = {
    fontSize: TYPOGRAPHY.fontSize['5xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  };

  const statLabelStyle = {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    marginTop: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    opacity: 0.95,
  };

  const errorActionStyle = {
    marginTop: SPACING.sm,
    display: 'flex',
    gap: SPACING.sm,
    alignItems: 'center',
  };

  const retryButtonStyle = {
    padding: `${SPACING.xs} ${SPACING.md}`,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: 'none',
    borderRadius: BORDERS.radius.sm,
    cursor: 'pointer',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    transition: 'all 0.2s ease',
  };

  if (!isEmployeeAuthenticated) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <EmployeeNavigation />
      
      <div style={contentStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <h1 style={titleStyle}>Pending Payments</h1>
          <p style={subtitleStyle}>
            Review and process customer payment requests
          </p>
        </header>

        {/* Stats */}
        <section style={statsContainerStyle} aria-label="Payment statistics">
          <div
            style={statCardStyle}
            onClick={fetchPendingPayments}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fetchPendingPayments();
              }
            }}
            aria-label="Refresh payments data"
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Icon name="pending_actions" size={32} title="Pending payments icon" />
              <div style={statNumberStyle}>{payments.length}</div>
              <div style={statLabelStyle}>Pending Payments</div>
            </div>
          </div>
        </section>

        {/* Success message */}
        {successMessage && (
          <div 
            style={MESSAGE_STYLES.container(false)}
            role="alert"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        {/* Error message with retry option */}
        {error && (
          <div 
            style={MESSAGE_STYLES.container(true)}
            role="alert"
            aria-live="assertive"
          >
            <div>{error}</div>
            <div style={errorActionStyle}>
              <button
                style={retryButtonStyle}
                onClick={handleRetry}
                onMouseEnter={(e) => e.target.style.backgroundColor = COLORS.secondary}
                onMouseLeave={(e) => e.target.style.backgroundColor = COLORS.primary}
                disabled={loading}
                aria-label="Retry loading payments"
              >
                {loading ? 'Retrying...' : 'Retry'}
              </button>
              {retryCount > 0 && (
                <span style={{ 
                  fontSize: TYPOGRAPHY.fontSize.xs, 
                  color: COLORS.gray[600],
                  fontStyle: 'italic'
                }}>
                  Attempt {retryCount}/3
                </span>
              )}
            </div>
          </div>
        )}

        {/* Loading state with enhanced feedback */}
        {loading && (
          <div style={LOADING_STYLES.container} role="status" aria-live="polite">
            <div style={LOADING_STYLES.icon}>
              {retryCount > 0 ? (
                <Icon name="autorenew" size={40} title="Retrying" />
              ) : (
                <Icon name="hourglass_top" size={40} title="Loading" />
              )}
            </div>
            <p style={LOADING_STYLES.text}>
              {retryCount > 0 ? `Retrying... (${retryCount}/3)` : 'Loading payments...'}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && payments.length === 0 && (
          <div style={{
            ...LOADING_STYLES.container,
            backgroundColor: COLORS.white,
            color: COLORS.gray[500]
          }} role="status">
            <div style={{ fontSize: TYPOGRAPHY.fontSize['5xl'], marginBottom: SPACING.md }}>
              <Icon name="task_alt" size={40} title="All caught up" />
            </div>
            <h2 style={{ 
              fontSize: TYPOGRAPHY.fontSize['2xl'], 
              marginBottom: SPACING.sm,
              color: COLORS.gray[600]
            }}>
              All Caught Up!
            </h2>
            <p style={{ 
              fontSize: TYPOGRAPHY.fontSize.base,
              color: COLORS.gray[500],
              marginBottom: SPACING.md
            }}>
              There are no pending payments to review at this time.
            </p>
            <button
              style={retryButtonStyle}
              onClick={fetchPendingPayments}
              aria-label="Refresh payments data"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Payments table */}
        {!loading && !error && payments.length > 0 && (
          <main>
            <PaymentTable
              payments={payments}
              onApprove={handleApprove}
              onDeny={handleDeny}
              showActions={true}
              isHistory={false}
            />
          </main>
        )}
      </div>
    </div>
  );
}
