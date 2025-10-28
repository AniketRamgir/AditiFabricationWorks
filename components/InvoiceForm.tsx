import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { InvoiceItem, SavedInvoice } from '../types';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface InvoiceFormProps {
  onNavigateHome: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onNavigateHome }) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: Date.now().toString(), description: '', quantity: 0, rate: 0 },
  ]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => total + (item.quantity * item.rate), 0);
  }, [items]);

  const resetForm = useCallback(() => {
    // Save invoice data before resetting the form
    if (customerName && totalAmount > 0) {
      const savedInvoices: SavedInvoice[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const newInvoice: SavedInvoice = {
        invoiceNumber,
        customerName,
        invoiceDate,
        totalAmount,
        paymentStatus: 'Pending',
        amountPaid: 0,
      };
      savedInvoices.push(newInvoice);
      localStorage.setItem('invoices', JSON.stringify(savedInvoices));
    }
  
    setInvoiceNumber('');
    setCustomerName('');
    setCustomerAddress('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setItems([{ id: Date.now().toString(), description: '', quantity: 0, rate: 0 }]);
  }, [invoiceNumber, customerName, invoiceDate, totalAmount]);

  const numberToWordsInr = (num: number): string => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

      const toWords = (nStr: string): string => {
          let n = parseInt(nStr, 10);
          if (n === 0) return '';
          let words = '';
          if (n >= 100) {
              words += ones[Math.floor(n / 100)] + ' Hundred ';
              n %= 100;
          }
          if (n >= 10 && n <= 19) {
              words += teens[n - 10] + ' ';
          } else {
              if (n >= 20) {
                  words += tens[Math.floor(n / 10)] + ' ';
                  n %= 10;
              }
              if (n >= 1 && n <= 9) {
                  words += ones[n] + ' ';
              }
          }
          return words;
      };

      if (num === 0) return 'Zero Only';
      
      const numStr = Math.floor(num).toString();
      if (numStr.length > 9) return 'Number too large';

      const crore = numStr.length > 7 ? numStr.slice(0, -7) : '';
      const lakh = numStr.length > 5 ? numStr.slice(-7, -5) : '';
      const thousand = numStr.length > 3 ? numStr.slice(-5, -3) : '';
      const hundreds = numStr.slice(-3);

      let output = '';
      if (crore) output += toWords(crore) + 'Crore ';
      if (lakh) output += toWords(lakh) + 'Lakh ';
      if (thousand) output += toWords(thousand) + 'Thousand ';
      if (hundreds) output += toWords(hundreds);
      
      return (output.trim().replace(/\s+/g, ' ') + ' Only');
  };


  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 0, rate: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = <K extends keyof InvoiceItem>(id: string, field: K, value: InvoiceItem[K]) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (isPrinting) {
      const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;

      const invoiceElement = document.getElementById('invoice-to-print');

      if (!invoiceElement || !jsPDF || !html2canvas) {
        alert('Could not generate PDF. Please try again.');
        setIsPrinting(false);
        return;
      }

      html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight,
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasAspectRatio = canvas.width / canvas.height;
        
        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / canvasAspectRatio;

        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = imgHeight * canvasAspectRatio;
        }
        
        const xOffset = (pdfWidth - imgWidth) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, 0, imgWidth, imgHeight);
        pdf.save(`Invoice-${invoiceNumber || 'NA'}-${customerName.replace(/\s+/g, '_') || 'customer'}.pdf`);
        
        resetForm();
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

      }).catch(err => {
          console.error("Error generating PDF:", err);
          alert("Sorry, there was an error generating the PDF.");
      }).finally(() => {
        setIsPrinting(false);
      });
    }
  }, [isPrinting, invoiceNumber, customerName, resetForm]);
  
  const handlePrintClick = () => {
    setIsPrinting(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-2 sm:p-4">
      {showSuccessMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-6 rounded-lg shadow-lg z-50 animate-fade-in-out">
          Successfully Saved as PDF!
        </div>
      )}
       <style>{`
        @keyframes fade-in-out {
            0% { opacity: 0; transform: translate(-50%, -20px); }
            10% { opacity: 1; transform: translate(-50%, 0); }
            90% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -20px); }
        }
        .animate-fade-in-out {
            animation: fade-in-out 3s ease-in-out forwards;
        }
    `}</style>
      
      <div className="w-full max-w-4xl mx-auto flex justify-between items-center mb-4 no-print">
        <h1 className="text-2xl font-bold text-gray-700">Create New Invoice</h1>
        <button 
          onClick={onNavigateHome}
          className="bg-gray-600 text-white font-bold py-2 px-5 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
        >
          Back to Home
        </button>
      </div>

      <div id="invoice-to-print" className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg print-container">
        {/* Invoice Header */}
        <header className="px-4 sm:px-8 py-6 bg-gray-800 text-white rounded-t-lg">
           <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 sm:gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-4xl font-bold break-words">ADITI FABRICATION WORKS</h1>
              <p className="text-gray-300 text-xs sm:text-sm mt-1 break-words">Sr. no. 27/3, behind HOG Industries, Somnath mala, kharadi, Pune 411014</p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">Email: balkrushnaramgir@gmail.com | Phone: 8999853711</p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-300 self-center sm:self-end mt-4 sm:mt-0">INVOICE</h2>
          </div>
        </header>

        <main className="p-4 sm:p-8">
          {/* Customer Details */}
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
                  />
                  <textarea
                    placeholder="Customer Address"
                    className="w-full p-2 border rounded-md h-20"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  ></textarea>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2 items-start md:items-end">
                <div className="flex items-center w-full md:w-auto">
                    <label className="font-semibold text-gray-600 w-24">Invoice #:</label>
                    {isPrinting ? <span className="p-2 font-medium">{invoiceNumber}</span> : <input type="text" placeholder="e.g., 001" className="p-2 border rounded-md flex-1" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />}
                </div>
                <div className="flex items-center w-full md:w-auto">
                    <label className="font-semibold text-gray-600 w-24">Date:</label>
                    {isPrinting ? <span className="p-2 font-medium">{invoiceDate}</span> : <input type="date" className="p-2 border rounded-md flex-1" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />}
                </div>
            </div>
          </section>

          {/* Items Section - Adaptive Layout */}
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
                     {isPrinting ? <div className="p-1 whitespace-pre-line break-all">{item.description}</div> : (
                      <textarea
                        placeholder={`Item ${index + 1}`}
                        className="w-full p-1 border rounded md:border-transparent focus:border-gray-300 focus:ring-0"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        rows={1}
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
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
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
                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
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
                      <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100">
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
              <button onClick={handleAddItem} className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold no-print">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Add Item
              </button>
            )}
          </section>

          {/* Total and Amount in Words */}
          <section className="flex flex-col items-end mt-16">
            <div className="w-full md:w-1/2 lg:w-2/5">
              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                <span className="text-xl font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-extrabold text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="mt-4 px-2">
                 <div className="flex items-baseline">
                    <span className="font-semibold text-gray-700 mr-2 text-sm">In words:</span>
                    <p className="flex-1 border-b border-gray-400 border-dotted pb-1 font-semibold text-gray-800 text-sm">
                        {numberToWordsInr(totalAmount)}
                    </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Footer / Signature */}
           <footer className="mt-16 text-center text-gray-500 text-sm sm:text-base">
            <div className="border-t pt-4">
                <p>For Aditi Fabrication Works</p>
                <div className="h-16 sm:h-20"></div>
                <p>(Authorized Signatory)</p>
            </div>
            <p className="mt-8 text-xs sm:text-sm">Thank you for your business!</p>
          </footer>
        </main>
      </div>

      <div className="w-full max-w-4xl mt-6 no-print">
        <button 
          onClick={handlePrintClick}
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
    </div>
  );
};

export default InvoiceForm;