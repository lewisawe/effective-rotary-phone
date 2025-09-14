import React from 'react';
import { GhostIcon } from './icons/GhostIcon';

interface LoaderProps {
    message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg z-10">
      <GhostIcon className="w-20 h-20 text-orange-500 animate-bounce" />
      <p className="mt-4 text-lg font-semibold text-gray-300 text-center px-4">{message}</p>
    </div>
  );
};