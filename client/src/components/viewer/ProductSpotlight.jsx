const ProductSpotlight = ({ product }) => {
  if (!product) {
    return (
      <div className="rounded-xl bg-black/40 p-4 text-sm text-gray-300 backdrop-blur-sm">
        The host has not selected a product yet.
      </div>
    );
  }

  return (
    <div className="flex gap-4 rounded-xl bg-black/50 p-4 backdrop-blur-sm">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">No image</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow">Now showing</p>
        <h3 className="mt-1 text-lg font-bold text-white">{product.name}</h3>
        <p className="mt-1 text-base font-bold text-brand-yellow">₹{Number(product.price || 0).toFixed(2)}</p>
        <p className="mt-2 line-clamp-2 text-sm text-gray-300">{product.description || 'No description provided.'}</p>
      </div>
    </div>
  );
};

export default ProductSpotlight;
