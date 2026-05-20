import { type FC } from 'react';

type LoadingSkeletonProps = {
  lines?: number;
};

const LoadingSkeleton: FC<LoadingSkeletonProps> = ({ lines = 4 }) => {
  return (
    <div className="space-y-3 animate-pulse" role="status" aria-live="polite">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 rounded bg-white/[0.07]"
          style={{ width: `${85 - index * 10}%` }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
