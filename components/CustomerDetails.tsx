import React from 'react';

interface CustomerDetailsProps {
  isPrinting: boolean;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (num: string) => void;
  invoiceDate: string;
  setInvoiceDate: (date: string) => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  isPrinting,
  customerName,
  setCustomerName,
  customerAddress,
  setCustomerAddress,
  invoiceNumber,
  setInvoiceNumber,
  invoiceDate,
  setInvoiceDate,
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Bill To:</h3>
        {isPrinting ? (
          <div className="p-2 space-y-1 text-sm sm:text-base">
            <p className="font-semibold text-gray-800">{customerName || 'N/A'}</p>
            <p className="text-gray-600 whitespace-pre-line">{customerAddress || 'N/A'}</p>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Customer Name"
              className="w-full p-2 border rounded-md mb-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              aria-label="Customer Name"
            />
            <textarea
              placeholder="Customer Address"
              className="w-full p-2 border rounded-md h-20"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              aria-label="Customer Address"
            ></textarea>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2 items-start md:items-end">
          <div className="flex items-center w-full md:w-auto">
              <label htmlFor="invoice-number" className="font-semibold text-gray-600 w-24">Invoice #:</label>
              {isPrinting ? <span className="p-2 font-medium">{invoiceNumber}</span> : <input id="invoice-number" type="text" className="p-2 border rounded-md flex-1" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />}
          </div>
          <div className="flex items-center w-full md:w-auto">
              <label htmlFor="invoice-date" className="font-semibold text-gray-600 w-24">Date:</label>
              {isPrinting ? <span className="p-2 font-medium">{invoiceDate}</span> : <input id="invoice-date" type="date" className="p-2 border rounded-md flex-1" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />}
          </div>
      </div>
    </section>
  );
};

export default CustomerDetails;
