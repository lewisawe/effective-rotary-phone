
import React from 'react';
import type { Costume } from '../types';

interface HistoryPanelProps {
  costumes: Costume[];
  onSelect: (costumeId: string) => void;
  currentCostumeId?: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ costumes, onSelect, currentCostumeId }) => {
  if (costumes.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-4 bg-gray-800/50 rounded-lg animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-200 mb-3 text-center">Your Spooky Creations</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {costumes.map((costume) => (
          <button
            key={costume.id}
            onClick={() => onSelect(costume.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              currentCostumeId === costume.id
                ? 'bg-orange-600 text-white font-semibold'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {costume.costumeName}
          </button>
        ))}
      </div>
    </div>
  );
};
