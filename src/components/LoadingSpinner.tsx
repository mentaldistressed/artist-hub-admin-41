import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  className = '',
  showProgress = false,
  progress = 0
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
      <div className="relative">
        <div 
          className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`}
          role="status"
          aria-label="Loading"
        />
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      
      {message && (
        <div className="text-center">
          <p className={`text-muted-foreground ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}>
            {message}
          </p>
          {showProgress && (
            <div className="w-32 bg-secondary rounded-full h-1 mt-2">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};