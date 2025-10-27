import React from 'react';

const InvoiceHeader: React.FC = () => {
  return (
    <header className="px-4 sm:px-8 py-6 bg-gray-800 text-white rounded-t-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-center sm:text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold break-words">ADITI FABRICATION WORKS</h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-1">Sr. no. 27/3, behind HOG Industries, Somnath mala, kharadi, Pune 411014</p>
          <p className="text-gray-300 text-xs sm:text-sm mt-1">Email: balkrushnaramgir@gmail.com | Phone: 8999853711</p>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-blue-300 self-center sm:self-auto mt-2 sm:mt-0">INVOICE</h2>
      </div>
    </header>
  );
};

export default InvoiceHeader;
