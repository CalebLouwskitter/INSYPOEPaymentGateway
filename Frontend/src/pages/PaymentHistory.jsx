import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
import EmployeeNavigation from '../components/EmployeeNavigation';
import PaymentTable from '../components/PaymentTable';
import employeePaymentService from '../services/employeePaymentService';

// References:
// React Team. (2025) useEffect - React. Available at: https://react.dev/reference/react/useEffect (Accessed: 03 November 2025).

export default function PaymentHistory() {
  const navigate = useNavigate();
  const { isEmployeeAuthenticated, isAdmin } = useEmployeeAuth();
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

  const filterContainerStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  };

  const filterButtonStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    backgroundColor: isActive ? '#8B5CF6' : 'white',
    color: isActive ? 'white' : '#6B7280',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
  });

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
      <EmployeeNavigation />
      
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Payment History</h1>
          <p style={subtitleStyle}>
            View all previously processed payments
          </p>
        </div>

        {/* Stats */}
        <div style={statsContainerStyle}>
          <div style={statCardStyle('#8B5CF6')}>
            <div style={statNumberStyle('#8B5CF6')}>{totalCount}</div>
            <div style={statLabelStyle}>Total Processed</div>
          </div>
          <div style={statCardStyle('#10B981')}>
            <div style={statNumberStyle('#10B981')}>{approvedCount}</div>
            <div style={statLabelStyle}>Approved</div>
          </div>
          <div style={statCardStyle('#EF4444')}>
            <div style={statNumberStyle('#EF4444')}>{deniedCount}</div>
            <div style={statLabelStyle}>Denied</div>
          </div>
        </div>

        {/* Filter buttons */}
        <div style={filterContainerStyle}>
          <button
            style={filterButtonStyle(filterStatus === 'all')}
            onClick={() => setFilterStatus('all')}
            onMouseEnter={(e) => {
              if (filterStatus !== 'all') {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== 'all') {
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            All ({totalCount})
          </button>
          <button
            style={filterButtonStyle(filterStatus === 'approved')}
            onClick={() => setFilterStatus('approved')}
            onMouseEnter={(e) => {
              if (filterStatus !== 'approved') {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== 'approved') {
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            Approved ({approvedCount})
          </button>
          <button
            style={filterButtonStyle(filterStatus === 'denied')}
            onClick={() => setFilterStatus('denied')}
            onMouseEnter={(e) => {
              if (filterStatus !== 'denied') {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== 'denied') {
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            Denied ({deniedCount})
          </button>
        </div>

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
