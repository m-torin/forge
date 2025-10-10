'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useState } from 'react';

interface StarReviewProps {
  onRatingChange?: (rating: number) => void;
  initialRating?: number;
  className?: string;
}

export default function StarReview({
  onRatingChange,
  initialRating = 0,
  className,
}: StarReviewProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starIndex: number) => {
    const newRating = starIndex + 1;
    setRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleStarHover = (starIndex: number) => {
    setHoverRating(starIndex + 1);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div data-testid="star-review" className={clsx('star-review', className)}>
      <div
        className="flex items-center gap-1"
        onMouseLeave={handleMouseLeave}
        role="radiogroup"
        aria-label="Star rating"
      >
        {[0, 1, 2, 3, 4].map(starIndex => (
          <button
            key={starIndex}
            type="button"
            className={
              starIndex < displayRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
            }
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleStarHover(starIndex)}
            aria-label={`Rate ${starIndex + 1} star${starIndex + 1 > 1 ? 's' : ''}`}
            role="radio"
            aria-checked={rating === starIndex + 1}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleStarClick(starIndex);
              }
            }}
          >
            <StarIcon className="size-6" color="currentColor" fill="currentColor" />
          </button>
        ))}
      </div>

      {/* Hidden input to store the rating value */}
      <input type="hidden" name="rating" value={rating} />
    </div>
  );
}
