import React, { useRef } from 'react';
import type { Costume, InstructionStep } from '../types';
import { ActionButtons } from './ActionButtons';
import { CostumeRefiner } from './CostumeRefiner';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { ScrollIcon } from './icons/ScrollIcon';
import { ClearIcon } from './icons/ClearIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface CostumeDisplayProps {
  costume: Costume;
  onRefine: (prompt: string) => void;
  onClear: () => void;
  isLoading: boolean;
  onBack?: () => void;
}

const DifficultyBadge: React.FC<{ level: 'Easy' | 'Medium' | 'Hard' }> = ({ level }) => {
  const colorMap = {
    Easy: 'bg-green-600 text-green-100',
    Medium: 'bg-yellow-600 text-yellow-100',
    Hard: 'bg-red-600 text-red-100',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[level]}`}>{level}</span>;
};

const CostBadge: React.FC<{ cost: '$' | '$$' | '$$$' }> = ({ cost }) => {
  return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-blue-100">{cost}</span>;
}

export const CostumeDisplay: React.FC<CostumeDisplayProps> = ({ costume, onRefine, onClear, isLoading, onBack }) => {
  const downloadRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up relative">
       {onBack && (
        <button
          onClick={onBack}
          className="absolute -top-12 left-0 inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-semibold print-hidden"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Results
        </button>
      )}
      <div ref={downloadRef} className="bg-gray-800 rounded-lg shadow-lg p-6 printable-area">
        <button onClick={onClear} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors print-hidden">
            <ClearIcon className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-orange-500 font-serif">{costume.costumeName}</h2>
          <p className="text-gray-300 mt-2">{costume.description}</p>
          <div className="flex justify-center items-center gap-4 mt-4">
            <DifficultyBadge level={costume.difficulty} />
            <CostBadge cost={costume.estimatedCost} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Materials */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center gap-2"><ShoppingCartIcon className="w-5 h-5"/>Materials</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {costume.materials.map((material, index) => (
                <li key={index}>{material}</li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-gray-900/50 rounded-lg p-4 md:col-span-1">
            <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center gap-2"><ScrollIcon className="w-5 h-5" />Instructions</h3>
            <div className="space-y-4">
                {costume.instructions.map((step: InstructionStep, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">{index + 1}</div>
                        <div className="flex-1">
                          <p className="text-gray-200 font-semibold">{step.text}</p>
                          
                          {step.subSteps && step.subSteps.length > 0 && (
                            <ul className="list-disc list-inside text-gray-400 space-y-1 mt-2 ml-4 text-sm">
                              {step.subSteps.map((subStep, subIndex) => (
                                <li key={subIndex}>{subStep}</li>
                              ))}
                            </ul>
                          )}

                          {step.imageUrl ? (
                            <img src={step.imageUrl} alt={`Instruction step ${index + 1}`} className="mt-2 rounded-lg border border-gray-700" />
                          ) : (
                            <div className="mt-2 h-24 w-24 bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400">No Image</div>
                          )}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 print-hidden">
        <ActionButtons costume={costume} downloadRef={downloadRef} />
        <CostumeRefiner onRefine={onRefine} isLoading={isLoading} />
      </div>
    </div>
  );
};