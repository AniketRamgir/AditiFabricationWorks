export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Received';

export interface SavedInvoice {
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
}