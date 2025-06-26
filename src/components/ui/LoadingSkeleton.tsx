interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'product' | 'avatar' | 'button';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export default function LoadingSkeleton({ 
  variant = 'text', 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  count = 1 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text': return `${height} ${width}`;
      case 'card': return 'w-full h-64 rounded-lg';
      case 'product': return 'w-full aspect-square rounded-lg';
      case 'avatar': return 'w-10 h-10 rounded-full';
      case 'button': return 'w-24 h-10 rounded-md';
      default: return `${height} ${width}`;
    }
  };

  const skeletonElement = (
    <div className={`${baseClasses} ${getVariantClasses()} ${className}`} />
  );

  if (count === 1) return skeletonElement;

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${baseClasses} ${getVariantClasses()} ${className}`} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <LoadingSkeleton variant="product" />
      <LoadingSkeleton height="h-6" width="w-3/4" />
      <LoadingSkeleton height="h-4" width="w-1/2" />
      <LoadingSkeleton variant="button" width="w-full" />
    </div>
  );
} 