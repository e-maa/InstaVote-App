// components/SetupStep.tsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface SetupStepProps {
  onSubmit: (prompt: string, options: string[]) => void;
}

const SetupStep: React.FC<SetupStepProps> = ({ onSubmit }) => {
  const [votingPrompt, setVotingPrompt] = useState('');
  const [options, setOptions] = useState(['']);

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

  const handleSubmit = () => {
    const filledOptions = options.filter(name => name.trim() !== '');
    if (votingPrompt.trim() && filledOptions.length >= 2) {
      onSubmit(votingPrompt, filledOptions);
    }
  };

  const isSubmitDisabled = !votingPrompt.trim() || options.filter(name => name.trim()).length < 2;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Voting Prompt Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Enter your voting question
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

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Submit
      </button>
    </div>
  );
};

export default SetupStep;