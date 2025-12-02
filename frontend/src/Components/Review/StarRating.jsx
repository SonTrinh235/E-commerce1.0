import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, hoverRating, setHoverRating, isEditable = false, size = 20 }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = isEditable 
            ? starValue <= (hoverRating || rating)
            : starValue <= rating;

        return (
          <Star
            key={index}
            size={size}
            fill={isFilled ? "#ffc107" : "transparent"}
            color={isFilled ? "#ffc107" : "#e4e5e9"}
            className={isEditable ? "cursor-pointer transition-transform hover:scale-110" : ""}
            
            onClick={() => isEditable && setRating(starValue)}
            onMouseEnter={() => isEditable && setHoverRating(starValue)}
            onMouseLeave={() => isEditable && setHoverRating(0)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;