import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  COLORS,
  GRADIENTS,
  GLASS_STYLES,
  SPACING,
  BORDERS,
  TYPOGRAPHY,
  TRANSITIONS,
  SHADOWS,
  BUTTON_STYLES
} from '../constants/styles.js';
import Icon from './Icon';

// References:
// React Team. (2025) useState - React. Available at: https://react.dev/reference/react/useState (Accessed: 03 November 2025).
// React Team. (2025) useMemo - React. Available at: https://react.dev/reference/react/useMemo (Accessed: 04 November 2025).

/**
 * Reusable employee table component
 * Displays employees with delete action
 */
export default function EmployeeTable({ employees, onDelete, currentUserId }) {
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('username');
  const [sortDirection, setSortDirection] = useState('asc');

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

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Memoized filtered and sorted employees for performance
  const processedEmployees = useMemo(() => {
    let filtered = employees.filter(emp =>
      emp.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort employees
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    return filtered;
  }, [employees, searchTerm, sortField, sortDirection]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeStyle = (role) => {
    const isAdmin = role === 'admin';
    return {
      padding: `${SPACING.xs} ${SPACING.sm}`,
      borderRadius: BORDERS.radius.sm,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      backgroundColor: isAdmin ? COLORS.purple : COLORS.info,
      color: COLORS.white,
      display: 'inline-block',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <Icon name="unfold_more" size={18} />;
    return sortDirection === 'asc' ? <Icon name="arrow_upward" size={18} /> : <Icon name="arrow_downward" size={18} />;
  };

  if (!employees || employees.length === 0) {
    return (
      <div style={{ ...GLASS_STYLES.container, textAlign: 'center' }} role="alert">
        <div style={{ fontSize: TYPOGRAPHY.fontSize['5xl'], marginBottom: SPACING.md }}>👥</div>
        <p style={{ fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.gray[500] }}>
          No employees found
        </p>
      </div>
    );
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BORDERS.radius.lg,
    overflow: 'hidden',
    boxShadow: SHADOWS.sm,
  };

  const thStyle = {
    background: GRADIENTS.tableHeader,
    color: COLORS.white,
    padding: SPACING.md,
    textAlign: 'left',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    userSelect: 'none',
    transition: TRANSITIONS.fast,
  };

  const tdStyle = {
    padding: SPACING.md,
    borderBottom: `1px solid ${COLORS.gray[200]}`,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray[700],
    backgroundColor: 'rgba(255,255,255,0.9)',
    transition: TRANSITIONS.fast,
  };

  const searchInputStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: `${SPACING.sm} ${SPACING.md}`,
    borderRadius: BORDERS.radius.lg,
    border: `1px solid ${COLORS.gray[200]}`,
    fontSize: TYPOGRAPHY.fontSize.base,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    transition: TRANSITIONS.normal,
  };

  return (
    <div style={GLASS_STYLES.container}>
      {/* Search bar */}
      <div style={{ 
        position: 'relative', 
        marginBottom: SPACING.lg,
        width: '100%',
        maxWidth: '400px',
        margin: `0 auto ${SPACING.lg} auto`
      }}>
        <label htmlFor="employee-search" style={{ 
          position: 'absolute', 
          left: SPACING.md,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          color: COLORS.gray[400],
          fontSize: TYPOGRAPHY.fontSize.lg,
          zIndex: 1,
        }}>
          <Icon name="search" size={20} title="Search" />
        </label>
        <input
          id="employee-search"
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search employees by username"
          style={{
            ...searchInputStyle,
            paddingLeft: '2.5rem',
            width: '100%',
            maxWidth: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = COLORS.primary;
            e.target.style.backgroundColor = COLORS.white;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = COLORS.gray[200];
            e.target.style.backgroundColor = 'rgba(255,255,255,0.85)';
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }} role="region" aria-label="Employees table">
        <table style={tableStyle}>
          <thead>
            <tr>
              <th 
                style={thStyle}
                onClick={() => handleSort('username')}
                aria-label="Sort by username"
                aria-sort={sortField === 'username' ? sortDirection : 'none'}
              >
                Username {getSortIcon('username')}
              </th>
              <th 
                style={thStyle}
                onClick={() => handleSort('role')}
                aria-label="Sort by role"
                aria-sort={sortField === 'role' ? sortDirection : 'none'}
              >
                Role {getSortIcon('role')}
              </th>
              <th 
                style={thStyle}
                onClick={() => handleSort('createdAt')}
                aria-label="Sort by creation date"
                aria-sort={sortField === 'createdAt' ? sortDirection : 'none'}
              >
                Created Date {getSortIcon('createdAt')}
              </th>
              <th style={thStyle}>Created By</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedEmployees.map((employee) => {
              const isSelf = employee._id === currentUserId;
              const isSuperAdmin = employee.role === 'admin' && !employee.createdBy;
              const canDelete = !isSelf && !isSuperAdmin;

              return (
                <tr
                  key={employee._id}
                  style={{ 
                    transition: TRANSITIONS.fast,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(102,126,234,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
                      {employee.username}
                      {isSelf && (
                        <span style={{
                          marginLeft: SPACING.sm,
                          fontSize: TYPOGRAPHY.fontSize.xs,
                          color: COLORS.purple,
                          fontWeight: TYPOGRAPHY.fontWeight.normal,
                        }}>
                          (You)
                        </span>
                      )}
                      {isSuperAdmin && (
                        <span style={{
                          marginLeft: SPACING.sm,
                          fontSize: TYPOGRAPHY.fontSize.xs,
                          color: COLORS.purple,
                          fontWeight: TYPOGRAPHY.fontWeight.normal,
                        }}>
                          (Super Admin)
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={getRoleBadgeStyle(employee.role)} aria-label={`Role: ${employee.role}`}>
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
                        style={BUTTON_STYLES.danger(deletingId === employee._id)}
                        aria-label={`Delete employee ${employee.username}`}
                        aria-busy={deletingId === employee._id}
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
                        {deletingId === employee._id ? 'Deleting...' : (<><Icon name="delete" size={18} /> Delete</>)}
                      </button>
                    ) : (
                      <span style={{ 
                        color: COLORS.gray[400], 
                        fontSize: TYPOGRAPHY.fontSize.sm,
                        fontStyle: 'italic'
                      }}>
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

      {processedEmployees.length === 0 && searchTerm && (
        <div style={{
          textAlign: 'center',
          padding: `${SPACING.xl} ${SPACING.lg}`,
          color: COLORS.gray[500],
        }} role="alert">
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
