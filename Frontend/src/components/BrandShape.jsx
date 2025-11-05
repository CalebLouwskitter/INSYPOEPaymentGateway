import PropTypes from 'prop-types';

/**
 * BrandShape
 * Reusable decorative shape using CSS variables to avoid JSX duplication.
 */
export default function BrandShape({
  width,
  height,
  gradient,
  image,
  top,
  right,
  bottom,
  left,
  transform,
  motion,
  blur,
  className = '',
}) {
  const style = {
    '--brand-shape-width': width,
    '--brand-shape-height': height,
    '--brand-shape-gradient': gradient,
    '--brand-shape-image': image,
    '--brand-shape-top': top,
    '--brand-shape-right': right,
    '--brand-shape-bottom': bottom,
    '--brand-shape-left': left,
    '--brand-shape-transform': transform,
    '--brand-shape-motion': motion,
    '--brand-shape-blur': blur,
  };

  return <div className={`brand-shape ${className}`.trim()} style={style}></div>;
}

BrandShape.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  gradient: PropTypes.string,
  image: PropTypes.string,
  top: PropTypes.string,
  right: PropTypes.string,
  bottom: PropTypes.string,
  left: PropTypes.string,
  transform: PropTypes.string,
  motion: PropTypes.string,
  blur: PropTypes.string,
  className: PropTypes.string,
};
