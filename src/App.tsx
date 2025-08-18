// App.tsx
import React, { useState, useEffect } from 'react';
import Header from './Components/Header';
import SetupStep from './Components/SetupStep';
import VotingStep from './Components/VotingStep';
import ResultsStep from './Components/ResultsStep';
import Footer from './Components/Footer';
import type { AppStep } from './Types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('setup');
  const [votingPrompt, setVotingPrompt] = useState('');
  const [options, setOptions] = useState(['']);
  const [timeRemaining, setTimeRemaining] = useState(60); // 1 minute in seconds
  const [voteCounts, setVoteCounts] = useState<number[]>([]);
  const [pollId, setPollId] = useState('');
  // Initialize vote counts when options change
  useEffect(() => {
    if (options.length > 0 && step === 'voting') {
      setVoteCounts(Array(options.length).fill(0));
    }
  }, [options, step]);

  const handleSetupSubmit = (prompt: string, optionList: string[]) => {
    setVotingPrompt(prompt);
    setOptions(optionList);
    setStep('voting');
    setPollId(Math.random().toString(36).substring(2, 9)); // Generate unique poll ID
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVoteSubmit = (optionIndex: number) => {
    setVoteCounts(prevCounts => {
      const newCounts = [...prevCounts];
      newCounts[optionIndex] = (newCounts[optionIndex] || 0) + 1;
      return newCounts;
    });
  };

  const handleNewVote = () => {
    setStep('setup');
    setVotingPrompt('');
    setOptions(['']);
    setTimeRemaining(60);
    setVoteCounts([]);
    setPollId('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header currentStep={step} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {step === 'setup' && (
          <SetupStep onSubmit={handleSetupSubmit} />
        )}
        {step === 'voting' && (
          <VotingStep 
            votingPrompt={votingPrompt}
            options={options}
            timeRemaining={timeRemaining}
            onVoteSubmit={handleVoteSubmit}
          />
        )}
        {step === 'results' && (
          <ResultsStep 
            votingPrompt={votingPrompt}
            options={options}
            voteCounts={voteCounts}
            onNewVote={handleNewVote}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;