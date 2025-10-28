import React, { useMemo, useState, useEffect } from 'react';
import type { SavedInvoice, PaymentStatus } from '../types';

interface AnalyticsPageProps {
  onNavigateHome: () => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigateHome }) => {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  // State for payment update modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<SavedInvoice | null>(null);
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');

  useEffect(() => {
    const storedInvoices: SavedInvoice[] = JSON.parse(localStorage.getItem('invoices') || '[]');
    setInvoices(storedInvoices);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  const monthlyChartData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      totalInvoiced: 0,
      totalPaid: 0,
    }));

    invoices
      .filter(inv => new Date(inv.invoiceDate).getFullYear() === selectedYear)
      .forEach(inv => {
        const month = new Date(inv.invoiceDate).getMonth();
        data[month].totalInvoiced += inv.totalAmount;
        data[month].totalPaid += inv.amountPaid;
      });
    
    return data;
  }, [invoices, selectedYear]);

  const maxMonthlyInvoiced = useMemo(() => 
    Math.max(1, ...monthlyChartData.map(d => d.totalInvoiced))
  , [monthlyChartData]);


  const yearlySales = useMemo(() => {
    const salesData: { [key: string]: number } = {};

    invoices.forEach(inv => {
      const year = new Date(inv.invoiceDate).getFullYear();
      if (!salesData[year]) {
        salesData[year] = 0;
      }
      salesData[year] += inv.totalAmount;
    });

    // Fix: Sort sales data by year in descending order, parsing string keys to numbers.
    return Object.entries(salesData).sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));
  }, [invoices]);
  
  const availableYears = useMemo(() => {
      const years = new Set(invoices.map(inv => new Date(inv.invoiceDate).getFullYear()));
      const currentYear = new Date().getFullYear();
      if (!years.has(currentYear)) {
          years.add(currentYear);
      }
      // Fix: Add explicit types to sort arguments to resolve TypeScript inference issue.
      return Array.from(years).sort((a: number, b: number) => b - a);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invDate = new Date(inv.invoiceDate);
      return invDate.getFullYear() === selectedYear && invDate.getMonth() === selectedMonth;
    }).sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());
  }, [invoices, selectedYear, selectedMonth]);
  
  const handleOpenModal = (invoice: SavedInvoice) => {
    setCurrentInvoice(invoice);
    setPaidAmountInput(invoice.amountPaid > 0 ? String(invoice.amountPaid) : '');
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentInvoice(null);
    setPaidAmountInput('');
  };
  
  const handleUpdatePayment = () => {
    if (!currentInvoice) return;

    const newAmountPaid = Number(paidAmountInput) || 0;
    let newStatus: PaymentStatus;

    if (newAmountPaid <= 0) {
      newStatus = 'Pending';
    } else if (newAmountPaid >= currentInvoice.totalAmount) {
      newStatus = 'Received';
    } else {
      newStatus = 'Partially Paid';
    }

    const updatedInvoices = invoices.map(inv => 
      inv.invoiceNumber === currentInvoice.invoiceNumber 
        ? { ...inv, amountPaid: newAmountPaid, paymentStatus: newStatus } 
        : inv
    );

    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    handleCloseModal();
  };


  const handleExport = () => {
    if (filteredInvoices.length === 0) {
      alert("No data to export for the selected period.");
      return;
    }

    const headers = ["Invoice #", "Customer Name", "Invoice Date", "Total Amount", "Amount Paid", "Amount Remaining", "Payment Status"];
    const csvRows = [
      headers.join(','),
      ...filteredInvoices.map(inv => {
        const amountRemaining = inv.totalAmount - inv.amountPaid;
        const row = [
          `"${inv.invoiceNumber}"`,
          `"${inv.customerName.replace(/"/g, '""')}"`,
          `"${inv.invoiceDate}"`,
          inv.totalAmount,
          inv.amountPaid,
          amountRemaining,
          `"${inv.paymentStatus}"`
        ];
        return row.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    link.setAttribute("download", `Invoices_${selectedYear}-${monthStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const statusColors: { [key in PaymentStatus]: string } = {
    'Pending': 'bg-yellow-500 hover:bg-yellow-600',
    'Partially Paid': 'bg-blue-500 hover:bg-blue-600',
    'Received': 'bg-green-500 hover:bg-green-600',
  };


  if (invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">Sales Analytics</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-600 text-lg">No invoice data available to display analytics.</p>
          <p className="text-gray-500 mt-2">Please create some invoices first.</p>
        </div>
         <button 
            onClick={onNavigateHome}
            className="mt-8 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Sales Analytics</h1>
          <button 
              onClick={onNavigateHome}
              className="bg-gray-600 text-white font-bold py-2 px-5 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
          >
            Back to Home
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Sales Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Monthly Sales ({selectedYear})</h2>
             <div className="flex justify-between items-end h-80 border-b border-l border-gray-300 p-4">
              {monthlyChartData.map((data, index) => {
                  const totalBarHeightPercent = (data.totalInvoiced / maxMonthlyInvoiced) * 100;
                  const paidPercent = data.totalInvoiced > 0 ? (data.totalPaid / data.totalInvoiced) * 100 : 0;
                  const remainingPercent = 100 - paidPercent;

                  return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                          {/* Tooltip */}
                          {data.totalInvoiced > 0 && (
                              <div className="opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded py-2 px-3 absolute -top-14 left-1/2 -translate-x-1/2 w-max transition-opacity z-10 pointer-events-none shadow-lg">
                                  <p className="font-bold border-b border-gray-600 pb-1 mb-1">Total: {formatCurrency(data.totalInvoiced)}</p>
                                  <p>Paid: {formatCurrency(data.totalPaid)}</p>
                                  <p>Remaining: {formatCurrency(data.totalInvoiced - data.totalPaid)}</p>
                              </div>
                          )}
                          
                          {/* Bar Container */}
                          <div 
                              className="w-3/4 sm:w-1/2 flex flex-col justify-end rounded-t-sm overflow-hidden"
                              style={{ height: `${totalBarHeightPercent}%` }}
                          >
                              <div 
                                  className="bg-green-400 hover:opacity-80 transition-opacity"
                                  title="Amount Remaining"
                                  style={{ height: `${remainingPercent}%` }}
                              ></div>
                              <div 
                                  className="bg-blue-500 hover:opacity-80 transition-opacity"
                                  title="Amount Paid"
                                  style={{ height: `${paidPercent}%` }}
                              ></div>
                          </div>

                          <span className="text-xs text-gray-500 mt-2">{monthLabels[index]}</span>
                      </div>
                  )
              })}
            </div>
          </div>

          {/* Yearly Sales Table */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Yearly Sales</h2>
            <div className="overflow-auto max-h-96">
                <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-100">
                    <tr>
                    <th className="p-3 font-semibold text-gray-600">Year</th>
                    <th className="p-3 font-semibold text-gray-600 text-right">Total Sales</th>
                    </tr>
                </thead>
                <tbody>
                    {yearlySales.map(([year, total]) => (
                    <tr key={year} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{year}</td>
                        <td className="p-3 text-gray-700 text-right font-mono">{formatCurrency(total)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>

          {/* Invoice Details Table */}
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 sm:mb-0">Invoice Details</h2>
                <button 
                  onClick={handleExport}
                  disabled={filteredInvoices.length === 0}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Export to Excel
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">Year</label>
                <select id="year-select" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Month</label>
                <select id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  {monthLabels.map((month, index) => <option key={index} value={index}>{month}</option>)}
                </select>
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 font-semibold text-gray-600">Invoice #</th>
                      <th className="p-3 font-semibold text-gray-600">Customer</th>
                      <th className="p-3 font-semibold text-gray-600">Date</th>
                      <th className="p-3 font-semibold text-gray-600 text-right">Total Amt</th>
                      <th className="p-3 font-semibold text-gray-600 text-right">Paid</th>
                      <th className="p-3 font-semibold text-gray-600 text-right">Remaining</th>
                      <th className="p-3 font-semibold text-gray-600 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map(inv => (
                        <tr key={inv.invoiceNumber} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-800">{inv.invoiceNumber}</td>
                          <td className="p-3 text-gray-700">{inv.customerName}</td>
                          <td className="p-3 text-gray-700">{inv.invoiceDate}</td>
                          <td className="p-3 text-gray-700 text-right font-mono">{formatCurrency(inv.totalAmount)}</td>
                          <td className="p-3 text-gray-700 text-right font-mono">{formatCurrency(inv.amountPaid)}</td>
                          <td className="p-3 text-gray-700 text-right font-mono">{formatCurrency(inv.totalAmount - inv.amountPaid)}</td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => handleOpenModal(inv)}
                              className={`py-1 px-3 text-xs font-bold rounded-full text-white transition-colors ${statusColors[inv.paymentStatus]}`}
                            >
                              {inv.paymentStatus}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center p-6 text-gray-500">No invoices found for the selected period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(inv => (
                  <div key={inv.invoiceNumber} className="bg-gray-50 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800">Inv #{inv.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{inv.customerName}</p>
                        <p className="text-xs text-gray-500">{inv.invoiceDate}</p>
                      </div>
                      <button 
                        onClick={() => handleOpenModal(inv)}
                        className={`py-1 px-3 text-xs font-bold rounded-full text-white transition-colors ${statusColors[inv.paymentStatus]}`}
                      >
                        {inv.paymentStatus}
                      </button>
                    </div>
                    <div className="mt-4 pt-2 border-t grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-medium text-sm">{formatCurrency(inv.totalAmount)}</p>
                      </div>
                       <div>
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="font-medium text-sm text-green-600">{formatCurrency(inv.amountPaid)}</p>
                      </div>
                       <div>
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className="font-medium text-sm text-red-600">{formatCurrency(inv.totalAmount - inv.amountPaid)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                 <div className="text-center p-6 text-gray-500">No invoices found for the selected period.</div>
              )}
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && currentInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Update Payment for Invoice #{currentInvoice.invoiceNumber}</h3>
            <p className="text-gray-600 mb-4">Total Amount: <span className="font-semibold">{formatCurrency(currentInvoice.totalAmount)}</span></p>
            <div>
              <label htmlFor="amount-paid" className="block text-sm font-medium text-gray-700">Amount Received</label>
              <input 
                type="number"
                id="amount-paid"
                value={paidAmountInput}
                onChange={(e) => setPaidAmountInput(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount paid"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={handleUpdatePayment} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Payment</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalyticsPage;