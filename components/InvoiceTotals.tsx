import React from 'react';
import { formatCurrency } from '../utils/helpers';

interface InvoiceTotalsProps {
  totalAmount: number;
  numberToWords: (num: number) => string;
}

const InvoiceTotals: React.FC<InvoiceTotalsProps> = ({ totalAmount, numberToWords }) => {
  return (
    <section className="flex flex-col items-end">
      <div className="w-full md:w-1/2 lg:w-2/5">
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
          <span className="text-xl font-bold text-gray-800">Total Amount</span>
          <span className="text-2xl font-extrabold text-blue-600">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="mt-4 px-2">
           <div className="flex items-baseline">
              <span className="font-semibold text-gray-700 mr-2 text-sm">In words:</span>
              <p className="flex-1 border-b border-gray-400 border-dotted pb-1 font-semibold text-gray-800 text-sm">
                  {numberToWords(totalAmount)}
              </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvoiceTotals;
