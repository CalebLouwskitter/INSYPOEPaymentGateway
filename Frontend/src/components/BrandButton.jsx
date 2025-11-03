import PropTypes from 'prop-types';
import '../styles/branding.css';

const VARIANT_CLASS_MAP = {
  primary: 'brand-button--primary',
  outline: 'brand-button--outline',
  employee: 'brand-button--employee',
  muted: 'brand-button--muted',
};

export default function BrandButton({ variant, className, children, type, ...props }) {
  const variantClass = VARIANT_CLASS_MAP[variant] || VARIANT_CLASS_MAP.primary;
  const classes = ['brand-button', variantClass, className].filter(Boolean).join(' ');

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}

BrandButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'outline', 'employee', 'muted']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

BrandButton.defaultProps = {
  variant: 'primary',
  className: '',
  type: 'button',
};
