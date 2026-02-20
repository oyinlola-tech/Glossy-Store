import { useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';

type Props = {
  open: boolean;
  product: api.Product | null;
  onClose: () => void;
  onConfirm: (variant: NonNullable<api.Product['ProductVariants']>[number]) => void;
};

export function VariantPickerModal({ open, product, onClose, onConfirm }: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const variants = product?.ProductVariants || [];

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((variant) => {
      const color = variant.ProductColor?.name || variant.ProductColor?.color_name;
      if (color) set.add(color);
    });
    return Array.from(set);
  }, [variants]);

  const sizeOptions = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((variant) => {
      const size = variant.ProductSize?.size;
      if (size) set.add(size);
    });
    return Array.from(set);
  }, [variants]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    const matching = variants.find((variant) => {
      const color = variant.ProductColor?.name || variant.ProductColor?.color_name || null;
      const size = variant.ProductSize?.size || null;
      const colorOk = selectedColor ? color === selectedColor : true;
      const sizeOk = selectedSize ? size === selectedSize : true;
      return colorOk && sizeOk && Number(variant.stock || 0) > 0;
    });
    return matching || null;
  }, [selectedColor, selectedSize, variants]);

  useEffect(() => {
    if (!open || !variants.length) return;
    const firstAvailable = variants.find((variant) => Number(variant.stock || 0) > 0) || variants[0];
    const color = firstAvailable?.ProductColor?.name || firstAvailable?.ProductColor?.color_name || null;
    const size = firstAvailable?.ProductSize?.size || null;
    setSelectedColor(color);
    setSelectedSize(size);
  }, [open, variants]);

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold text-black dark:text-white">Choose options for {product.name}</h3>
        {colorOptions.length ? (
          <div>
            <p className="text-sm font-semibold text-black dark:text-white mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    selectedColor === color
                      ? 'bg-red-500 text-white border-red-500'
                      : 'border-gray-300 dark:border-gray-600 text-black dark:text-white'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {sizeOptions.length ? (
          <div>
            <p className="text-sm font-semibold text-black dark:text-white mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    selectedSize === size
                      ? 'bg-red-500 text-white border-red-500'
                      : 'border-gray-300 dark:border-gray-600 text-black dark:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!selectedVariant ? (
          <p className="text-sm text-red-500">Selected option is out of stock.</p>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-black dark:text-white">
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedVariant}
            onClick={() => selectedVariant && onConfirm(selectedVariant)}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}
