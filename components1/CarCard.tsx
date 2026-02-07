"use client";

import { TempProps } from "../types";

interface CarCardProps {
    temp: TempProps;
}

const CarCard = ({ temp }: CarCardProps) => {
    const { _id, title, price = "0", discount = "0", img, type = "single", stock = "0", color } = temp;

    const isOutOfStock =
        (type === "single" && parseInt(String(stock)) === 0) ||
        (type === "collection" &&
            color?.every((c: any) => parseInt(String(c.qty || 0)) === 0));

    const priceNum = parseFloat(String(price));
    const discountNum = parseFloat(String(discount));
    const discountPercentage = Math.round(((priceNum - discountNum) / priceNum) * 100);

    return (
        <a href={`/product?id=${_id}&imgg=${img[0]}`}>
            <div className="flex flex-col items-start w-full sm:w-[300px] mb-6 sm:mb-8">
                {/* Image */}
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                    <img
                        src={img[0]}
                        alt={title}
                        className="w-full h-full object-cover object-center"
                    />

                    {/* Discount flag */}
                    {discountPercentage > 0 && (
                        <div
                            className="absolute top-2 left-2 bg-[#222] text-white text-xs font-regular px-3 py-1 z-20"
                            style={{
                                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
                            }}
                        >
                            {discountPercentage}% OFF
                        </div>
                    )}

                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-gray-600 bg-opacity-70 text-white flex items-center justify-center text-lg font-bold z-10 rounded">
                            Out of Stock
                        </div>
                    )}
                </div>

{/* Title Below Image */}
<div className="w-full">
  {title ? (
    <h2 className="myGray text-[13px] font-normal text-center mt-2 mb-2" style={{ letterSpacing: '-0.3px' }}>{title}</h2>
  ) : (
    <p className="text-red-500 text-sm">No title available</p>
  )}
</div>

{/* Price and Details */}
<div className="flex flex-col items-center mt-3 w-full">
  {/* Price display */}
  <div className="price-container inline-flex flex-wrap gap-x-4 gap-y-2 items-baseline justify-center">

    {type === "collection" ? (
      // ✅ For collection, show discount price and original price
      discountPercentage && discountPercentage > 0 && priceNum && priceNum > 0 ? (
        <>
          <span className="myPriceThin">
            ${discountNum.toFixed(2)}
          </span>
          <span className="myPriceThinGray line-through">
            ${priceNum.toFixed(2)}
          </span>
        </>
      ) : (
        <span className="myPriceThin">
          ${discountNum.toFixed(2)}
        </span>
      )
    ) : (
      // ✅ Normal product (single type)
      discountPercentage && discountPercentage > 0 && priceNum && priceNum > 0 ? (
        <>
          <span className="myPriceThin">
            ${discountNum.toFixed(2)}
          </span>
          <span className="myPriceThinGray line-through">
            ${priceNum.toFixed(2)}
          </span>
        </>
      ) : (
        <span className="myPriceThin">
          ${discountNum.toFixed(2)}
        </span>
      )
    )}

  </div>
</div>

            </div>
        </a>
    );
};

export default CarCard;
