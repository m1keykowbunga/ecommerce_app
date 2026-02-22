const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
}) => {
  const variantClasses = {
    primary:   'bg-brand-primary text-white',
    secondary: 'bg-brand-secondary text-white',
    outline:   'bg-transparent border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors',
    success:   'bg-green-500 text-white',
    error:     'bg-red-500 text-white',
    warning:   'bg-yellow-500 text-white',
    info:      'bg-blue-500 text-white',
    gray:      'bg-gray-500 text-white',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant] ?? ''}
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer select-none' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
