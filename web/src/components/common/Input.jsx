import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente Input reutilizable con soporte para React Hook Form
 * 
 * @component
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="tu@email.com"
 *   error={errors.email?.message}
 *   {...register('email')}
 * />
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  error = '',
  helperText = '',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'md',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const sizeClasses = {
    xs: 'input-xs',
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg',
  };

  const inputClasses = [
    'input',
    'input-bordered',
    sizeClasses[size],
    fullWidth && 'w-full',
    error && 'input-error',
    disabled && 'input-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`form-control ${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="label">
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClasses} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${
            icon && iconPosition === 'right' ? 'pr-10' : ''
          }`}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}

      {!error && helperText && (
        <label className="label">
          <span className="label-text-alt text-gray-500">{helperText}</span>
        </label>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

export default Input;
