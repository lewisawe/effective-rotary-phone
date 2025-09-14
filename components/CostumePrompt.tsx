
import React from 'react';

interface CostumePromptProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  placeholder: string;
}

export const CostumePrompt: React.FC<CostumePromptProps> = ({ prompt, setPrompt, placeholder }) => {
  return (
    <textarea
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 transition"
      rows={2}
      aria-label="Costume preferences prompt"
    />
  );
};
