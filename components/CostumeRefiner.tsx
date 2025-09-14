import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface CostumeRefinerProps {
    onRefine: (prompt: string) => void;
    isLoading: boolean;
}

export const CostumeRefiner: React.FC<CostumeRefinerProps> = ({ onRefine, isLoading }) => {
    const [refinementPrompt, setRefinementPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (refinementPrompt.trim() && !isLoading) {
            onRefine(refinementPrompt);
            setRefinementPrompt('');
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                 <input
                    type="text"
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    placeholder="e.g., 'Make it scarier' or 'Suggest cheaper materials...'"
                    className="flex-grow w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 transition"
                    aria-label="Refine costume prompt"
                />
                <button
                    type="submit"
                    disabled={isLoading || !refinementPrompt.trim()}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-center text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Refining...' : (
                        <>
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Refine
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};