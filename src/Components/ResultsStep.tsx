// components/ResultsStep.tsx
import React from 'react';
import { Trophy, BarChart3, RotateCcw, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsStepProps {
  votingPrompt: string;
  options: string[];
  voteCounts: number[]; // Add voteCounts prop
  onNewVote: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ 
  votingPrompt, 
  options,
  voteCounts, // Receive actual vote counts
  onNewVote 
}) => {
  // Calculate results from actual vote counts
  const results = options.map((option, index) => ({
    name: option,
    votes: voteCounts[index] || 0,
  })).sort((a, b) => b.votes - a.votes); // Sort by votes descending

  const totalVotes = results.reduce((sum, result) => sum + result.votes, 0);
  
  // Calculate percentages
  const resultsWithPercentage = results.map(result => ({
    ...result,
    percentage: totalVotes > 0 ? Math.round((result.votes / totalVotes) * 100) : 0,
  }));

  const winner = totalVotes > 0 ? resultsWithPercentage[0] : null;

  // Colors for the bar chart
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  // Custom tooltip for the bar chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{`${label}`}</p>
          <p className="text-blue-600">{`Votes: ${payload[0].value}`}</p>
          <p className="text-gray-600">{`Percentage: ${Math.round((payload[0].value / totalVotes) * 100)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Results Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy size={28} />
          <span className="text-2xl font-bold">Voting Results</span>
        </div>
        <h2 className="text-xl opacity-90">{votingPrompt}</h2>
      </div>

      {/* Winner Announcement - Only show if there are votes */}
      {winner && winner.votes > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy size={24} className="text-yellow-600" />
            <span className="text-xl font-bold text-yellow-800">Winner!</span>
          </div>
          <h3 className="text-2xl font-bold text-yellow-900 mb-2">{winner.name}</h3>
          <p className="text-yellow-700">
            {winner.votes} votes ({winner.percentage}% of total)
          </p>
        </div>
      )}

      {/* Detailed Results with Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <BarChart3 size={24} className="text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-800">Detailed Results</h3>
        </div>

        {/* Bar Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={resultsWithPercentage}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Votes', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                {resultsWithPercentage.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Results Summary Table */}
        <div className="space-y-3">
          {resultsWithPercentage.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="font-medium text-gray-800">{result.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-800">{result.votes} votes</span>
                <span className="text-sm text-gray-600 ml-2">({result.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Votes */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Users size={20} />
            <span className="font-medium">Total Votes: {totalVotes}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onNewVote}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <RotateCcw size={20} />
          Start New Vote
        </button>
      </div>
    </div>
  );
};

export default ResultsStep;