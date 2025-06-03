import clsx from "clsx";

import { type TProductItem } from "@repo/design-system/mantine-ciseco";

const ProductOptions = ({
  className,
  options,
}: {
  options: TProductItem["options"];
  className?: string;
}) => {
  const renderOtherOptions = () => {
    const otherOptions = options?.filter((option) => option.name !== "Size");
    if (!otherOptions?.length) {
      return null;
    }

    return otherOptions.map((option) => {
      return (
        <div key={option.name}>
          <label htmlFor="" className="block rtl:text-right">
            <span className="text-sm font-medium">{option.name}</span>
          </label>
          <div className="mt-2.5 flex gap-x-2.5">
            {option.optionValues.map((value, index) => {
              // for demo purpose
              const isActive = index === 1;

              return (
                <div
                  key={value.name}
                  className={clsx(
                    "relative size-9 cursor-pointer rounded-full",
                    isActive && "ring-2 ring-neutral-900 ring-offset-2",
                  )}
                >
                  <div
                    className="absolute inset-0.5 z-0 overflow-hidden rounded-full bg-cover"
                    style={{
                      backgroundColor: value.swatch?.color,
                      backgroundImage: value.swatch?.image
                        ? `url(${value.swatch.image})`
                        : undefined,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return <div className={clsx(className)}>{renderOtherOptions()}</div>;
};

export default ProductOptions;
