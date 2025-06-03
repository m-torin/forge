import { StarIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

import { ReviewItem, type TReview } from "@repo/design-system/ciseco";

const ProductReviews = ({
  className,
  rating,
  reviewNumber,
  reviews,
}: {
  reviews: TReview[];
  className?: string;
  rating: number;
  reviewNumber: number;
}) => {
  const renderReviews = () => {
    return (
      <div>
        {/* HEADING */}
        <h2 className="flex items-center text-2xl font-semibold">
          <StarIcon className="mb-0.5 size-7" />
          <span className="ml-1.5">
            {rating} · {reviewNumber} Reviews
          </span>
        </h2>

        {/* comment */}
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-x-14 gap-y-11 md:grid-cols-2 lg:gap-x-28">
            {reviews.map((review) => (
              <ReviewItem key={review.id} data={review} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return <div className={clsx(className)}>{renderReviews()}</div>;
};

export default ProductReviews;
