const ProductSpotlight = ({ product }) => {
  if (!product) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-black/40 p-5 text-sm text-gray-300 backdrop-blur-sm">
        The host has not selected a product yet.
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 rounded-[1.75rem] border border-white/10 bg-black/50 p-4 backdrop-blur-sm">
      <div className="h-28 w-28 overflow-hidden rounded-[1.5rem] bg-white/5">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">No image</div>
        )}
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Now showing</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{product.name}</h3>
        <p className="mt-2 text-lg font-semibold text-emerald-300">₹{Number(product.price || 0).toFixed(2)}</p>
        <p className="mt-3 text-sm leading-6 text-gray-200">{product.description || 'No description provided.'}</p>
      </div>
    </div>
  );
};

export default ProductSpotlight;
