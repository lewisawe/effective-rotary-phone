
import React from 'react';
import { Costume } from '../types';
import { ClearIcon } from './icons/ClearIcon';
import { WitchHatIcon } from './icons/WitchHatIcon';

interface SearchResultsProps {
    results: Costume[];
    onSelect: (costume: Costume) => void;
    onClear: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect, onClear }) => {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up relative">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <button onClick={onClear} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <ClearIcon className="w-6 h-6" />
                </button>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-orange-500 font-serif">Here are some ideas...</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map(costume => (
                        <div key={costume.id} className="bg-gray-900/50 rounded-lg p-4 flex flex-col justify-between hover:border-orange-500 border border-transparent transition-all">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-200 mb-2">{costume.costumeName}</h3>
                                <p className="text-sm text-gray-400 mb-3">{costume.description}</p>
                                <div className="flex items-center gap-2 text-xs mb-3">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600/50 text-green-100">{costume.difficulty}</span>
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600/50 text-blue-100">{costume.estimatedCost}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => onSelect(costume)}
                                className="mt-4 w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-center text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-800 transition-colors"
                            >
                                <WitchHatIcon className="w-4 h-4 mr-2"/>
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
