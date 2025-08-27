// VotingPage.tsx - Standalone voting page for QR code users
import React, { useState, useEffect } from 'react';
import { Clock, Vote, Check, AlertCircle } from 'lucide-react';

interface VotingPageProps {
  pollData?: {
    votingPrompt: string;
    options: string[];
    pollId: string;
    startTime: number;
    duration: number; // Added duration support
  };
  onVoteSubmit?: (optionIndex: number) => void;
}

const VotingPage: React.FC<VotingPageProps> = ({ pollData, onVoteSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollNotFound, setPollNotFound] = useState(false);
  const [pollExpired, setPollExpired] = useState(false);

  // Enhanced poll data validation and initialization
  useEffect(() => {
    if (!pollData) {
      console.error('VotingPage: No poll data provided');
      setPollNotFound(true);
      return;
    }

    console.log('VotingPage: Initializing poll:', {
      pollId: pollData.pollId,
      duration: pollData.duration,
      startTime: pollData.startTime,
      options: pollData.options.length
    });
    
    // Initialize global vote storage with enhanced logging
    if (typeof window !== 'undefined') {
      if (!window.globalVoteCounts) {
        window.globalVoteCounts = {};
        console.log('VotingPage: Created global vote storage');
      }
      
      if (!window.globalVoteCounts[pollData.pollId]) {
        window.globalVoteCounts[pollData.pollId] = Array(pollData.options.length).fill(0);
        console.log('VotingPage: Initialized vote counts:', window.globalVoteCounts[pollData.pollId]);
      } else {
        console.log('VotingPage: Using existing vote counts:', window.globalVoteCounts[pollData.pollId]);
      }
    }

    // Calculate time remaining based on duration
    const elapsed = Math.floor((Date.now() - pollData.startTime) / 1000);
    const remaining = Math.max(0, pollData.duration - elapsed);
    
    if (remaining <= 0) {
      console.log('VotingPage: Poll has expired');
      setPollExpired(true);
      setTimeRemaining(0);
    } else {
      setTimeRemaining(remaining);
      console.log(`VotingPage: ${remaining}s remaining of ${pollData.duration}s total`);
    }
  }, [pollData]);

  // Enhanced timer with duration support
  useEffect(() => {
    if (!pollData || pollExpired || hasVoted) return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - pollData.startTime) / 1000);
      const remaining = Math.max(0, pollData.duration - elapsed);
      
      if (remaining <= 0 && !pollExpired) {
        console.log('VotingPage: Timer expired');
        setPollExpired(true);
        setTimeRemaining(0);
        
        // Auto-submit vote if one is selected when time expires
        if (selectedOption !== null && !hasVoted) {
          console.log('VotingPage: Auto-submitting vote on timeout');
          handleAutoSubmit();
        }
      } else if (!hasVoted) {
        setTimeRemaining(remaining);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [pollData, hasVoted, pollExpired, selectedOption]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (index: number) => {
    if (timeRemaining <= 0 || hasVoted || pollExpired) return;
    console.log('VotingPage: Option selected:', index, pollData?.options[index]);
    setSelectedOption(index);
  };

  // Enhanced vote submission with comprehensive logging and sync
  const submitVoteToGlobalStorage = (optionIndex: number): boolean => {
    if (!pollData) {
      console.error('VotingPage: Cannot submit vote - no poll data');
      return false;
    }

    console.log('=== VotingPage: VOTE SUBMISSION START ===');
    console.log('Poll ID:', pollData.pollId);
    console.log('Option Index:', optionIndex);
    console.log('Option Name:', pollData.options[optionIndex]);
    
    try {
      if (typeof window === 'undefined') {
        console.error('VotingPage: Window object not available');
        return false;
      }

      // Ensure global storage exists
      if (!window.globalVoteCounts) {
        window.globalVoteCounts = {};
        console.log('VotingPage: Created missing globalVoteCounts');
      }

      if (!window.globalVoteCounts[pollData.pollId]) {
        window.globalVoteCounts[pollData.pollId] = Array(pollData.options.length).fill(0);
        console.log('VotingPage: Created missing vote array for poll');
      }

      // Record the vote
      const currentCount = window.globalVoteCounts[pollData.pollId][optionIndex] || 0;
      window.globalVoteCounts[pollData.pollId][optionIndex] = currentCount + 1;
      
      const newCounts = [...window.globalVoteCounts[pollData.pollId]];
      const totalVotes = newCounts.reduce((sum, count) => sum + count, 0);
      
      console.log('VotingPage: Vote recorded successfully!');
      console.log('Previous count:', currentCount);
      console.log('New count:', newCounts[optionIndex]);
      console.log('All counts:', newCounts);
      console.log('Total votes:', totalVotes);
      
      // Enhanced synchronization across all channels
      
      // 1. localStorage sync (cross-tab)
      try {
        const storageData = {
          voteCounts: newCounts,
          timestamp: Date.now(),
          lastVote: { optionIndex, optionName: pollData.options[optionIndex] }
        };
        localStorage.setItem(`poll_${pollData.pollId}`, JSON.stringify(storageData));
        console.log('VotingPage: Saved to localStorage');
      } catch (e) {
        console.warn('VotingPage: localStorage save failed:', e);
      }
      
      // 2. Storage event dispatch (cross-tab)
      try {
        const storageEvent = new StorageEvent('storage', {
          key: `poll_${pollData.pollId}`,
          newValue: JSON.stringify({
            voteCounts: newCounts,
            timestamp: Date.now()
          })
        });
        window.dispatchEvent(storageEvent);
        console.log('VotingPage: Storage event dispatched');
      } catch (e) {
        console.warn('VotingPage: Storage event dispatch failed:', e);
      }
      
      // 3. Custom event dispatch (same-tab)
      try {
        const voteEvent = new CustomEvent('voteUpdate', {
          detail: { 
            pollId: pollData.pollId, 
            voteCounts: newCounts,
            optionIndex,
            optionName: pollData.options[optionIndex],
            timestamp: Date.now(),
            source: 'VotingPage'
          }
        });
        window.dispatchEvent(voteEvent);
        console.log('VotingPage: Custom vote event dispatched');
      } catch (e) {
        console.warn('VotingPage: Custom event dispatch failed:', e);
      }
      
      // 4. Parent callback
      if (onVoteSubmit) {
        try {
          onVoteSubmit(optionIndex);
          console.log('VotingPage: Parent callback executed');
        } catch (e) {
          console.error('VotingPage: Parent callback failed:', e);
        }
      }
      
      // 5. Force window events for additional sync
      try {
        window.dispatchEvent(new Event('focus'));
        window.dispatchEvent(new Event('blur'));
      } catch (e) {
        console.warn('VotingPage: Additional sync events failed:', e);
      }
      
      console.log('=== VotingPage: VOTE SUBMISSION SUCCESS ===');
      return true;
      
    } catch (error) {
      console.error('=== VotingPage: VOTE SUBMISSION FAILED ===');
      console.error('Error:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null || timeRemaining <= 0 || hasVoted || pollExpired || isSubmitting) {
      return;
    }

    console.log('VotingPage: Starting vote submission process...');
    setIsSubmitting(true);
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const success = submitVoteToGlobalStorage(selectedOption);
      
      if (success) {
        console.log('VotingPage: Vote submission successful');
        setHasVoted(true);
        
        // Give sync methods time to propagate
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.error('VotingPage: Vote submission failed');
        alert('Failed to submit vote. Please try again.');
      }
      
    } catch (error) {
      console.error('VotingPage: Error during submission:', error);
      alert('An error occurred while submitting your vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (selectedOption === null || hasVoted) return;
    
    console.log('VotingPage: Auto-submitting due to timeout');
    try {
      const success = submitVoteToGlobalStorage(selectedOption);
      if (success) {
        setHasVoted(true);
        console.log('VotingPage: Auto-submission successful');
      }
    } catch (error) {
      console.error('VotingPage: Auto-submission failed:', error);
    }
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 100);
    }
  };

  const isVotingDisabled = timeRemaining <= 0 || pollExpired;
  const isSubmitDisabled = selectedOption === null || isVotingDisabled || hasVoted || isSubmitting;

  // Poll not found state
  if (pollNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Poll Not Found</h2>
          <p className="text-gray-600 mb-6">
            This poll may have expired or the link is invalid.
          </p>
          <button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Poll expired state
  if (pollExpired && !hasVoted && selectedOption === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={32} className="text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Voting Ended</h2>
          <p className="text-gray-600 mb-2">
            The voting time has expired. Thank you for your interest.
          </p>
          {pollData && (
            <p className="text-sm text-gray-500 mb-6">
              Poll ran for {formatTime(pollData.duration)}
            </p>
          )}
          <button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Vote submitted state
  if (hasVoted && pollData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vote Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for participating in the vote. Your response has been recorded.
          </p>
          {selectedOption !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700">
                You voted for: <span className="font-semibold">{pollData.options[selectedOption]}</span>
              </p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <p className="text-xs text-gray-500">
              Your vote has been counted and will appear in the live results.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main voting interface
  if (!pollData) return null;

  const progressPercentage = Math.max(0, ((pollData.duration - timeRemaining) / pollData.duration) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Vote size={24} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vote Now</h1>
          <h2 className="text-lg font-semibold text-gray-700">{pollData.votingPrompt}</h2>
        </div>

        {/* Enhanced Timer with Progress */}
        <div className={`text-center mb-6 p-4 rounded-lg ${
          timeRemaining <= 30 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={16} className={timeRemaining <= 30 ? 'text-red-600' : 'text-blue-600'} />
            <span className={`font-semibold text-sm ${
              timeRemaining <= 30 ? 'text-red-600' : 'text-blue-600'
            }`}>
              {isVotingDisabled ? 'Voting has ended' : `Time remaining: ${formatTime(timeRemaining)}`}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeRemaining <= 30 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-600">
            {formatTime(pollData.duration - timeRemaining)} of {formatTime(pollData.duration)}
          </div>
        </div>

        {/* Voting disabled message */}
        {isVotingDisabled && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-700 font-medium">Voting time has expired</p>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {pollData.options.map((option, index) => (
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
            Poll ID: {pollData.pollId} | Duration: {formatTime(pollData.duration)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;