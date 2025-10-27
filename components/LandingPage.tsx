import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <header className="mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800">Aditi Fabrication Works</h1>
        <p className="text-lg md:text-xl text-gray-600 mt-2">Professional Invoicing Made Simple</p>
      </header>
      <main className="mb-8">
        <p className="max-w-2xl mx-auto text-gray-700">
          Welcome to your modern billing solution. Create, manage, and print professional invoices with ease. Our tool is designed to be fast, reliable, and work offline.
        </p>
      </main>
      <button
        onClick={onStart}
        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
      >
        Create New Invoice
      </button>
      <footer className="fixed bottom-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Aditi Fabrication Works. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
