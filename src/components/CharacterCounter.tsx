import { type FC } from 'react';

interface CharacterCounterProps {
  current: number;
  max?: number;
  min?: number;
  showCount?: boolean;
  className?: string;
}

const CharacterCounter: FC<CharacterCounterProps> = ({
  current,
  max,
  min,
  showCount = true,
  className = '',
}) => {
  const getColor = () => {
    if (max && current > max) return 'text-error-400';
    if (min && current < min) return 'text-warning-400';
    if (max && current > max * 0.9) return 'text-warning-400';
    return 'text-gray-400';
  };

  const getMessage = () => {
    if (max && current > max) return `${current - max} characters over limit`;
    if (min && current < min) return `${min - current} more characters needed`;
    if (max) return `${current} / ${max}`;
    return `${current} characters`;
  };

  return (
    <div className={`flex items-center justify-between text-xs ${className}`}>
      {showCount && (
        <span className={`font-medium transition-colors ${getColor()}`}>
          {getMessage()}
        </span>
      )}
    </div>
  );
};

export default CharacterCounter;
