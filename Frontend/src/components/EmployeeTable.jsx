import { useState } from 'react';
import PropTypes from 'prop-types';

// References:
// React Team. (2025) useState - React. Available at: https://react.dev/reference/react/useState (Accessed: 03 November 2025).

/**
 * Reusable employee table component
 * Displays employees with delete action
 */
export default function EmployeeTable({ employees, onDelete, currentUserId }) {
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
      setDeletingId(employeeId);
      try {
        await onDelete(employeeId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Glass card container to wrap search + table
  const cardStyle = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.55) 100%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 14px 30px rgba(0,0,0,0.12)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  };

  const thStyle = {
    background: 'linear-gradient(135deg, rgba(45,55,72,0.96) 0%, rgba(102,126,234,0.9) 100%)',
    color: 'white',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '700',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  const tdStyle = {
    padding: '1rem',
    borderBottom: '1px solid rgba(226,232,240,0.85)',
    fontSize: '0.95rem',
    color: '#2D3748',
    backgroundColor: 'rgba(255,255,255,0.9)'
  };

  const roleBadgeStyle = (role) => {
    const isAdmin = role === 'admin';
    return {
      padding: '0.35rem 0.75rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '700',
      backgroundColor: isAdmin ? '#805AD5' : '#667eea',
      color: 'white',
      display: 'inline-block',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };
  };

  const buttonStyle = (disabled = false) => ({
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    backgroundColor: disabled ? '#CBD5E0' : '#F56565',
    color: 'white',
    transition: 'all 0.3s',
  });

  const searchInputStyle = {
    width: '100%',
    maxWidth: '350px',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(226,232,240,0.9)',
    fontSize: '0.95rem',
    marginBottom: '1.25rem',
    backgroundColor: 'rgba(255,255,255,0.85)',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp =>
    emp.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!employees || employees.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
        <p style={{ fontSize: '1.1rem', color: '#6B7280' }}>
          No employees found
        </p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <span style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#A0AEC0',
          fontSize: '1.1rem',
        }}>
          🔍
        </span>
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            ...searchInputStyle,
            paddingLeft: '2.5rem',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Created Date</th>
              <th style={thStyle}>Created By</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => {
              const isSelf = employee._id === currentUserId;
              const isSuperAdmin = employee.role === 'admin' && !employee.createdBy;
              const canDelete = !isSelf && !isSuperAdmin;

              return (
                <tr
                  key={employee._id}
                  style={{ transition: 'background-color 0.2s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(102,126,234,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '600' }}>
                      {employee.username}
                      {isSelf && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#8B5CF6',
                          fontWeight: 'normal',
                        }}>
                          (You)
                        </span>
                      )}
                      {isSuperAdmin && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#8B5CF6',
                          fontWeight: 'normal',
                        }}>
                          (Super Admin)
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={roleBadgeStyle(employee.role)}>
                      {employee.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {formatDate(employee.createdAt)}
                  </td>
                  <td style={tdStyle}>
                    {employee.createdBy?.username || 'System'}
                  </td>
                  <td style={tdStyle}>
                    {canDelete ? (
                      <button
                        onClick={() => handleDelete(employee._id, employee.username)}
                        disabled={deletingId === employee._id}
                        style={buttonStyle(deletingId === employee._id)}
                        onMouseEnter={(e) => {
                          if (deletingId !== employee._id) {
                            e.target.style.opacity = '0.8';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingId !== employee._id) {
                            e.target.style.opacity = '1';
                          }
                        }}
                      >
                        {deletingId === employee._id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                        {isSelf ? 'Cannot delete self' : 'Protected'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredEmployees.length === 0 && searchTerm && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6B7280',
        }}>
          No employees found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}

EmployeeTable.propTypes = {
  employees: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'employee']).isRequired,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    createdBy: PropTypes.oneOfType([
      PropTypes.shape({ username: PropTypes.string }),
      PropTypes.string,
      PropTypes.oneOf([null])
    ]),
  })).isRequired,
  onDelete: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
};

EmployeeTable.defaultProps = {
  currentUserId: undefined,
};
