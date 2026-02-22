const Card = ({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  noPadding = false 
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md
        ${hover ? 'card-shadow cursor-pointer' : ''}
        ${!noPadding ? 'p-6' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
