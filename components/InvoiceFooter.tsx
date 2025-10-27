import React from 'react';

const InvoiceFooter: React.FC = () => {
  return (
    <footer className="mt-16 text-center text-gray-500 text-sm sm:text-base">
      <div className="border-t pt-4">
          <p>For Aditi Fabrication Works</p>
          <div className="h-16 sm:h-20"></div>
          <p>(Authorized Signatory)</p>
      </div>
      <p className="mt-8 text-xs sm:text-sm">Thank you for your business!</p>
    </footer>
  );
};

export default InvoiceFooter;
