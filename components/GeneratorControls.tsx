
import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { CostumePrompt } from './CostumePrompt';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PumpkinIcon } from './icons/PumpkinIcon';

interface GeneratorControlsProps {
  onGenerateWithImage: (base64: string, mimeType: string, prompt: string) => void;
  onGenerateRandom: (prompt: string) => void;
  onSearch: (prompt: string) => void;
  isLoading: boolean;
}

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  onGenerateWithImage,
  onGenerateRandom,
  onSearch,
  isLoading,
}) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'image' | 'text' | 'search'>('image');

  const handleImageUpload = (base64: string, type: string) => {
    setImageBase64(base64);
    setMimeType(type);
  };

  const handleGenerate = () => {
    if (isLoading) return;
    if (activeTab === 'image' && imageBase64 && mimeType) {
      onGenerateWithImage(imageBase64, mimeType, prompt);
    } else if (activeTab === 'text') {
      onGenerateRandom(prompt);
    } else if (activeTab === 'search') {
      onSearch(prompt || "5 creative halloween costume ideas");
    }
  };
  
  const canSubmit = !isLoading && (
      (activeTab === 'image' && imageBase64) ||
      (activeTab === 'text') ||
      (activeTab === 'search')
  );

  const getButtonText = () => {
    if (isLoading) return "Conjuring...";
    switch(activeTab) {
      case 'image': return 'Generate from Image';
      case 'text': return 'Generate Random Idea';
      case 'search': return 'Search for Ideas';
      default: return 'Generate';
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'image':
        return (
          <>
            <ImageUploader onImageUpload={handleImageUpload} imagePreview={imagePreview} setImagePreview={setImagePreview} />
            <CostumePrompt prompt={prompt} setPrompt={setPrompt} placeholder="Any preferences? e.g., 'make it funny', 'use household items'..." />
          </>
        );
      case 'text':
        return (
          <div className="text-center p-8 bg-gray-800/50 rounded-lg">
            <PumpkinIcon className="w-16 h-16 mx-auto text-orange-400" />
            <p className="mt-4 text-gray-300">Let the AI surprise you with a completely random costume idea!</p>
            <CostumePrompt prompt={prompt} setPrompt={setPrompt} placeholder="Optional: add a theme, e.g., 'sci-fi', 'food-related'..." />
          </div>
        );
      case 'search':
         return (
          <div className="text-center p-8 bg-gray-800/50 rounded-lg">
            <SearchIcon className="w-16 h-16 mx-auto text-orange-400" />
            <p className="mt-4 text-gray-300">Describe what you're looking for, and we'll find a few ideas!</p>
            <CostumePrompt prompt={prompt} setPrompt={setPrompt} placeholder="e.g., 'costumes for couples', 'ideas for my dog'..." />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
       <div className="flex justify-center bg-gray-800/50 rounded-lg p-1">
        <button onClick={() => setActiveTab('image')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'image' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>From Image</button>
        <button onClick={() => setActiveTab('text')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'text' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Random Idea</button>
        <button onClick={() => setActiveTab('search')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'search' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Search Ideas</button>
      </div>

      <div className="space-y-4">{renderTabContent()}</div>

      <button
        onClick={handleGenerate}
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        <MagicWandIcon className="w-5 h-5 mr-2" />
        {getButtonText()}
      </button>
    </div>
  );
};
