import React from 'react';
import { Button } from '../../../../components/ui/button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 mb-4 text-gray-400 flex items-center justify-center bg-gray-800 rounded-full">
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      
      <p className="text-gray-400 mb-6 max-w-sm">{description}</p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};