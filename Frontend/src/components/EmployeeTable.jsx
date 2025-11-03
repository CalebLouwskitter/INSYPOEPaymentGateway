import { useState } from 'react';

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

  const roleBadgeStyle = (role) => {
    const isAdmin = role === 'admin';
    return {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: isAdmin ? '#DDD6FE' : '#D1FAE5',
      color: isAdmin ? '#5B21B6' : '#065F46',
      display: 'inline-block',
    };
  };

  const buttonStyle = (disabled = false) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    backgroundColor: disabled ? '#9CA3AF' : '#EF4444',
    color: 'white',
    transition: 'opacity 0.3s',
  });

  const searchInputStyle = {
    width: '100%',
    maxWidth: '300px',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid #D1D5DB',
    fontSize: '0.9rem',
    marginBottom: '1rem',
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
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
        <p style={{ fontSize: '1.1rem', color: '#6B7280' }}>
          No employees found
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search bar */}
      <input
        type="text"
        placeholder="🔍 Search by username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={searchInputStyle}
      />

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
                <tr key={employee._id}>
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
