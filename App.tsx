import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Invoice from './components/Invoice';

const App: React.FC = () => {
  const [view, setView] = useState('landing');

  return (
    <div className="bg-gray-50 min-h-screen">
      {view === 'landing' && <LandingPage onStart={() => setView('invoice')} />}
      {view === 'invoice' && <Invoice onBack={() => setView('landing')} />}
    </div>
  );
};

export default App;
