import React from 'react';

interface LandingPageProps {
  onNavigateToInvoice: () => void;
  onNavigateToAnalytics: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToInvoice, onNavigateToAnalytics }) => {
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col justify-center items-center text-white p-4">
      <div className="text-center animate-fade-in-down">
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-2 tracking-wide">ADITI FABRICATION WORKS</h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-8">Professional Fabricators</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNavigateToInvoice}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
          >
            Create New Invoice
          </button>
          <button
            onClick={onNavigateToAnalytics}
            className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
          >
            View Analytics
          </button>
        </div>
      </div>
      <footer className="absolute bottom-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Aditi Fabrication Works. All rights reserved.</p>
      </footer>
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
