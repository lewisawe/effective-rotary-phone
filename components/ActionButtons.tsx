import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import type { Costume } from '../types';
import { ShareIcon } from './icons/ShareIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { PrintIcon } from './icons/PrintIcon';

interface ActionButtonsProps {
  costume: Costume;
  downloadRef: React.RefObject<HTMLDivElement>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ costume, downloadRef }) => {
  const [copyStatus, setCopyStatus] = useState('');

  const formatShareText = () => {
    const instructionsText = costume.instructions.map((step, i) => {
      const mainStep = `${i + 1}. ${step.text}`;
      const subStepsText = step.subSteps.map(sub => `  - ${sub}`).join('\n');
      return `${mainStep}\n${subStepsText}`;
    }).join('\n\n');

    return `🎃 Halloween Costume Idea: ${costume.costumeName} 🎃

"${costume.description}"

*Difficulty: ${costume.difficulty} | Est. Cost: ${costume.estimatedCost}*

🛠️ Materials:
${costume.materials.map(m => `- ${m}`).join('\n')}

📜 Instructions:
${instructionsText}
`;
  };

  const handleShare = async () => {
    const shareData = {
      title: `Halloween Costume: ${costume.costumeName}`,
      text: formatShareText(),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(formatShareText());
        setCopyStatus('Copied to clipboard!');
        setTimeout(() => setCopyStatus(''), 2000);
      } catch (err) {
        setCopyStatus('Failed to copy!');
        setTimeout(() => setCopyStatus(''), 2000);
      }
    }
  };

  const handleDownload = () => {
    const element = downloadRef.current;
    if (element) {
      // Store original styles to revert back to
      const originalMaxHeight = element.style.maxHeight;
      const originalOverflowY = element.style.overflowY;

      // Temporarily override styles to ensure the whole content is rendered
      element.style.maxHeight = 'none';
      element.style.overflowY = 'visible';

      html2canvas(element, {
        backgroundColor: '#1f2937', // bg-gray-800
        useCORS: true,
        scale: 2, // Higher resolution
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `${costume.costumeName.toLowerCase().replace(/\s+/g, '-')}-costume.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).finally(() => {
        // Revert styles back to original values after canvas is generated
        element.style.maxHeight = originalMaxHeight;
        element.style.overflowY = originalOverflowY;
      });
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <button onClick={handleShare} className="flex-1 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-white bg-gray-600/50 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-700 transition-colors">
        <ShareIcon className="w-4 h-4 mr-2" />
        {copyStatus || 'Share'}
      </button>
      <button onClick={handleDownload} className="flex-1 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-white bg-gray-600/50 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-700 transition-colors">
        <DownloadIcon className="w-4 h-4 mr-2" />
        Download
      </button>
      <button onClick={handlePrint} className="flex-1 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-white bg-gray-600/50 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-700 transition-colors">
        <PrintIcon className="w-4 h-4 mr-2" />
        Print
      </button>
    </div>
  );
};
