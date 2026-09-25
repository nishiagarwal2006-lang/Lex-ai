export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`${sizes[size] || sizes.md} animate-spin rounded-full border-2 border-transparent ${className}`}
      style={{
        borderTopColor: '#6366f1',
        borderRightColor: '#00f5ff',
        boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
      }}
    />
  );
}
