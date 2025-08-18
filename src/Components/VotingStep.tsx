// components/VotingStep.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Users, Vote, ExternalLink, Copy, Check } from 'lucide-react';

interface VotingStepProps {
  votingPrompt: string;
  options: string[];
  timeRemaining: number;
  onVoteSubmit: (optionIndex: number) => void; // Add callback for vote submission
}

// ... (VotingInterface component remains the same)

// Main VotingStep component
const VotingStep: React.FC<VotingStepProps> = ({ 
  votingPrompt, 
  options, 
  timeRemaining,
  onVoteSubmit // Receive vote submission callback
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showVotingInterface, setShowVotingInterface] = useState(false);
  
  // Generate unique poll ID (in real app, this would come from backend)
  const pollId = Math.random().toString(36).substr(2, 9);
  
  // Construct voting URL with poll data
  const votingUrl = `${window.location.origin}/vote/${pollId}`;
  
  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Using QR Server API (free service) to generate QR code
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

  const openVotingInterface = () => {
    setShowVotingInterface(true);
  };

  const closeVotingInterface = () => {
    setShowVotingInterface(false);
  };

  // If showing voting interface, render it as an overlay
  if (showVotingInterface) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative max-w-md w-full mx-4">
          <button
            onClick={closeVotingInterface}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl font-bold z-10"
          >
            ✕ Close
          </button>
          <VotingInterface
            votingPrompt={votingPrompt}
            options={options}
            initialTimeRemaining={timeRemaining}
            onVoteSubmit={onVoteSubmit} // Pass callback to VotingInterface
            pollId={pollId}
            onClose={closeVotingInterface}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Timer */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock size={24} />
          <span className="text-lg font-semibold">Time Remaining</span>
        </div>
        <div className="text-4xl font-bold font-mono">{formatTime(timeRemaining)}</div>
      </div>

      {/* Voting Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{votingPrompt}</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Users size={20} />
          <span>{options.filter(name => name.trim()).length} options</span>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Scan to Vote</h3>
        
        {/* QR Code */}
        <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4 p-4">
          {qrCodeDataUrl ? (
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code for voting" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm">Generating QR Code...</p>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mb-4">Scan this QR code with your phone to vote</p>
        
        {/* Voting URL */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Voting URL:</p>
          <div className="flex items-center gap-2 justify-center">
            <p className="text-sm text-blue-600 font-mono break-all">{votingUrl}</p>
            <button
              onClick={copyToClipboard}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Test Vote Button */}
        <div className="mt-4">
          <button
            onClick={openVotingInterface}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <ExternalLink size={16} />
            Test Vote Interface
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 text-green-700">
          <Vote size={20} />
          <span className="font-semibold">Voting is Live!</span>
        </div>
        <p className="text-green-600 text-sm mt-1">
          Share the QR code or URL for others to vote
        </p>
      </div>
    </div>
  );
};

export default VotingStep;