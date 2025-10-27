import React, { useState, useMemo, useEffect } from 'react';
import type { InvoiceItem } from '../types';
import { numberToWordsInr, formatCurrency } from '../utils/helpers';
import InvoiceHeader from './InvoiceHeader';
import CustomerDetails from './CustomerDetails';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoiceTotals from './InvoiceTotals';
import InvoiceFooter from './InvoiceFooter';
import PrintButton from './PrintButton';


declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface InvoiceProps {
  onBack: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ onBack }) => {
  const [invoiceNumber, setInvoiceNumber] = useState('001');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: Date.now().toString(), description: '', quantity: 0, rate: 0 },
  ]);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const resetForm = () => {
    const nextInvoiceNumber = String(parseInt(invoiceNumber, 10) + 1).padStart(3, '0');
    setInvoiceNumber(nextInvoiceNumber);
    setCustomerName('');
    setCustomerAddress('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setItems([{ id: Date.now().toString(), description: '', quantity: 0, rate: 0 }]);
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

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => total + (item.quantity * item.rate), 0);
  }, [items]);

  const generatePdf = () => {
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
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

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
      pdf.save(`Invoice-${invoiceNumber}-${customerName.replace(/\s+/g, '_') || 'customer'}.pdf`);
      
      resetForm();

    }).catch(err => {
        console.error("Error generating PDF:", err);
        alert("Sorry, there was an error generating the PDF.");
    }).finally(() => {
      setIsPrinting(false);
    });
  };
  
  useEffect(() => {
    if (isPrinting) {
      generatePdf();
    }
  }, [isPrinting]);

  const handlePrintClick = () => {
    setIsPrinting(true);
  };

  return (
    <div className="flex flex-col items-center p-2 sm:p-4">
       <div className="w-full max-w-4xl no-print mb-4">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Home
        </button>
      </div>

      <div id="invoice-to-print" className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg print-container">
        <InvoiceHeader />
        <main className="p-4 sm:p-8">
          <CustomerDetails
            isPrinting={isPrinting}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            invoiceDate={invoiceDate}
            setInvoiceDate={setInvoiceDate}
          />
          <InvoiceItemsTable
            items={items}
            isPrinting={isPrinting}
            onItemChange={handleItemChange}
            onRemoveItem={handleRemoveItem}
            onAddItem={handleAddItem}
          />
          <InvoiceTotals
            totalAmount={totalAmount}
            numberToWords={numberToWordsInr}
          />
          <InvoiceFooter />
        </main>
      </div>
      <PrintButton isPrinting={isPrinting} onPrint={handlePrintClick} />
    </div>
  );
};

export default Invoice;
