'use client';

import LikeButton from './LikeButton';

interface LikeFavoriteButtonProps {
  className?: string;
  productId: string;
  size?: 'sm' | 'md' | 'lg';
}

const LikeFavoriteButton: React.FC<LikeFavoriteButtonProps> = ({ 
  className, 
  productId, 
  size = 'md' 
}) => {
  return (
    <LikeButton
      className={className}
      productId={productId}
      data-testid={`favorite-button-${productId}`}
    />
  );
};

export default LikeFavoriteButton;