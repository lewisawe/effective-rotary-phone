import React, { useState, useEffect } from 'react';
import type { Chat } from '@google/genai';
import {
  generateRandomCostumeIdea,
  startCostumeChat,
  refineCostume,
  searchCostumeIdeas,
} from './services/geminiService';
import type { Costume } from './types';
import { Header } from './components/Header';
import { GeneratorControls } from './components/GeneratorControls';
import { CostumeDisplay } from './components/CostumeDisplay';
import { Loader } from './components/Loader';
import { HistoryPanel } from './components/HistoryPanel';
import { SearchResults } from './components/SearchResults';

type View = 'generator' | 'display' | 'search';

function App() {
  const [currentCostume, setCurrentCostume] = useState<Costume | null>(null);
  const [costumeHistory, setCostumeHistory] = useState<Costume[]>([]);
  const [searchResults, setSearchResults] = useState<Costume[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('generator');

  useEffect(() => {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      // Wait 5 seconds as requested in a previous turn
      setTimeout(() => {
        splashScreen.classList.add('opacity-0');
        // Remove from DOM after fade-out transition (500ms in index.html)
        setTimeout(() => {
          splashScreen.remove();
        }, 500);
      }, 5000);
    }
  }, []); // Empty dependency array to run only once on mount

  const handleError = (err: unknown, message: string) => {
    console.error(message, err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    setError(errorMessage);
    setIsLoading(false);
  };

  const addCostumeToHistory = (costume: Costume) => {
    // Avoid adding duplicates if refining
    if (!costumeHistory.some(c => c.id === costume.id)) {
      setCostumeHistory(prev => [...prev, costume]);
    }
  }

  const handleGenerateWithImage = async (base64: string, mimeType: string, prompt: string) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing image and brewing up a costume...');
    setError(null);
    setSearchResults([]); // Clear previous search results
    try {
      const { costume, chat: newChat } = await startCostumeChat(base64, mimeType, prompt);
      setCurrentCostume(costume);
      setChat(newChat);
      addCostumeToHistory(costume);
      setView('display');
    } catch (err) {
      handleError(err, 'Failed to generate costume from image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRandom = async (prompt: string) => {
    setIsLoading(true);
    setLoadingMessage('Stirring the cauldron for a random idea...');
    setError(null);
    setSearchResults([]); // Clear previous search results
    try {
      const costume = await generateRandomCostumeIdea(prompt);
      setCurrentCostume(costume);
      setChat(null); // No chat session for random generation
      addCostumeToHistory(costume);
      setView('display');
    } catch (err) {
      handleError(err, 'Failed to generate random costume.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (prompt: string) => {
    setIsLoading(true);
    setLoadingMessage('Searching the haunted library for ideas...');
    setError(null);
    try {
      const results = await searchCostumeIdeas(prompt);
      setSearchResults(results);
      setView('search');
    } catch (err) {
      handleError(err, 'Failed to search for costume ideas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (refinementPrompt: string) => {
    if (!chat || !currentCostume) return;
    setIsLoading(true);
    setLoadingMessage('Recasting the spell with your refinements...');
    setError(null);
    try {
      const newCostume = await refineCostume(chat, refinementPrompt, currentCostume.costumeName);
      // Replace the old version in history with the new one
      setCostumeHistory(prev => prev.map(c => c.id === currentCostume.id ? newCostume : c));
      setCurrentCostume(newCostume);
    } catch (err) {
      handleError(err, 'Failed to refine costume.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToResults = () => {
    setCurrentCostume(null);
    setView('search');
  };

  const handleSelectCostumeFromHistory = (costumeId: string) => {
      const selected = costumeHistory.find(c => c.id === costumeId);
      if(selected) {
        setCurrentCostume(selected);
        setView('display');
      }
  };

  const handleSelectFromSearch = (costume: Costume) => {
    // A searched costume doesn't have a chat, so treat it like a random one.
    setCurrentCostume(costume);
    addCostumeToHistory(costume);
    setChat(null);
    setView('display');
  };

  const handleClear = () => {
    setCurrentCostume(null);
    setSearchResults([]);
    setChat(null);
    setView('generator');
    setError(null);
  };

  const renderContent = () => {
    switch(view) {
        case 'display':
            return currentCostume && (
                <CostumeDisplay
                    costume={currentCostume}
                    onRefine={handleRefine}
                    onClear={handleClear}
                    onBack={searchResults.length > 0 ? handleBackToResults : undefined}
                    isLoading={isLoading}
                />
            );
        case 'search':
            return <SearchResults results={searchResults} onSelect={handleSelectFromSearch} onClear={handleClear} />
        case 'generator':
        default:
            return <GeneratorControls
                onGenerateWithImage={handleGenerateWithImage}
                onGenerateRandom={handleGenerateRandom}
                onSearch={handleSearch}
                isLoading={isLoading}
            />
    }
  }


  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6">
      <Header onHomeClick={handleClear} />
      <main className="container mx-auto mt-6 relative">
        {isLoading && <Loader message={loadingMessage} />}
        {error && (
            <div className="w-full max-w-2xl mx-auto my-4 p-4 bg-red-800/50 border border-red-700 rounded-lg text-center">
                <p className="font-semibold">An Error Occurred</p>
                <p className="text-sm">{error}</p>
                <button onClick={() => setError(null)} className="mt-2 text-xs font-bold underline">Dismiss</button>
            </div>
        )}
        
        {renderContent()}

        {costumeHistory.length > 0 && view !== 'search' && (
             <HistoryPanel 
                costumes={costumeHistory}
                onSelect={handleSelectCostumeFromHistory}
                currentCostumeId={currentCostume?.id}
            />
        )}
      </main>
    </div>
  );
}

export default App;