
import React from 'react';
import { WitchHatIcon } from './icons/WitchHatIcon';

interface HeaderProps {
    onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="text-center py-6">
      <button 
        onClick={onHomeClick} 
        className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg w-full"
        aria-label="Go to home screen"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-orange-500 font-serif flex items-center justify-center gap-3 transition-transform group-hover:scale-105">
          <WitchHatIcon className="w-10 h-10" />
          AI Halloween Costume Generator
          <WitchHatIcon className="w-10 h-10 transform -scale-x-100" />
        </h1>
        <p className="text-gray-400 mt-2 group-hover:text-orange-400 transition-colors">
          Create your unique spooky look with the power of AI!
        </p>
      </button>
    </header>
  );
};