import PropTypes from 'prop-types';

/**
 * Material Symbols (Google Fonts) icon component
 * Usage: <Icon name="group" size={24} title="Total employees" />
 * If title is omitted, the icon is aria-hidden
 */
export default function Icon({ name, size = 24, title, filled = false, style, className }) {
  const fontSettings = `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`;
  const combinedStyle = {
    fontVariationSettings: fontSettings,
    fontSize: `${size}px`,
    lineHeight: 1,
    verticalAlign: 'middle',
    ...style,
  };
  return (
    <span
      className={`material-symbols-outlined ${className || ''}`.trim()}
      style={combinedStyle}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
    >
      {name}
    </span>
  );
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  title: PropTypes.string,
  filled: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
};
