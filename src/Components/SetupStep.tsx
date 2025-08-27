// components/SetupStep.tsx
import React, { useState } from 'react';
import { Plus, X, Clock } from 'lucide-react';

interface SetupStepProps {
  onSubmit: (prompt: string, options: string[], duration: number) => void;
}

const SetupStep: React.FC<SetupStepProps> = ({ onSubmit }) => {
  const [votingPrompt, setVotingPrompt] = useState('');
  const [options, setOptions] = useState(['']);
  const [duration, setDuration] = useState(5); // Default 5 minutes
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  // Predefined duration options in minutes (much more user-friendly)
  const durationOptions = [
    { label: '1 min', value: 1 },
    { label: '2 min', value: 2 },
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: 'Custom', value: -1 }
  ];

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
    }
  };

  const formatDurationDisplay = (minutes: number) => {
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  const handleDurationSelect = (value: number) => {
    if (value === -1) {
      setShowCustomDuration(true);
    } else {
      setShowCustomDuration(false);
      setDuration(value);
    }
  };

  const handleSubmit = () => {
    // Convert minutes to seconds for the parent component
    const durationInSeconds = duration * 60;
    const filledOptions = options.filter(name => name.trim() !== '');
    if (votingPrompt.trim() && filledOptions.length >= 2 && duration > 0) {
      onSubmit(votingPrompt, filledOptions, durationInSeconds);
    }
  };

  const isSubmitDisabled = !votingPrompt.trim() || options.filter(name => name.trim()).length < 2 || duration <= 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Voting Prompt Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Enter your poll question
        </label>
        <input
          type="text"
          value={votingPrompt}
          onChange={(e) => setVotingPrompt(e.target.value)}
          placeholder="e.g., Who should be the team leader?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Options Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Add Options</h3>
          <span className="text-sm text-gray-500">
            {options.filter(name => name.trim()).length} Option{options.filter(name => name.trim()).length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {options.length > 1 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addOption}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Option
        </button>
      </div>

      {/* Simplified Poll Duration Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">How long should the poll run?</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDurationSelect(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                (option.value === duration || (option.value === -1 && showCustomDuration))
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom Duration Input - Only shown when Custom is selected */}
        {showCustomDuration && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set custom duration (minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 5))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter minutes"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                = {formatDurationDisplay(duration)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum: 1 minute, Maximum: 24 hours (1440 minutes)
            </p>
          </div>
        )}

        {/* Duration Preview */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">Poll will run for:</span>
            <span className="font-bold text-blue-900">{formatDurationDisplay(duration)}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        Start Poll ({formatDurationDisplay(duration)})
      </button>
    </div>
  );
};

export default SetupStep;