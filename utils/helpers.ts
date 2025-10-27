export const numberToWordsInr = (num: number): string => {
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

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
