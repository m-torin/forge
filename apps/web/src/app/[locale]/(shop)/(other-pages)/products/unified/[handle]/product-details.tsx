interface ProductDetailsProps {
  dict?: any;
}

export function ProductDetails({ dict }: ProductDetailsProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold">
        {dict?.product?.productDetails || "Product Details"}
      </h2>
      <div className="prose prose-sm sm:prose dark:prose-invert mt-7 sm:max-w-4xl">
        <p>
          The patented eighteen-inch hardwood Arrowhead deck --- finely mortised
          in, makes this the strongest and most rigid canoe ever built. You
          cannot buy a canoe that will afford greater satisfaction.
        </p>
        <p>
          The St. Louis Meramec Canoe Company was founded by Alfred Wickett in
          1922. Wickett had previously worked for the Old Town Canoe Co from
          1900 to 1914. Manufacturing of the classic wooden canoes in Valley
          Park, Missouri ceased in 1978.
        </p>
        <ul>
          <li>Regular fit, mid-weight t-shirt</li>
          <li>Natural color, 100% premium combed organic cotton</li>
          <li>
            Quality cotton grown without the use of herbicides or pesticides -
            GOTS certified
          </li>
          <li>Soft touch water based printed in the USA</li>
        </ul>
      </div>
    </div>
  );
}
