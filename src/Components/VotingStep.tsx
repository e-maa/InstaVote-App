// components/VotingStep.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Users, Vote, Copy, Check, Share, TrendingUp } from 'lucide-react';

interface VotingStepProps {
  votingPrompt: string;
  options: string[];
  timeRemaining: number;
  pollId: string;
  startTime: number;
  duration: number;
  voteCounts: number[];
}

const VotingStep: React.FC<VotingStepProps> = ({ 
  votingPrompt, 
  options, 
  timeRemaining,
  pollId,
  startTime,
  duration,
  voteCounts
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [localVoteCounts, setLocalVoteCounts] = useState<number[]>(voteCounts);
  
  // Poll data for sharing
  const pollDataEncoded = encodeURIComponent(JSON.stringify({
    votingPrompt,
    options,
    pollId,
    startTime,
    duration
  }));
  const votingUrl = `${window.location.origin}?poll=${pollDataEncoded}`;
  
  // Update local vote counts when prop changes
  useEffect(() => {
    setLocalVoteCounts(voteCounts);
  }, [voteCounts]);

  // Real-time vote synchronization
  useEffect(() => {
    if (!pollId) return;
    
    const syncVoteCounts = () => {
      if (typeof window !== 'undefined' && window.globalVoteCounts && window.globalVoteCounts[pollId]) {
        const currentCounts = [...window.globalVoteCounts[pollId]];
        setLocalVoteCounts(prevCounts => {
          const hasChanged = !prevCounts || 
            prevCounts.length !== currentCounts.length || 
            prevCounts.some((count, index) => count !== currentCounts[index]);
          
          if (hasChanged) {
            return currentCounts;
          }
          return prevCounts;
        });
      }
    };

    // Set up event listeners for real-time updates
    const handleVoteUpdate = (e: CustomEvent) => {
      if (e.detail?.pollId === pollId && Array.isArray(e.detail.voteCounts)) {
        setLocalVoteCounts([...e.detail.voteCounts]);
      }
    };

    // Add event listener
    window.addEventListener('voteUpdate', handleVoteUpdate as EventListener);

    // Poll for updates every 500ms
    const pollInterval = setInterval(syncVoteCounts, 500);

    return () => {
      window.removeEventListener('voteUpdate', handleVoteUpdate as EventListener);
      clearInterval(pollInterval);
    };
  }, [pollId]);
  
  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(votingUrl)}`;
        setQrCodeDataUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [votingUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(votingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const sharePoll = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: votingPrompt,
          text: `Vote on this poll: ${votingPrompt}`,
          url: votingUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying if Web Share API isn't supported
      copyToClipboard();
    }
  };

  const totalVotes = localVoteCounts.reduce((sum, count) => sum + count, 0);
  const progressPercentage = Math.max(0, ((duration - timeRemaining) / duration) * 100);

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Timer with Progress */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock size={24} />
          <span className="text-lg font-semibold">Time Remaining</span>
        </div>
        <div className="text-4xl font-bold font-mono mb-3">{formatTime(timeRemaining)}</div>
        
        {/* Progress Bar */}
        <div className="w-full bg-opacity-30 rounded-full h-2 mb-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-sm opacity-90">
          {Math.floor(progressPercentage)}% complete
        </div>
      </div>

      {/* Voting Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{votingPrompt}</h2>
        <div className="flex items-center justify-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span>{options.filter(name => name.trim()).length} options</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} />
            <span>{totalVotes} votes</span>
          </div>
        </div>
      </div>

      {/* Share Section - Combined QR and URL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Share This Poll</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code for voting" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs">Generating QR Code...</p>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">Scan to vote</p>
          </div>
          
          {/* URL and Share Buttons */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Voting Link:</p>
              <div className="flex items-center gap-2 justify-center">
                <p className="text-sm text-blue-600 font-mono break-all max-w-xs truncate">{votingUrl}</p>
                <button
                  onClick={copyToClipboard}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              <button
                onClick={sharePoll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Share size={18} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Results */}
      {totalVotes > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Results</h3>
          <div className="space-y-4">
            {options.map((option, index) => {
              const voteCount = localVoteCounts[index] || 0;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isLeading = voteCount > 0 && voteCount === Math.max(...localVoteCounts);
              
              return (
                <div key={index} className={`p-4 rounded-lg border transition-all ${isLeading ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${isLeading ? 'text-blue-800' : 'text-gray-800'}`}>
                      {option}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-700 ease-out ${isLeading ? 'bg-blue-500' : 'bg-gray-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Vote Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="text-center">
            <Vote size={40} className="text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Waiting for Votes</h3>
            <p className="text-blue-600">
              Share this poll to start collecting votes!
            </p>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Live - {totalVotes} vote{totalVotes !== 1 ? 's' : ''} received</span>
        </div>
      </div>
    </div>
  );
};

export default VotingStep;