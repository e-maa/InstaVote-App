// App.tsx
import React, { useState, useEffect } from 'react';
import Header from './Components/Header';
import SetupStep from './Components/SetupStep';
import VotingStep from './Components/VotingStep';
import ResultsStep from './Components/ResultsStep';
import VotingPage from './Components/VotingPage';
import Footer from './Components/Footer';
import type { AppStep } from './Types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('setup');
  const [votingPrompt, setVotingPrompt] = useState('');
  const [options, setOptions] = useState(['']);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [duration, setDuration] = useState(60); // Store the full duration
  const [voteCounts, setVoteCounts] = useState<number[]>([]);
  const [pollId, setPollId] = useState('');
  const [showVotingPage, setShowVotingPage] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);

  // Enhanced global vote storage initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.globalVoteCounts) {
        window.globalVoteCounts = {};
        console.log('🔧 Initialized global vote storage');
      }
    }
  }, []);

  // Handle QR poll loading with duration support
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pollParam = urlParams.get('poll');
    
    if (pollParam) {
      try {
        const pollData = JSON.parse(decodeURIComponent(pollParam));
        console.log('📱 Loading poll from QR:', pollData);
        
        setVotingPrompt(pollData.votingPrompt);
        setOptions(pollData.options);
        setPollId(pollData.pollId);
        setStartTime(pollData.startTime);
        setDuration(pollData.duration || 60); // Support legacy polls without duration
        
        // Initialize global vote counts for this poll
        if (typeof window !== 'undefined') {
          if (!window.globalVoteCounts[pollData.pollId]) {
            window.globalVoteCounts[pollData.pollId] = Array(pollData.options.length).fill(0);
            console.log('🔧 Initialized vote counts for QR poll:', pollData.pollId);
          } else {
            console.log('📊 Using existing vote counts:', window.globalVoteCounts[pollData.pollId]);
          }
        }
        
        // Calculate remaining time based on full duration
        const elapsed = Math.floor((Date.now() - pollData.startTime) / 1000);
        const remaining = Math.max(0, pollData.duration - elapsed);
        setTimeRemaining(remaining);
        setShowVotingPage(true);
        
        console.log(`⏱️ Poll loaded: ${remaining}s remaining of ${pollData.duration}s total`);
      } catch (error) {
        console.error('❌ Error parsing poll data:', error);
      }
    }
  }, []);

  // Initialize vote counts when entering voting step
  useEffect(() => {
    if (options.length > 0 && step === 'voting' && pollId) {
      if (typeof window !== 'undefined') {
        // Only initialize if not already existing
        if (!window.globalVoteCounts[pollId]) {
          const initialCounts = Array(options.length).fill(0);
          window.globalVoteCounts[pollId] = initialCounts;
          setVoteCounts(initialCounts);
          console.log('🔧 Initialized vote counts for new poll:', pollId, initialCounts);
        } else {
          // Use existing counts
          setVoteCounts([...window.globalVoteCounts[pollId]]);
          console.log('📊 Using existing vote counts:', window.globalVoteCounts[pollId]);
        }
      }
    }
  }, [options, step, pollId]);

  // Enhanced polling system for real-time vote updates
  useEffect(() => {
    if ((step === 'voting' || step === 'results') && pollId && typeof window !== 'undefined') {
      console.log('🔄 Setting up vote polling for poll:', pollId);
      
      const updateVoteCounts = () => {
        try {
          // First try to get from global storage
          if (window.globalVoteCounts && window.globalVoteCounts[pollId]) {
            const currentGlobalCounts = window.globalVoteCounts[pollId];
            setVoteCounts(prevCounts => {
              const hasChanged = !prevCounts || 
                prevCounts.length !== currentGlobalCounts.length || 
                prevCounts.some((c, i) => c !== currentGlobalCounts[i]);
              
              if (hasChanged) {
                console.log('📊 Vote counts updated:', currentGlobalCounts);
                return [...currentGlobalCounts];
              }
              return prevCounts;
            });
          }
        } catch (error) {
          console.error('❌ Error updating vote counts:', error);
        }
      };

      // Update immediately
      updateVoteCounts();

      // Poll every 500ms for real-time updates
      const pollInterval = setInterval(updateVoteCounts, 500);

      // Listen for custom vote events
      const handleVoteUpdate = (e: CustomEvent) => {
        if (e.detail?.pollId === pollId && Array.isArray(e.detail.voteCounts)) {
          console.log('📊 Received vote update event:', e.detail.voteCounts);
          setVoteCounts([...e.detail.voteCounts]);
        }
      };

      // Listen for storage events (cross-tab sync)
      const handleStorageEvent = (e: StorageEvent) => {
        if (e.key === `poll_${pollId}` && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            if (data.voteCounts) {
              console.log('📊 Storage event - vote counts updated:', data.voteCounts);
              setVoteCounts([...data.voteCounts]);
            }
          } catch (error) {
            console.error('❌ Error parsing storage event:', error);
          }
        }
      };

      window.addEventListener('voteUpdate', handleVoteUpdate as EventListener);
      window.addEventListener('storage', handleStorageEvent);

      return () => {
        clearInterval(pollInterval);
        window.removeEventListener('voteUpdate', handleVoteUpdate as EventListener);
        window.removeEventListener('storage', handleStorageEvent);
      };
    }
  }, [step, pollId]);

  // Updated setup submit handler with duration support
  const handleSetupSubmit = (prompt: string, optionList: string[], pollDuration: number) => {
    console.log('🚀 Starting new poll with duration:', pollDuration, 'seconds');
    
    setVotingPrompt(prompt);
    setOptions(optionList);
    setDuration(pollDuration);
    setStep('voting');
    
    const uniquePollId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    setPollId(uniquePollId);
    const currentTime = Date.now();
    setStartTime(currentTime);
    setTimeRemaining(pollDuration);
    
    // Clear any existing timer
    if (timerRef) {
      clearInterval(timerRef);
    }
    
    // Initialize global vote counts immediately
    if (typeof window !== 'undefined') {
      if (!window.globalVoteCounts) window.globalVoteCounts = {};
      window.globalVoteCounts[uniquePollId] = Array(optionList.length).fill(0);
      setVoteCounts([...window.globalVoteCounts[uniquePollId]]);
      console.log('🔧 Initialized vote counts for new poll:', uniquePollId);
    }

    // Start the countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log('⏰ Poll ended, switching to results');
          
          // Get final vote counts before switching to results
          if (typeof window !== 'undefined' && uniquePollId && window.globalVoteCounts[uniquePollId]) {
            const finalCounts = [...window.globalVoteCounts[uniquePollId]];
            console.log('📊 Final vote counts:', finalCounts);
            setVoteCounts(finalCounts);
          }
          
          setStep('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerRef(timer);
  };

  // Enhanced vote submission handler
  const handleVoteSubmit = (optionIndex: number) => {
    console.log('🗳️ Processing vote for option', optionIndex, '(' + options[optionIndex] + ')');
    
    if (typeof window !== 'undefined' && pollId) {
      // Ensure global storage exists
      if (!window.globalVoteCounts) {
        window.globalVoteCounts = {};
      }
      if (!window.globalVoteCounts[pollId]) {
        window.globalVoteCounts[pollId] = Array(options.length).fill(0);
        console.log('🔧 Created missing vote counts array for poll:', pollId);
      }

      // Increment the vote count
      const currentCount = window.globalVoteCounts[pollId][optionIndex] || 0;
      window.globalVoteCounts[pollId][optionIndex] = currentCount + 1;
      
      const newCounts = [...window.globalVoteCounts[pollId]];
      setVoteCounts(newCounts);
      
      console.log('✅ Vote recorded:', {
        option: options[optionIndex],
        newCount: newCounts[optionIndex],
        totalVotes: newCounts.reduce((sum, count) => sum + count, 0),
        allCounts: newCounts
      });

      // Enhanced multi-channel sync
      try {
        // 1. Dispatch custom event for same-tab updates
        const voteEvent = new CustomEvent('voteUpdate', {
          detail: { 
            pollId, 
            voteCounts: newCounts,
            optionIndex,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(voteEvent);
        
        // 2. Save to localStorage for cross-tab sync (if available)
        if (typeof Storage !== 'undefined') {
          localStorage.setItem(`poll_${pollId}`, JSON.stringify({
            voteCounts: newCounts,
            timestamp: Date.now()
          }));
        }
        
        console.log('📡 Vote synced across channels');
      } catch (error) {
        console.error('❌ Error syncing vote:', error);
      }
    }
  };

  // Reset handler
  const handleNewVote = () => {
    console.log('🔄 Resetting poll');
    
    if (timerRef) {
      clearInterval(timerRef);
      setTimerRef(null);
    }
    
    // Clean up global storage
    if (typeof window !== 'undefined' && pollId && window.globalVoteCounts) {
      delete window.globalVoteCounts[pollId];
    }
    
    // Clean up localStorage
    if (typeof Storage !== 'undefined' && pollId) {
      localStorage.removeItem(`poll_${pollId}`);
    }
    
    setStep('setup');
    setVotingPrompt('');
    setOptions(['']);
    setTimeRemaining(60);
    setDuration(60);
    setVoteCounts([]);
    setPollId('');
    setShowVotingPage(false);
    setStartTime(0);
    
    // Clear URL parameters
    window.history.pushState({}, '', window.location.pathname);
  };

  // Render voting page for QR code users
  if (showVotingPage) {
    const pollData = { 
      votingPrompt, 
      options, 
      pollId, 
      startTime,
      duration 
    };
    return <VotingPage pollData={pollData} onVoteSubmit={handleVoteSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header currentStep={step} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {step === 'setup' && <SetupStep onSubmit={handleSetupSubmit} />}
        {step === 'voting' && (
          <VotingStep 
            votingPrompt={votingPrompt}
            options={options}
            timeRemaining={timeRemaining}
            pollId={pollId}
            startTime={startTime}
            duration={duration}
            voteCounts={voteCounts}
          />
        )}
        {step === 'results' && (
          <ResultsStep 
            votingPrompt={votingPrompt}
            options={options}
            voteCounts={voteCounts}
            pollId={pollId}
            onNewVote={handleNewVote}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

// Enhanced global interface declaration
declare global {
  interface Window {
    globalVoteCounts: { [pollId: string]: number[] };
  }
}

export default App;