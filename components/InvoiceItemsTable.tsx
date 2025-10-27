import React from 'react';
import type { InvoiceItem } from '../types';
import { formatCurrency } from '../utils/helpers';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  isPrinting: boolean;
  onItemChange: <K extends keyof InvoiceItem>(id: string, field: K, value: InvoiceItem[K]) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: () => void;
}

const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  items,
  isPrinting,
  onItemChange,
  onRemoveItem,
  onAddItem,
}) => {
  return (
    <section className="mb-8">
      {/* Desktop Table Head */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[4rem,1fr,6rem,8rem,10rem,3rem] gap-4 bg-gray-100 p-3 rounded-t-lg font-semibold text-gray-600 text-left">
          <div className="text-center">Sr. No.</div>
          <div>Description</div>
          <div className="text-center">Qty</div>
          <div className="text-right">Rate</div>
          <div className="text-right">Amount</div>
          {!isPrinting && <div className="no-print"></div>}
        </div>
      </div>
      
      {/* Items List - Renders as cards on mobile, table rows on desktop */}
      <div className="space-y-4 md:space-y-0">
        {items.map((item, index) => (
          <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm md:border-none md:p-0 md:shadow-none md:grid md:grid-cols-[4rem,1fr,6rem,8rem,10rem,3rem] md:gap-4 md:items-center md:border-b">
            {/* Sr. No. */}
            <div className="flex justify-between items-center md:block">
                <div className="font-bold text-gray-800 md:text-center">{index + 1}</div>
                <div className="md:hidden font-semibold text-gray-500 text-sm">ITEM #{index + 1}</div>
            </div>
            
            {/* Description */}
            <div className="mt-2 md:mt-0">
              <div className="md:hidden text-sm font-semibold text-gray-600 mb-1">Description</div>
               {isPrinting ? <div className="p-1">{item.description}</div> : (
                <input
                  type="text"
                  placeholder={`Item ${index + 1}`}
                  className="w-full p-1 border rounded md:border-transparent focus:border-gray-300 focus:ring-0"
                  value={item.description}
                  onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
                  aria-label={`Item ${index+1} description`}
                />
              )}
            </div>
            
            {/* Mobile Layout for Qty, Rate, Amount */}
            <div className="grid grid-cols-3 gap-2 mt-4 md:contents">
              {/* Qty */}
              <div className="md:text-center">
                  <div className="md:hidden text-sm font-semibold text-gray-600 mb-1">Qty</div>
                  {isPrinting ? <div className="p-1 md:text-center">{item.quantity}</div> : (
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full p-1 text-center border rounded md:border-transparent focus:border-gray-300 focus:ring-0"
                      value={item.quantity || ''}
                      onChange={(e) => onItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      aria-label={`Item ${index+1} quantity`}
                    />
                  )}
              </div>
              {/* Rate */}
              <div className="md:text-right">
                  <div className="md:hidden text-sm font-semibold text-gray-600 mb-1">Rate</div>
                  {isPrinting ? <div className="p-1 md:text-right">{new Intl.NumberFormat('en-IN').format(item.rate)}</div> : (
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full p-1 text-right border rounded md:border-transparent focus:border-gray-300 focus:ring-0"
                      value={item.rate || ''}
                      onChange={(e) => onItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      aria-label={`Item ${index+1} rate`}
                    />
                  )}
              </div>
               {/* Amount */}
              <div className="md:text-right">
                  <div className="md:hidden text-sm font-semibold text-gray-600 mb-1">Amount</div>
                  <div className="p-1 font-medium text-gray-800 text-right">
                      {formatCurrency(item.quantity * item.rate)}
                  </div>
              </div>
            </div>

            {/* Delete Button */}
            {!isPrinting && (
              <div className="text-right mt-2 md:mt-0 md:text-center no-print">
                <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100" aria-label={`Remove item ${index+1}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isPrinting && (
        <button onClick={onAddItem} className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold no-print">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Item
        </button>
      )}
    </section>
  );
};

export default InvoiceItemsTable;
