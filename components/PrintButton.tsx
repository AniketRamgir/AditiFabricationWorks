import React from 'react';

interface PrintButtonProps {
  isPrinting: boolean;
  onPrint: () => void;
}

const PrintButton: React.FC<PrintButtonProps> = ({ isPrinting, onPrint }) => {
  return (
    <div className="w-full max-w-4xl mt-6 no-print">
      <button 
        onClick={onPrint}
        disabled={isPrinting}
        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isPrinting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating PDF...
          </>
        ) : (
          'Print / Save as PDF'
        )}
      </button>
    </div>
  );
};

export default PrintButton;
