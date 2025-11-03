import { useState } from 'react';

// References:
// React Team. (2025) useState - React. Available at: https://react.dev/reference/react/useState (Accessed: 03 November 2025).

/**
 * Reusable payment table component
 * Displays payments with optional action buttons
 */
export default function PaymentTable({ payments, onApprove, onDeny, showActions = true, isHistory = false }) {
  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (paymentId, action) => {
    setProcessingId(paymentId);
    try {
      if (action === 'approve' && onApprove) {
        await onApprove(paymentId);
      } else if (action === 'deny' && onDeny) {
        await onDeny(paymentId);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const thStyle = {
    backgroundColor: '#374151',
    color: 'white',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.9rem',
  };

  const tdStyle = {
    padding: '1rem',
    borderBottom: '1px solid #E5E7EB',
    fontSize: '0.9rem',
    color: '#1F2937',
  };

  const buttonStyle = (color, disabled = false) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    backgroundColor: disabled ? '#9CA3AF' : color,
    color: 'white',
    marginRight: '0.5rem',
    transition: 'opacity 0.3s',
  });

  const statusBadgeStyle = (status) => {
    const colors = {
      pending: { bg: '#FEF3C7', color: '#92400E' },
      approved: { bg: '#D1FAE5', color: '#065F46' },
      denied: { bg: '#FEE2E2', color: '#991B1B' },
    };
    const style = colors[status] || { bg: '#F3F4F6', color: '#1F2937' };
    
    return {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: style.bg,
      color: style.color,
      display: 'inline-block',
    };
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency || 'ZAR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!payments || payments.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
        <p style={{ fontSize: '1.1rem', color: '#6B7280' }}>
          {isHistory ? 'No payment history found' : 'No pending payments at this time'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Transaction ID</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Method</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Date</th>
            {isHistory && <th style={thStyle}>Processed By</th>}
            {isHistory && <th style={thStyle}>Processed At</th>}
            {showActions && <th style={thStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id}>
              <td style={tdStyle}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {payment.transactionId}
                </span>
              </td>
              <td style={tdStyle}>
                <div>
                  <div style={{ fontWeight: '600' }}>{payment.userId?.fullName || 'N/A'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    {payment.userId?.accountNumber || 'N/A'}
                  </div>
                </div>
              </td>
              <td style={tdStyle}>
                <span style={{ fontWeight: '600' }}>
                  {formatCurrency(payment.amount, payment.currency)}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ textTransform: 'capitalize' }}>
                  {payment.paymentMethod?.replace(/_/g, ' ')}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={statusBadgeStyle(payment.status)}>
                  {payment.status.toUpperCase()}
                </span>
              </td>
              <td style={tdStyle}>
                {formatDate(payment.createdAt)}
              </td>
              {isHistory && (
                <td style={tdStyle}>
                  {payment.processedBy?.username || 'System'}
                </td>
              )}
              {isHistory && (
                <td style={tdStyle}>
                  {payment.processedAt ? formatDate(payment.processedAt) : 'N/A'}
                </td>
              )}
              {showActions && (
                <td style={tdStyle}>
                  <button
                    onClick={() => handleAction(payment._id, 'approve')}
                    disabled={processingId === payment._id}
                    style={buttonStyle('#10B981', processingId === payment._id)}
                    onMouseEnter={(e) => {
                      if (processingId !== payment._id) {
                        e.target.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (processingId !== payment._id) {
                        e.target.style.opacity = '1';
                      }
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleAction(payment._id, 'deny')}
                    disabled={processingId === payment._id}
                    style={buttonStyle('#EF4444', processingId === payment._id)}
                    onMouseEnter={(e) => {
                      if (processingId !== payment._id) {
                        e.target.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (processingId !== payment._id) {
                        e.target.style.opacity = '1';
                      }
                    }}
                  >
                    ✗ Deny
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
