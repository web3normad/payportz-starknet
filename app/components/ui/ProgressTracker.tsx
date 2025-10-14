import React from 'react';
import { CheckCircle } from '@phosphor-icons/react';

interface ProgressTrackerProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
            index <= currentStep ? 'bg-[#8b61c2] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {index < currentStep ? (
              <CheckCircle size={16} weight="fill" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-1 rounded ml-4 ${
              index < currentStep ? 'bg-[#8b61c2]' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;