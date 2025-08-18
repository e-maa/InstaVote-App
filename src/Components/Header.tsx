// components/Header.tsx
import React from 'react';
import { Vote } from 'lucide-react';
import type { AppStep } from '../Types';

interface HeaderProps {
  currentStep: AppStep;
}

const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Vote className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              InstaVote
            </h1>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentStep === 'setup' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              Setup
            </div>
            <div className={`w-2 h-2 rounded-full ${
              currentStep !== 'setup' ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentStep === 'voting' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              Voting
            </div>
            <div className={`w-2 h-2 rounded-full ${
              currentStep === 'results' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentStep === 'results' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              Results
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;