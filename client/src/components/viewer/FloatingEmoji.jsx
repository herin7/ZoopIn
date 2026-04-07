const FloatingEmoji = ({ emoji, x, y }) => {
  const style = {
    left: x ?? '50%',
    top: y ?? '65%',
  };

  return (
    <div className="pointer-events-none absolute z-30 text-3xl animate-float-emoji" style={style}>
      {emoji}
    </div>
  );
};

export default FloatingEmoji;
