import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
// import EmployeeNavigation from '../components/EmployeeNavigation';
import PaymentTable from '../components/PaymentTable';
import employeePaymentService from '../services/employeePaymentService';
import { COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLES } from '../constants/styles.js';

// References:
// React Team. (2025) useEffect - React. Available at: https://react.dev/reference/react/useEffect (Accessed: 03 November 2025).

export default function PaymentHistory() {
  const navigate = useNavigate();
  const { isEmployeeAuthenticated, isAdmin, employeeUser, employeeLogout } = useEmployeeAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'denied'

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/employee/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Fetch payment history
  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await employeePaymentService.getPaymentHistory();
      if (response.success) {
        setPayments(response.payments || []);
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
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
    backgroundColor: 'white',
    padding: '1.5rem 2rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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

  const statCardStyle = (color) => ({
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`,
  });

  const statNumberStyle = (color) => ({
    fontSize: '2rem',
    fontWeight: 'bold',
    color: color,
  });

  const statLabelStyle = {
    fontSize: '0.9rem',
    color: '#6B7280',
    marginTop: '0.5rem',
  };

  const messageStyle = {
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    backgroundColor: '#FEE2E2',
    border: '1px solid #EF4444',
    color: '#EF4444',
  };

  // Filter payments based on selected status
  const filteredPayments = filterStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  // Calculate stats
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const deniedCount = payments.filter(p => p.status === 'denied').length;
  const totalCount = payments.length;

  if (!isEmployeeAuthenticated) {
    return null;
  }

  return (
    <div style={containerStyle}>
      
      <div style={contentStyle}>
        {/* Integrated Header with actions */}
        <div style={{
          ...headerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <h1 style={titleStyle}>Payment History</h1>
            <p style={subtitleStyle}>
              View all previously processed payments
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md, flexWrap: 'wrap' }}>
            <span style={{ color: COLORS.gray[600], fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
              {employeeUser?.username} · {isAdmin ? 'Admin' : 'Employee'}
            </span>
            <button
              style={BUTTON_STYLES.secondary()}
              onClick={() => navigate('/employee/dashboard')}
              aria-label="Go to Pending Payments"
            >
              Pending Payments
            </button>
            <button
              style={BUTTON_STYLES.primary()}
              onClick={() => navigate('/employee/history')}
              aria-label="Go to Payment History"
              aria-current="page"
            >
              Payment History
            </button>
            <button
              style={BUTTON_STYLES.danger()}
              onClick={async () => { await employeeLogout(); navigate('/employee/login', { replace: true }); }}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats (clickable to filter) */}
        <div style={statsContainerStyle}>
          <div
            style={{
              ...statCardStyle('#8B5CF6'),
              cursor: 'pointer',
              boxShadow: filterStatus === 'all' ? '0 4px 12px rgba(139,92,246,0.25)' : '0 2px 8px rgba(0,0,0,0.1)',
              borderLeftWidth: filterStatus === 'all' ? '6px' : '4px'
            }}
            onClick={() => setFilterStatus('all')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFilterStatus('all');
              }
            }}
            aria-pressed={filterStatus === 'all'}
            aria-label="Show all payments"
         >
            <div style={statNumberStyle('#8B5CF6')}>{totalCount}</div>
            <div style={statLabelStyle}>Total Processed</div>
          </div>
          <div
            style={{
              ...statCardStyle('#10B981'),
              cursor: 'pointer',
              boxShadow: filterStatus === 'approved' ? '0 4px 12px rgba(16,185,129,0.25)' : '0 2px 8px rgba(0,0,0,0.1)',
              borderLeftWidth: filterStatus === 'approved' ? '6px' : '4px'
            }}
            onClick={() => setFilterStatus('approved')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFilterStatus('approved');
              }
            }}
            aria-pressed={filterStatus === 'approved'}
            aria-label="Show approved payments"
          >
            <div style={statNumberStyle('#10B981')}>{approvedCount}</div>
            <div style={statLabelStyle}>Approved</div>
          </div>
          <div
            style={{
              ...statCardStyle('#EF4444'),
              cursor: 'pointer',
              boxShadow: filterStatus === 'denied' ? '0 4px 12px rgba(239,68,68,0.25)' : '0 2px 8px rgba(0,0,0,0.1)',
              borderLeftWidth: filterStatus === 'denied' ? '6px' : '4px'
            }}
            onClick={() => setFilterStatus('denied')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFilterStatus('denied');
              }
            }}
            aria-pressed={filterStatus === 'denied'}
            aria-label="Show denied payments"
          >
            <div style={statNumberStyle('#EF4444')}>{deniedCount}</div>
            <div style={statLabelStyle}>Denied</div>
          </div>
        </div>

        {/* Filter buttons removed in favor of clickable stat cards */}

        {/* Error message */}
        {error && (
          <div style={messageStyle}>
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
            <p style={{ color: '#6B7280' }}>Loading payment history...</p>
          </div>
        )}

        {/* Payments table */}
        {!loading && (
          <PaymentTable
            payments={filteredPayments}
            showActions={false}
            isHistory={true}
          />
        )}
      </div>
    </div>
  );
}
