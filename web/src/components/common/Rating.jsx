import { IoStar, IoStarOutline, IoStarHalf } from 'react-icons/io5';

const Rating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 20,
  showNumber = false,
  interactive = false,
  onChange 
}) => {
  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      const filled = i <= rating;
      const halfFilled = i === Math.ceil(rating) && rating % 1 !== 0;

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleClick(i)}
          disabled={!interactive}
          className={`
            ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
            transition-transform
          `}
        >
          {filled ? (
            <IoStar size={size} className="text-yellow-400" />
          ) : halfFilled ? (
            <IoStarHalf size={size} className="text-yellow-400" />
          ) : (
            <IoStarOutline size={size} className="text-gray-300" />
          )}
        </button>
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
