// components/VotingInterface.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Vote, Check } from 'lucide-react';

interface VotingInterfaceProps {
  votingPrompt: string;
  options: string[];
  initialTimeRemaining: number;
  onVoteSubmit?: (selectedOptionIndex: number) => void;
  pollId?: string;
  onClose: () => void;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({
  votingPrompt,
  options,
  initialTimeRemaining,
  onVoteSubmit,
  pollId,
  onClose
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || hasVoted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, hasVoted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (index: number) => {
    if (timeRemaining <= 0 || hasVoted) return;
    setSelectedOption(index);
  };

  const handleSubmit = async () => {
    if (selectedOption === null || timeRemaining <= 0 || hasVoted) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the onVoteSubmit callback if provided
      if (onVoteSubmit) {
        onVoteSubmit(selectedOption);
      }
      
      console.log('Vote submitted:', {
        pollId,
        selectedOption,
        optionName: options[selectedOption]
      });
      
      setHasVoted(true);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVotingDisabled = timeRemaining <= 0;
  const isSubmitDisabled = selectedOption === null || isVotingDisabled || hasVoted || isSubmitting;

  if (hasVoted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Vote Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for participating in the vote. Your response has been recorded.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">
            You voted for: <span className="font-semibold">{options[selectedOption!]}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Vote size={24} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🗳️ Vote Now</h1>
        <h2 className="text-lg font-semibold text-gray-700">{votingPrompt}</h2>
      </div>

      {/* Timer */}
      <div className={`text-center mb-6 p-3 rounded-lg ${
        timeRemaining <= 30 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <Clock size={16} className={timeRemaining <= 30 ? 'text-red-600' : 'text-blue-600'} />
          <span className={`font-semibold text-sm ${
            timeRemaining <= 30 ? 'text-red-600' : 'text-blue-600'
          }`}>
            {isVotingDisabled ? 'Voting has ended' : `Time remaining: ${formatTime(timeRemaining)}`}
          </span>
        </div>
      </div>

      {/* Voting disabled message */}
      {isVotingDisabled && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-700 font-medium">⏰ Voting time has expired</p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            disabled={isVotingDisabled}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
              selectedOption === index
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
            } ${
              isVotingDisabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer hover:shadow-sm hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedOption === index
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedOption === index && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          isSubmitDisabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </div>
        ) : (
          'Submit Vote'
        )}
      </button>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Poll ID: {pollId || 'demo'}
        </p>
      </div>
    </div>
  );
};

export default VotingInterface;