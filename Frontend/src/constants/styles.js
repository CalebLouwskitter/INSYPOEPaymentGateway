/**
 * Shared style constants for UI components
 * Helps reduce code duplication and maintain consistency
 */

// References:
// React Team. (2025) Reusable Styles - React. Available at: https://react.dev/learn/adding-styles (Accessed: 04 November 2025).

// Color palette
export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#48BB78',
  danger: '#F56565',
  warning: '#ED8936',
  info: '#4299E1',
  purple: '#9F7AEA',
  white: '#FFFFFF',
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
  }
};

// Common spacing
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem'
};

// Common borders
export const BORDERS = {
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '999px'
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px'
  }
};

// Typography
export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.85rem',
    base: '0.95rem',
    lg: '1rem',
    xl: '1.1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    '4xl': '1.75rem',
    '5xl': '2.5rem'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  }
};

// Animation transitions
export const TRANSITIONS = {
  fast: 'all 0.2s ease',
  normal: 'all 0.3s ease',
  slow: 'all 0.4s ease'
};

// Shadow utilities
export const SHADOWS = {
  sm: '0 2px 8px rgba(0,0,0,0.06)',
  md: '0 2px 8px rgba(0,0,0,0.1)',
  lg: '0 14px 30px rgba(0,0,0,0.12)',
  xl: '0 10px 30px rgba(0,0,0,0.12)'
};

// Glass morphism effects
export const GLASS_STYLES = {
  container: {
    background: '#FFFFFF',
    border: `1px solid ${COLORS.gray[200]}`,
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: SHADOWS.md
  },
  nav: {
    background: '#FFFFFF',
    border: `1px solid ${COLORS.gray[200]}`,
    borderRadius: '14px',
    boxShadow: SHADOWS.md
  }
};

// Button styles
export const BUTTON_STYLES = {
  primary: (disabled = false) => ({
    padding: '0.65rem 1.5rem',
    borderRadius: BORDERS.radius.md,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    backgroundColor: disabled ? COLORS.gray[300] : COLORS.primary,
    color: COLORS.white,
    transition: TRANSITIONS.normal,
    boxShadow: SHADOWS.md
  }),
  secondary: (disabled = false) => ({
    padding: '0.65rem 1.5rem',
    borderRadius: BORDERS.radius.md,
    border: `1px solid ${COLORS.gray[300]}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    backgroundColor: COLORS.white,
    color: COLORS.gray[700],
    transition: TRANSITIONS.normal,
    boxShadow: SHADOWS.md
  }),
  danger: (disabled = false) => ({
    padding: '0.5rem 1rem',
    borderRadius: BORDERS.radius.sm,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    backgroundColor: disabled ? COLORS.gray[300] : COLORS.danger,
    color: COLORS.white,
    transition: TRANSITIONS.normal
  }),
  success: (disabled = false) => ({
    padding: '0.65rem 1.5rem',
    borderRadius: BORDERS.radius.md,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    backgroundColor: disabled ? COLORS.gray[300] : COLORS.success,
    color: COLORS.white,
    transition: TRANSITIONS.normal,
    boxShadow: SHADOWS.md
  })
};

// Form styles
export const FORM_STYLES = {
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: TYPOGRAPHY.fontSize.base,
    borderRadius: BORDERS.radius.md,
    border: `1px solid ${COLORS.gray[200]}`,
    boxSizing: 'border-box',
    transition: TRANSITIONS.normal,
    backgroundColor: COLORS.gray[50]
  },
  label: {
    display: 'block',
    marginBottom: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[600]
  },
  error: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.sm
  }
};

// Message styles
export const MESSAGE_STYLES = {
  container: (isError = false) => ({
    padding: '1rem 1.5rem',
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.lg,
    backgroundColor: isError ? '#FED7D7' : '#C6F6D5',
    border: `1px solid ${isError ? '#FC8181' : '#68D391'}`,
    color: isError ? '#C53030' : '#2F855A',
    fontWeight: TYPOGRAPHY.fontWeight.medium
  })
};

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
};

// Loading spinner styles
export const LOADING_STYLES = {
  container: {
    textAlign: 'center',
    padding: SPACING.xxl,
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.md
  },
  icon: {
    fontSize: TYPOGRAPHY.fontSize['5xl'],
    marginBottom: SPACING.md
  },
  text: {
    color: COLORS.gray[500],
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium
  }
};
