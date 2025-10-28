import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import InvoiceForm from './components/InvoiceForm';
import AnalyticsPage from './components/AnalyticsPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'invoice' | 'analytics'>('landing');

  const navigateToInvoice = () => {
    setCurrentPage('invoice');
  };

  const navigateToAnalytics = () => {
    setCurrentPage('analytics');
  };

  const navigateToHome = () => {
    setCurrentPage('landing');
  };

  if (currentPage === 'landing') {
    return <LandingPage onNavigateToInvoice={navigateToInvoice} onNavigateToAnalytics={navigateToAnalytics} />;
  }

  if (currentPage === 'analytics') {
    return <AnalyticsPage onNavigateHome={navigateToHome} />;
  }

  return <InvoiceForm onNavigateHome={navigateToHome} />;
};

export default App;
