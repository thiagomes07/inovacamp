import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-green-500 ${sizeClasses[size]} ${className}`} />
  );
};

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-300 rounded ${className}`} />
  );
};

export const LoadingCard: React.FC = () => {
  return (
    <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
      <div className="animate-pulse space-y-4">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-6 w-1/2" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
};

export const LoadingButton: React.FC<{ children: React.ReactNode; loading?: boolean }> = ({ 
  children, 
  loading = false 
}) => {
  return (
    <button 
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
};