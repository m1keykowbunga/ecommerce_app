import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente Button reutilizable con variantes de DaisyUI
 * 
 * @component
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  outline = false,
  icon = null,
  iconPosition = 'left',
  type = 'button',
  className = '',
  onClick,
  ...props
}, ref) => {
  // Construir clases CSS
  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: outline ? 'btn-outline btn-primary' : 'btn-primary',
    secondary: outline ? 'btn-outline btn-secondary' : 'btn-secondary',
    accent: outline ? 'btn-outline btn-accent' : 'btn-accent',
    success: outline ? 'btn-outline btn-success' : 'btn-success',
    warning: outline ? 'btn-outline btn-warning' : 'btn-warning',
    error: outline ? 'btn-outline btn-error' : 'btn-error',
    info: outline ? 'btn-outline btn-info' : 'btn-info',
    ghost: 'btn-ghost',
    link: 'btn-link',
  };

  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size],
    fullWidth && 'btn-block',
    loading && 'loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info',
    'ghost',
    'link',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  outline: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
